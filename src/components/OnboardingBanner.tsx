import { useState } from 'react';

const DISMISS_KEY = 'piano-coach-onboarding-dismissed';

export function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true',
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="onboarding-banner">
      <h3>How this app works</h3>
      <ul>
        <li>
          <strong>Your iPad does not play the song.</strong> You play your real piano; the iPad
          microphone listens and checks each note.
        </li>
        <li>
          Tap <strong>Start practice</strong> — Safari will ask to use the microphone. Tap{' '}
          <strong>Allow</strong>.
        </li>
        <li>
          Tap <strong>Calibrate piano</strong> first (top right) for much better note detection.
        </li>
        <li>
          Camera permission is only asked when you tap 📷 or during camera calibration.
        </li>
      </ul>
      <button type="button" className="btn-primary" onClick={handleDismiss}>
        Got it
      </button>
    </div>
  );
}
