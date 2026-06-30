import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TimedSong } from '../types/song';
import { useCalibration } from '../context/CalibrationContext';
import { useMidiPlayback } from '../hooks/useMidiPlayback';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { notesMatchCalibrated } from '../utils/calibratedPitch';
import { FULL_KEYBOARD_END, FULL_KEYBOARD_START } from '../utils/keyboardLayout';
import { formatDuration } from '../utils/songUtils';
import {
  formatLeadNotesLine,
  getLeadNotesAtHitLine,
  matchAnyExpected,
} from '../utils/scrollPractice';
import { CalibratedCameraView } from './CalibratedCameraView';
import { FallingNotes } from './FallingNotes';
import { MicPermissionHelp } from './MicPermissionHelp';
import { PianoKeyboard } from './PianoKeyboard';
import { ScrollMicBanner } from './ScrollMicBanner';
import { queryMicPermission } from '../utils/deviceUtils';

interface ScrollPracticeModeProps {
  song: TimedSong;
  onBack: () => void;
  onSwitchToGuided?: () => void;
}

export function ScrollPracticeMode({ song, onBack, onSwitchToGuided }: ScrollPracticeModeProps) {
  const { calibration } = useCalibration();
  // Mic off by default — full MIDI arrangements + speaker playback confuse pitch detection
  const [micEnabled, setMicEnabled] = useState(false);
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
  } = useMidiPlayback({
    notes: song.notes,
    muted: micEnabled,
    onComplete,
  });

  const leadAtHit = useMemo(
    () => getLeadNotesAtHitLine(song.notes, currentTimeMs, 150),
    [song.notes, currentTimeMs],
  );

  const primaryMidi = leadAtHit.find((n) => n.hand === 'right')?.midi
    ?? leadAtHit[0]?.midi
    ?? null;

  const matchedNote = useMemo(
    () =>
      matchAnyExpected(detectedMidi, leadAtHit, (d, e) =>
        notesMatchCalibrated(d, e, audioKeys),
      ),
    [detectedMidi, leadAtHit, audioKeys],
  );

  useEffect(() => {
    void queryMicPermission().then(setMicPermission);
  }, []);

  useEffect(() => {
    if (!micEnabled || !isPlaying || !matchedNote) return;
    const key = `${matchedNote.midi}-${matchedNote.startMs}`;
    if (scoredRef.current.has(key)) return;
    scoredRef.current.add(key);
    setHitCount((c) => c + 1);
  }, [matchedNote, micEnabled, isPlaying]);

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
  const leadLine = formatLeadNotesLine(leadAtHit);

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
        <label className="toggle-mic" title="Mutes speaker audio while on — mic only hears your piano">
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
        isPlaying={isPlaying}
      />

      {!isPlaying && currentTimeMs === 0 ? (
        <div className="note-prompt">
          <p className="prompt-label">Falling notes + playback</p>
          <p className="prompt-hint">
            Blue = right hand, red = left. Numbers = fingers.
            {micEnabled
              ? ' Mic verify is on — speaker audio mutes so the iPad only hears your piano.'
              : ' Turn on Mic verify to check keys on your real piano (speaker mutes automatically).'}
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
            highlightedMidi={primaryMidi}
            pressedMidi={detectedMidi}
            showFullKeyboard
            fullRangeStart={FULL_KEYBOARD_START}
            fullRangeEnd={FULL_KEYBOARD_END}
          />

          {micEnabled && (
            <ScrollMicBanner
              leadNotes={leadAtHit}
              detectedMidi={detectedMidi}
              detectedNote={detectedNote}
              volume={volume}
              matchedNote={matchedNote}
            />
          )}

          {leadLine && (
            <p className="active-notes-line">
              {micEnabled ? 'Target: ' : 'Now: '}{leadLine}
            </p>
          )}
        </>
      )}

      <div className="playback-controls">
        {!isPlaying && currentTimeMs === 0 ? (
          <button type="button" className="btn-primary btn-large" onClick={handleStart}>
            {micEnabled ? 'Start (mic on, audio muted)' : 'Start playback'}
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
        <p className="score-line">{hitCount} notes verified on your piano</p>
      )}

      {micError && <p className="error-text">{micError}</p>}

      <CalibratedCameraView
        enabled={showCamera}
        highlightedMidi={primaryMidi}
        detectedMidi={detectedMidi}
      />
    </div>
  );
}
