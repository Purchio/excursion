import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TimedSong } from '../types/song';
import { useCalibration } from '../context/CalibrationContext';
import { useMidiPlayback } from '../hooks/useMidiPlayback';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { notesMatchCalibrated } from '../utils/calibratedPitch';
import { FULL_KEYBOARD_END, FULL_KEYBOARD_START } from '../utils/keyboardLayout';
import { formatDuration, getNotesAtHitLine } from '../utils/songUtils';
import { midiToNote } from '../utils/noteUtils';
import { CalibratedCameraView } from './CalibratedCameraView';
import { DetectionDebug } from './DetectionDebug';
import { FallingNotes } from './FallingNotes';
import { KeyMatchBanner } from './KeyMatchBanner';
import { MicPermissionHelp } from './MicPermissionHelp';
import { PianoKeyboard } from './PianoKeyboard';
import { queryMicPermission } from '../utils/deviceUtils';

interface ScrollPracticeModeProps {
  song: TimedSong;
  onBack: () => void;
  onSwitchToGuided?: () => void;
}

export function ScrollPracticeMode({ song, onBack, onSwitchToGuided }: ScrollPracticeModeProps) {
  const { calibration } = useCalibration();
  const [micEnabled, setMicEnabled] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [hitCount, setHitCount] = useState(0);
  const scoredRef = useRef<Set<string>>(new Set());

  const audioKeys = calibration?.audioKeys ?? [];

  const {
    isListening,
    detectedMidi,
    detectedNote,
    volume,
    rawFrequency,
    error: micError,
    startListening,
    stopListening,
  } = usePitchDetection();

  const onComplete = useCallback(() => {
    if (micEnabled) stopListening();
  }, [micEnabled, stopListening]);

  const {
    isPlaying,
    currentTimeMs,
    speed,
    setSpeed,
    play,
    pause,
    resume,
    stop,
  } = useMidiPlayback({ notes: song.notes, onComplete });

  const activeAtHit = useMemo(
    () => getNotesAtHitLine(song.notes, currentTimeMs, 150),
    [song.notes, currentTimeMs],
  );

  const expectedMidi = activeAtHit[0]?.midi ?? null;
  const highlightMidis = activeAtHit.map((n) => n.midi);

  useEffect(() => {
    void queryMicPermission().then(setMicPermission);
  }, []);

  useEffect(() => {
    if (!micEnabled || !isPlaying) return;
    for (const note of activeAtHit) {
      const key = `${note.midi}-${note.startMs}`;
      if (scoredRef.current.has(key)) continue;
      if (notesMatchCalibrated(detectedMidi, note.midi, audioKeys)) {
        scoredRef.current.add(key);
        setHitCount((c) => c + 1);
      }
    }
  }, [detectedMidi, activeAtHit, micEnabled, isPlaying, audioKeys]);

  const handleStart = async () => {
    scoredRef.current.clear();
    setHitCount(0);
    if (micEnabled) await startListening();
    await play();
  };

  const handlePause = () => {
    pause();
    if (micEnabled) stopListening();
  };

  const handleResume = async () => {
    if (micEnabled) await startListening();
    await resume();
  };

  const handleStop = () => {
    stop();
    if (micEnabled) stopListening();
    scoredRef.current.clear();
  };

  const progress = song.durationMs > 0 ? currentTimeMs / song.durationMs : 0;

  return (
    <div className="practice-mode scroll-practice">
      <header className="practice-header">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Songs
        </button>
        <div className="practice-title">
          <h2>{song.title}</h2>
          <span>{song.artist}</span>
        </div>
        <button
          type="button"
          className={`btn-icon ${showCamera ? 'active' : ''}`}
          onClick={() => setShowCamera((v) => !v)}
          title="Toggle camera"
        >
          📷
        </button>
      </header>

      <div className="scroll-toolbar">
        <span className="mode-badge">Scroll mode</span>
        {onSwitchToGuided && (
          <button type="button" className="btn-text" onClick={onSwitchToGuided}>
            Switch to guided
          </button>
        )}
        <label className="toggle-mic">
          <input
            type="checkbox"
            checked={micEnabled}
            onChange={(e) => setMicEnabled(e.target.checked)}
          />
          Mic verify
        </label>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="time-line">
        {formatDuration(currentTimeMs)} / {formatDuration(song.durationMs)}
      </p>

      <FallingNotes
        notes={song.notes}
        currentTimeMs={currentTimeMs}
        startMidi={song.startMidi}
        endMidi={song.endMidi}
      />

      {!isPlaying && currentTimeMs === 0 ? (
        <div className="note-prompt">
          <p className="prompt-label">Falling notes + playback</p>
          <p className="prompt-hint">
            Blue = right hand, red = left. Numbers show suggested fingers.
            {micEnabled
              ? ' Your mic verifies keys on your real piano as notes hit the line.'
              : ' Mic verification is off — listen and follow the falling notes.'}
          </p>
          {micEnabled && (
            <MicPermissionHelp
              onRequestMic={handleStart}
              isListening={isListening}
              error={micError}
              permissionState={micPermission}
            />
          )}
        </div>
      ) : (
        <>
          <PianoKeyboard
            startMidi={song.startMidi}
            endMidi={song.endMidi}
            highlightedMidi={expectedMidi}
            pressedMidi={detectedMidi}
            showFullKeyboard
            fullRangeStart={FULL_KEYBOARD_START}
            fullRangeEnd={FULL_KEYBOARD_END}
          />

          {micEnabled && (
            <>
              <KeyMatchBanner
                expectedMidi={expectedMidi}
                detectedMidi={detectedMidi}
                detectedNote={detectedNote}
                volume={volume}
              />
              <DetectionDebug
                volume={volume}
                detectedNote={detectedNote}
                detectedMidi={detectedMidi}
                expectedMidi={expectedMidi}
                rawFrequency={rawFrequency}
                sampleCount={0}
              />
            </>
          )}

          {highlightMidis.length > 0 && (
            <p className="active-notes-line">
              Now: {highlightMidis.map((m) => midiToNote(m)).join(' + ')}
              {activeAtHit[0]?.finger && ` · finger ${activeAtHit[0].finger}`}
            </p>
          )}
        </>
      )}

      <div className="playback-controls">
        {!isPlaying && currentTimeMs === 0 ? (
          <button type="button" className="btn-primary btn-large" onClick={handleStart}>
            {micEnabled ? 'Start with mic' : 'Start playback'}
          </button>
        ) : isPlaying ? (
          <button type="button" className="btn-secondary" onClick={handlePause}>
            Pause
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={handleResume}>
            Resume
          </button>
        )}
        {(isPlaying || currentTimeMs > 0) && (
          <button type="button" className="btn-secondary" onClick={handleStop}>
            Stop
          </button>
        )}
        <label className="speed-control">
          Speed
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5×</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.25}>1.25×</option>
          </select>
        </label>
      </div>

      {micEnabled && isPlaying && (
        <p className="score-line">
          {hitCount} verified
        </p>
      )}

      {micError && <p className="error-text">{micError}</p>}

      <CalibratedCameraView
        enabled={showCamera}
        highlightedMidi={expectedMidi}
        detectedMidi={detectedMidi}
      />
    </div>
  );
}
