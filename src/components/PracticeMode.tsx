import { useCallback, useEffect, useRef, useState } from 'react';
import type { Song } from '../data/songs';
import { useCalibration } from '../context/CalibrationContext';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { notesMatchCalibrated } from '../utils/calibratedPitch';
import { FULL_KEYBOARD_END, FULL_KEYBOARD_START } from '../utils/keyboardLayout';
import { queryMicPermission } from '../utils/deviceUtils';
import { midiToNote } from '../utils/noteUtils';
import { CalibratedCameraView } from './CalibratedCameraView';
import { MicPermissionHelp } from './MicPermissionHelp';
import { PianoKeyboard } from './PianoKeyboard';

interface PracticeModeProps {
  song: Song;
  onBack: () => void;
  onSwitchToPlayAlong?: () => void;
}

type PracticeState = 'ready' | 'waiting' | 'correct' | 'complete';

export function PracticeMode({ song, onBack, onSwitchToPlayAlong }: PracticeModeProps) {
  const { calibration } = useCalibration();
  const [noteIndex, setNoteIndex] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>('ready');
  const [showCamera, setShowCamera] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const correctTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0);
  const holdStartRef = useRef<number>(0);

  const {
    isListening,
    detectedMidi,
    volume,
    error: micError,
    startListening,
    stopListening,
  } = usePitchDetection();

  const currentNote = song.notes[noteIndex];
  const progress = noteIndex / song.notes.length;
  const audioKeys = calibration?.audioKeys ?? [];

  const advanceNote = useCallback(() => {
    setPracticeState('correct');
    setCorrectCount((c) => c + 1);

    correctTimeoutRef.current = setTimeout(() => {
      if (noteIndex + 1 >= song.notes.length) {
        setPracticeState('complete');
      } else {
        setNoteIndex((i) => i + 1);
        setPracticeState('waiting');
        holdStartRef.current = 0;
      }
    }, 600);
  }, [noteIndex, song.notes.length]);

  useEffect(() => {
    if (practiceState !== 'waiting' || !isListening || !currentNote) return;

    if (notesMatchCalibrated(detectedMidi, currentNote.midi, audioKeys)) {
      if (holdStartRef.current === 0) {
        holdStartRef.current = Date.now();
      } else if (Date.now() - holdStartRef.current > 200) {
        advanceNote();
      }
    } else {
      holdStartRef.current = 0;
    }
  }, [detectedMidi, currentNote, practiceState, isListening, advanceNote, audioKeys]);

  useEffect(() => {
    void queryMicPermission().then(setMicPermission);
  }, []);

  useEffect(() => {
    return () => clearTimeout(correctTimeoutRef.current);
  }, []);

  const handleStart = async () => {
    await startListening();
    const perm = await queryMicPermission();
    setMicPermission(perm);
    setPracticeState('waiting');
    setNoteIndex(0);
    setCorrectCount(0);
  };

  const handleStop = () => {
    stopListening();
    setPracticeState('ready');
    setNoteIndex(0);
    setCorrectCount(0);
    clearTimeout(correctTimeoutRef.current);
  };

  const isCorrect = practiceState === 'correct';
  const expectedNote = currentNote ? midiToNote(currentNote.midi) : '';

  return (
    <div className="practice-mode">
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
        <span className="mode-badge">Guided mode</span>
        {onSwitchToPlayAlong && (
          <button type="button" className="btn-text" onClick={onSwitchToPlayAlong}>
            Switch to play along
          </button>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {practiceState === 'complete' ? (
        <div className="complete-screen">
          <div className="complete-icon">🎹</div>
          <h3>Nice work!</h3>
          <p>You played all {song.notes.length} notes of {song.title}.</p>
          <div className="complete-actions">
            <button type="button" className="btn-primary" onClick={handleStart}>
              Play again
            </button>
            <button type="button" className="btn-secondary" onClick={onBack}>
              Choose another song
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="note-prompt">
            {practiceState === 'ready' ? (
              <>
                <p className="prompt-label">Ready to learn?</p>
                <p className="prompt-hint">
                  Play each highlighted note on your <strong>real piano</strong>. The iPad listens
                  through the mic — you won't hear the song from the iPad speakers.
                </p>
                <MicPermissionHelp
                  onRequestMic={handleStart}
                  isListening={isListening}
                  error={micError}
                  permissionState={micPermission}
                />
              </>
            ) : (
              <>
                <p className="prompt-label">
                  {isCorrect ? 'Correct!' : `Note ${noteIndex + 1} of ${song.notes.length}`}
                </p>
                <p className="prompt-note">{expectedNote}</p>
                {currentNote?.finger && (
                  <p className="prompt-finger">
                    Use your {['', 'thumb', 'index finger', 'middle finger', 'ring finger', 'pinky'][currentNote.finger]}
                  </p>
                )}
              </>
            )}
          </div>

          {practiceState !== 'ready' && (
            <>
              <PianoKeyboard
                startMidi={song.startMidi}
                endMidi={song.endMidi}
                highlightedMidi={currentNote?.midi}
                pressedMidi={detectedMidi}
                correctMidi={isCorrect ? currentNote?.midi : null}
                showFinger={currentNote?.finger}
                showFullKeyboard
                fullRangeStart={FULL_KEYBOARD_START}
                fullRangeEnd={FULL_KEYBOARD_END}
              />

              {isListening && (
                <div className="mx-auto mt-2 h-1 max-w-xs overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-75"
                    style={{ width: `${Math.min(volume * 400, 100)}%` }}
                  />
                </div>
              )}
            </>
          )}

          {micError && practiceState !== 'ready' && <p className="error-text">{micError}</p>}

          <div className="practice-actions">
            {isListening ? (
              <button type="button" className="btn-secondary" onClick={handleStop}>
                Stop
              </button>
            ) : practiceState !== 'ready' ? (
              <button type="button" className="btn-primary btn-large" onClick={handleStart}>
                Start practice
              </button>
            ) : null}
          </div>

          {isListening && (
            <p className="score-line">
              {correctCount} note{correctCount !== 1 ? 's' : ''} correct so far
            </p>
          )}
        </>
      )}

      <CalibratedCameraView
        enabled={showCamera}
        highlightedMidi={practiceState === 'waiting' ? currentNote?.midi : null}
        detectedMidi={detectedMidi}
      />
    </div>
  );
}
