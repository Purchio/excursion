import { useCallback, useEffect, useState } from 'react';
import { useCalibration } from '../../context/CalibrationContext';
import { usePitchDetection } from '../../hooks/usePitchDetection';
import type { KeyCalibration } from '../../types/calibration';
import {
  captureFrequency,
  isFrequencyStable,
} from '../../utils/calibratedPitch';
import {
  CALIBRATION_OCTAVE_END,
  CALIBRATION_OCTAVE_START,
  FULL_KEYBOARD_END,
  FULL_KEYBOARD_START,
  getBlackKeySequence,
  getWhiteKeySequence,
} from '../../utils/keyboardLayout';
import { midiToNote } from '../../utils/noteUtils';
import { DetectionDebug } from '../DetectionDebug';
import { PianoKeyboard } from '../PianoKeyboard';

interface AudioCalibrationStepProps {
  onComplete: (keys: KeyCalibration[]) => void;
  onBack: () => void;
}

type CalPhase = 'whites' | 'blacks' | 'done';

export function AudioCalibrationStep({ onComplete, onBack }: AudioCalibrationStepProps) {
  const { calibration } = useCalibration();
  const [phase, setPhase] = useState<CalPhase>('whites');
  const [recordedKeys, setRecordedKeys] = useState<KeyCalibration[]>(
    () => calibration?.audioKeys ?? [],
  );
  const [keyIndex, setKeyIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'listening' | 'captured'>('idle');

  const whiteKeys = getWhiteKeySequence(CALIBRATION_OCTAVE_START, CALIBRATION_OCTAVE_END);
  const blackKeys = getBlackKeySequence(CALIBRATION_OCTAVE_START, CALIBRATION_OCTAVE_END);
  const currentSequence = phase === 'whites' ? whiteKeys : blackKeys;
  const currentMidi = currentSequence[keyIndex];

  const {
    isListening,
    detectedMidi,
    detectedNote,
    rawFrequency,
    volume,
    frequencySamples,
    error,
    startListening,
    stopListening,
    clearSamples,
  } = usePitchDetection();

  const captureKey = useCallback(() => {
    const freq = captureFrequency(frequencySamples, rawFrequency);
    if (!freq || !currentMidi) return false;

    setRecordedKeys((prev) => {
      const filtered = prev.filter((k) => k.midi !== currentMidi);
      return [...filtered, { midi: currentMidi, frequency: freq }];
    });
    setStatus('captured');
    clearSamples();
    return true;
  }, [frequencySamples, rawFrequency, currentMidi, clearSamples]);

  useEffect(() => {
    if (!isListening || status !== 'listening' || !currentMidi) return;
    if (volume < 0.006) return;
    if (!isFrequencyStable(frequencySamples, 50, 4)) return;
    if (detectedMidi !== null && Math.abs(detectedMidi - currentMidi) <= 1) {
      captureKey();
    }
  }, [isListening, status, frequencySamples, detectedMidi, currentMidi, captureKey, volume]);

  useEffect(() => {
    if (status !== 'captured') return;
    const timer = setTimeout(() => {
      if (keyIndex + 1 < currentSequence.length) {
        setKeyIndex((i) => i + 1);
        setStatus('listening');
      } else if (phase === 'whites') {
        setPhase('blacks');
        setKeyIndex(0);
        setStatus('listening');
      } else {
        setPhase('done');
        stopListening();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [status, keyIndex, currentSequence.length, phase, stopListening]);

  const handleStart = async () => {
    setKeyIndex(0);
    setPhase('whites');
    setStatus('listening');
    await startListening();
  };

  const handleManualCapture = () => {
    const ok = captureKey();
    if (!ok && rawFrequency) {
      setRecordedKeys((prev) => {
        const filtered = prev.filter((k) => k.midi !== currentMidi);
        return [...filtered, { midi: currentMidi!, frequency: rawFrequency }];
      });
      setStatus('captured');
      clearSamples();
    }
  };

  const handleSkip = () => {
    clearSamples();
    if (keyIndex + 1 < currentSequence.length) {
      setKeyIndex((i) => i + 1);
      setStatus('listening');
    } else if (phase === 'whites') {
      setPhase('blacks');
      setKeyIndex(0);
      setStatus('listening');
    } else {
      setPhase('done');
      stopListening();
    }
  };

  const handleFinish = () => {
    stopListening();
    onComplete(recordedKeys);
  };

  const progress =
    phase === 'done'
      ? 1
      : (phase === 'whites' ? keyIndex : whiteKeys.length + keyIndex) /
        (whiteKeys.length + blackKeys.length);

  if (phase === 'done') {
    return (
      <div className="cal-step">
        <h2>Audio calibration complete</h2>
        <p className="cal-desc">
          Recorded {recordedKeys.length} keys on your Knabe. The app will use these
          frequencies to recognize your notes more accurately.
        </p>
        <ul className="cal-summary">
          {recordedKeys.map((k) => (
            <li key={k.midi}>
              {midiToNote(k.midi)}: {k.frequency.toFixed(1)} Hz
            </li>
          ))}
        </ul>
        <div className="cal-actions">
          <button type="button" className="btn-secondary" onClick={handleStart}>
            Re-record
          </button>
          <button type="button" className="btn-primary" onClick={handleFinish}>
            Save & continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cal-step">
      <h2>Audio calibration</h2>
      <p className="cal-desc">
        Middle C octave on your piano. Play each <strong>yellow</strong> key — count white keys
        from the left using the full keyboard below. Hold the iPad on the music desk, 12–18
        inches back (not right on the keys).
      </p>

      <div className="cal-phase-badge">
        {phase === 'whites' ? 'White keys' : 'Black keys'} — {keyIndex + 1} of{' '}
        {currentSequence.length}
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {!isListening ? (
        <div className="cal-start-prompt">
          <p>Prop the iPad on the music desk facing the keys. Tap below when ready.</p>
          <button type="button" className="btn-primary btn-large" onClick={handleStart}>
            Start listening
          </button>
        </div>
      ) : (
        <>
          <div className="note-prompt">
            <p className="prompt-label">Play this key on your piano</p>
            <p className="prompt-note">{currentMidi ? midiToNote(currentMidi) : ''}</p>
            {status === 'captured' && <p className="match-badge">✓ Captured</p>}
          </div>

          <PianoKeyboard
            startMidi={CALIBRATION_OCTAVE_START}
            endMidi={CALIBRATION_OCTAVE_END}
            highlightedMidi={currentMidi}
            pressedMidi={detectedMidi}
            correctMidi={status === 'captured' ? currentMidi : null}
            showFullKeyboard
            fullRangeStart={FULL_KEYBOARD_START}
            fullRangeEnd={FULL_KEYBOARD_END}
          />

          <DetectionDebug
            volume={volume}
            detectedNote={detectedNote}
            detectedMidi={detectedMidi}
            expectedMidi={currentMidi ?? null}
            rawFrequency={rawFrequency}
            sampleCount={frequencySamples.length}
          />

          <div className="cal-actions">
            <button type="button" className="btn-secondary" onClick={handleSkip}>
              Skip key
            </button>
            <button type="button" className="btn-primary" onClick={handleManualCapture}>
              Capture now
            </button>
          </div>
          <p className="cal-hint">
            Auto-capture slow? Play the key, wait 1 second, tap <strong>Capture now</strong>.
          </p>
        </>
      )}

      {error && <p className="error-text">{error}</p>}

      <div className="cal-nav">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <span className="cal-recorded">{recordedKeys.length} keys saved</span>
      </div>
    </div>
  );
}
