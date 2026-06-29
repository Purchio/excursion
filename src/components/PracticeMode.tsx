import { useCallback, useEffect, useRef, useState } from 'react';
import type { Song } from '../data/songs';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { midiToNote, notesMatch } from '../utils/noteUtils';
import { CameraView } from './CameraView';
import { PianoKeyboard } from './PianoKeyboard';

interface PracticeModeProps {
  song: Song;
  onBack: () => void;
}

type PracticeState = 'ready' | 'waiting' | 'correct' | 'complete';

export function PracticeMode({ song, onBack }: PracticeModeProps) {
  const [noteIndex, setNoteIndex] = useState(0);
  const [practiceState, setPracticeState] = useState<PracticeState>('ready');
  const [showCamera, setShowCamera] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const correctTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0);
  const holdStartRef = useRef<number>(0);

  const {
    isListening,
    detectedMidi,
    detectedNote,
    volume,
    error: micError,
    startListening,
    stopListening,
  } = usePitchDetection();

  const currentNote = song.notes[noteIndex];
  const progress = noteIndex / song.notes.length;

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

    if (notesMatch(detectedMidi, currentNote.midi)) {
      if (holdStartRef.current === 0) {
        holdStartRef.current = Date.now();
      } else if (Date.now() - holdStartRef.current > 200) {
        advanceNote();
      }
    } else {
      holdStartRef.current = 0;
    }
  }, [detectedMidi, currentNote, practiceState, isListening, advanceNote]);

  useEffect(() => {
    return () => clearTimeout(correctTimeoutRef.current);
  }, []);

  const handleStart = async () => {
    await startListening();
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
                  Place your iPad where the mic can hear the piano. Tap Start and play each
                  highlighted note.
                </p>
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

          <PianoKeyboard
            startMidi={song.startMidi}
            endMidi={song.endMidi}
            highlightedMidi={practiceState !== 'ready' ? currentNote?.midi : null}
            pressedMidi={detectedMidi}
            correctMidi={isCorrect ? currentNote?.midi : null}
            showFinger={practiceState !== 'ready' ? currentNote?.finger : undefined}
          />

          <div className="mic-status">
            <div className="volume-meter">
              <div
                className="volume-fill"
                style={{ width: `${Math.min(volume * 400, 100)}%` }}
              />
            </div>
            <div className="mic-info">
              {isListening ? (
                detectedNote ? (
                  <span>
                    Hearing: <strong>{detectedNote}</strong>
                    {notesMatch(detectedMidi, currentNote?.midi ?? -1) && (
                      <span className="match-badge"> ✓ match</span>
                    )}
                  </span>
                ) : (
                  <span className="muted">Play a note…</span>
                )
              ) : (
                <span className="muted">Microphone off</span>
              )}
            </div>
          </div>

          {micError && <p className="error-text">{micError}</p>}

          <div className="practice-actions">
            {!isListening ? (
              <button type="button" className="btn-primary btn-large" onClick={handleStart}>
                Start practice
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={handleStop}>
                Stop
              </button>
            )}
          </div>

          {isListening && (
            <p className="score-line">
              {correctCount} note{correctCount !== 1 ? 's' : ''} correct so far
            </p>
          )}
        </>
      )}

      <CameraView enabled={showCamera} />
    </div>
  );
}
