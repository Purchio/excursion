import { useState } from 'react';
import { useCalibration } from '../../context/CalibrationContext';
import type { KeyCalibration } from '../../types/calibration';
import { AudioCalibrationStep } from './AudioCalibrationStep';
import { CameraCalibrationStep } from './CameraCalibrationStep';

interface CalibrationWizardProps {
  onClose: () => void;
}

type WizardStep = 'intro' | 'audio' | 'camera' | 'complete';

export function CalibrationWizard({ onClose }: CalibrationWizardProps) {
  const { calibration, updateCalibration, resetCalibration, hasAudioCalibration, hasVisualCalibration } =
    useCalibration();
  const [step, setStep] = useState<WizardStep>(
    hasAudioCalibration && !hasVisualCalibration ? 'camera' : 'intro',
  );
  const [audioKeys, setAudioKeys] = useState<KeyCalibration[]>(calibration?.audioKeys ?? []);

  const handleAudioComplete = (keys: KeyCalibration[]) => {
    setAudioKeys(keys);
    updateCalibration({ audioKeys: keys });
    setStep('camera');
  };

  const handleCameraComplete = (data: {
    keyboardImage: string;
    keyboardBounds: NonNullable<typeof calibration>['keyboardBounds'];
    visualKeys: NonNullable<typeof calibration>['visualKeys'];
  }) => {
    updateCalibration({
      audioKeys,
      keyboardImage: data.keyboardImage,
      keyboardBounds: data.keyboardBounds,
      visualKeys: data.visualKeys,
    });
    setStep('complete');
  };

  const handleCameraSkip = () => {
    setStep('complete');
  };

  if (step === 'intro') {
    return (
      <div className="cal-wizard">
        <header className="cal-wizard-header">
          <button type="button" className="btn-back" onClick={onClose}>
            ← Home
          </button>
          <h1>Calibrate your piano</h1>
        </header>

        <div className="cal-step">
          <p className="cal-desc">
            A one-time setup teaches the app how <em>your</em> piano sounds and where the keys
            are. It saves permanently on this device.
          </p>

          <div className="cal-intro-cards">
            <div className="cal-intro-card">
              <span className="cal-intro-num">1</span>
              <h3>Audio</h3>
              <p>Play white keys left to right, then black keys. The mic learns each key's pitch.</p>
            </div>
            <div className="cal-intro-card">
              <span className="cal-intro-num">2</span>
              <h3>Camera</h3>
              <p>Take a photo and tap your keyboard edges. The app maps keys on screen.</p>
            </div>
          </div>

          {(hasAudioCalibration || hasVisualCalibration) && (
            <div className="cal-existing">
              <p>Current calibration:</p>
              <ul>
                <li>{hasAudioCalibration ? '✓' : '○'} Audio ({calibration?.audioKeys.length ?? 0} keys)</li>
                <li>{hasVisualCalibration ? '✓' : '○'} Camera map</li>
              </ul>
              <button type="button" className="btn-secondary" onClick={resetCalibration}>
                Reset calibration
              </button>
            </div>
          )}

          <button type="button" className="btn-primary btn-large" onClick={() => setStep('audio')}>
            {hasAudioCalibration ? 'Re-calibrate audio' : 'Start calibration'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'audio') {
    return (
      <div className="cal-wizard">
        <header className="cal-wizard-header">
          <button type="button" className="btn-back" onClick={onClose}>
            ← Home
          </button>
          <h1>Step 1: Audio</h1>
        </header>
        <AudioCalibrationStep
          onComplete={handleAudioComplete}
          onBack={() => setStep('intro')}
        />
      </div>
    );
  }

  if (step === 'camera') {
    return (
      <div className="cal-wizard">
        <header className="cal-wizard-header">
          <button type="button" className="btn-back" onClick={onClose}>
            ← Home
          </button>
          <h1>Step 2: Camera</h1>
        </header>
        <CameraCalibrationStep
          onComplete={handleCameraComplete}
          onBack={() => setStep('audio')}
          onSkip={handleCameraSkip}
        />
      </div>
    );
  }

  return (
    <div className="cal-wizard">
      <header className="cal-wizard-header">
        <button type="button" className="btn-back" onClick={onClose}>
          ← Home
        </button>
        <h1>All set!</h1>
      </header>

      <div className="cal-step complete-screen">
        <div className="complete-icon">🎹</div>
        <h3>Your piano is calibrated</h3>
        <p>
          {audioKeys.length} audio keys saved
          {calibration?.visualKeys?.length ? ` · ${calibration.visualKeys.length} visual key positions` : ''}
        </p>
        <p className="cal-desc">This stays saved on your device. You won't need to do this again unless you move your iPad.</p>
        <button type="button" className="btn-primary btn-large" onClick={onClose}>
          Start learning
        </button>
      </div>
    </div>
  );
}
