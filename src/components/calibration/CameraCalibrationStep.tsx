import { useCallback, useRef, useState } from 'react';
import { useCalibration } from '../../context/CalibrationContext';
import { useCamera } from '../../hooks/useCamera';
import { usePitchDetection } from '../../hooks/usePitchDetection';
import type { KeyboardBounds } from '../../types/calibration';
import { computeVisualKeyPositions } from '../../utils/keyboardLayout';
import { midiToNote } from '../../utils/noteUtils';

interface CameraCalibrationStepProps {
  onComplete: (data: {
    keyboardImage: string;
    keyboardBounds: KeyboardBounds;
    visualKeys: ReturnType<typeof computeVisualKeyPositions>;
  }) => void;
  onBack: () => void;
  onSkip: () => void;
}

type BoundsStep = 'capture' | 'left' | 'right' | 'baseline' | 'verify' | 'done';

const NOTE_OPTIONS = Array.from({ length: 25 }, (_, i) => 48 + i); // C3 to C5

export function CameraCalibrationStep({ onComplete, onBack, onSkip }: CameraCalibrationStepProps) {
  const { calibration } = useCalibration();
  const { isActive, videoRef, error, startCamera, stopCamera, captureFrame } = useCamera();
  const { isListening, detectedMidi, startListening, stopListening } = usePitchDetection();

  const [step, setStep] = useState<BoundsStep>('capture');
  const [keyboardImage, setKeyboardImage] = useState<string | null>(
    calibration?.keyboardImage ?? null,
  );
  const [leftPoint, setLeftPoint] = useState<{ x: number; y: number } | null>(null);
  const [rightPoint, setRightPoint] = useState<{ x: number; y: number } | null>(null);
  const [baselineY, setBaselineY] = useState<number | null>(null);
  const [startMidi, setStartMidi] = useState(calibration?.keyboardBounds?.startMidi ?? 48);
  const [endMidi, setEndMidi] = useState(calibration?.keyboardBounds?.endMidi ?? 60);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleCapture = () => {
    const frame = captureFrame();
    if (frame) {
      setKeyboardImage(frame);
      stopCamera();
      setStep('left');
    }
  };

  const getNormalizedPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const el = imageRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      };
    },
    [],
  );

  const handleImageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const point = getNormalizedPoint(e.clientX, e.clientY);
    if (!point) return;

    if (step === 'left') {
      setLeftPoint(point);
      setStep('right');
    } else if (step === 'right') {
      setRightPoint(point);
      setStep('baseline');
    } else if (step === 'baseline') {
      setBaselineY(point.y);
      setStep('verify');
    }
  };

  const buildBounds = (): KeyboardBounds | null => {
    if (!leftPoint || !rightPoint || baselineY === null) return null;
    return {
      leftX: leftPoint.x,
      rightX: rightPoint.x,
      keyY: baselineY,
      startMidi,
      endMidi,
    };
  };

  const handleVerifyStart = async () => {
    await startListening();
  };

  const handleFinish = () => {
    stopListening();
    const bounds = buildBounds();
    if (!keyboardImage || !bounds) return;
    const visualKeys = computeVisualKeyPositions(bounds);
    onComplete({ keyboardImage, keyboardBounds: bounds, visualKeys });
  };

  const bounds = buildBounds();
  const visualKeys = bounds ? computeVisualKeyPositions(bounds) : [];

  const stepInstructions: Record<BoundsStep, string> = {
    capture: 'Position your iPad above the keyboard and capture a photo.',
    left: 'Tap the center of the leftmost visible white key.',
    right: 'Tap the center of the rightmost visible white key.',
    baseline: 'Tap the front edge of the keys (where your fingers strike).',
    verify: 'Play a few keys to verify the overlay lines up.',
    done: 'Visual map saved.',
  };

  return (
    <div className="cal-step">
      <h2>Camera calibration</h2>
      <p className="cal-desc">{stepInstructions[step]}</p>

      {step === 'capture' && (
        <>
          <div className="camera-frame">
            <video ref={videoRef} playsInline muted className="camera-video" />
            {!isActive && (
              <div className="camera-placeholder">
                <p>Point the camera straight down at your keys</p>
              </div>
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="cal-actions">
            {!isActive ? (
              <button type="button" className="btn-primary" onClick={startCamera}>
                Open camera
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handleCapture}>
                Capture photo
              </button>
            )}
            {keyboardImage && (
              <button type="button" className="btn-secondary" onClick={() => setStep('left')}>
                Use previous photo
              </button>
            )}
          </div>
        </>
      )}

      {step !== 'capture' && keyboardImage && (
        <>
          <div
            ref={imageRef}
            className="cal-image-tap"
            onClick={handleImageTap}
            role="presentation"
          >
            <img src={keyboardImage} alt="Your piano keyboard" className="cal-keyboard-photo" />
            {leftPoint && (
              <div
                className="cal-marker cal-marker--left"
                style={{ left: `${leftPoint.x * 100}%`, top: `${leftPoint.y * 100}%` }}
              />
            )}
            {rightPoint && (
              <div
                className="cal-marker cal-marker--right"
                style={{ left: `${rightPoint.x * 100}%`, top: `${rightPoint.y * 100}%` }}
              />
            )}
            {baselineY !== null && leftPoint && rightPoint && (
              <div
                className="cal-baseline"
                style={{
                  top: `${baselineY * 100}%`,
                  left: `${leftPoint.x * 100}%`,
                  width: `${(rightPoint.x - leftPoint.x) * 100}%`,
                }}
              />
            )}
            {visualKeys.map((key) => (
              <div
                key={key.midi}
                className={`cal-key-dot ${key.isBlack ? 'black' : 'white'} ${
                  detectedMidi === key.midi ? 'active' : ''
                }`}
                style={{ left: `${key.x * 100}%`, top: `${key.y * 100}%` }}
                title={midiToNote(key.midi)}
              />
            ))}
          </div>

          {(step === 'left' || step === 'right') && (
            <div className="cal-note-select">
              <label>
                {step === 'left' ? 'Left key note' : 'Right key note'}
                <select
                  value={step === 'left' ? startMidi : endMidi}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (step === 'left') setStartMidi(val);
                    else setEndMidi(val);
                  }}
                >
                  {NOTE_OPTIONS.map((midi) => (
                    <option key={midi} value={midi}>
                      {midiToNote(midi)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {step === 'verify' && (
            <div className="cal-verify">
              <p>Play keys on your piano — dots should light up on the matching keys.</p>
              {!isListening ? (
                <button type="button" className="btn-primary" onClick={handleVerifyStart}>
                  Start mic test
                </button>
              ) : (
                <p className="mic-info">
                  Hearing: <strong>{detectedMidi ? midiToNote(detectedMidi) : '…'}</strong>
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="cal-nav">
        <button type="button" className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn-secondary" onClick={onSkip}>
          Skip visual
        </button>
        {step === 'verify' && bounds && (
          <button type="button" className="btn-primary" onClick={handleFinish}>
            Save visual map
          </button>
        )}
      </div>
    </div>
  );
}
