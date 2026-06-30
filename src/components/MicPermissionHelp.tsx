import { getMicSettingsPath, isIOS, isStandalonePwa } from '../utils/deviceUtils';

interface MicPermissionHelpProps {
  onRequestMic: () => void;
  isListening: boolean;
  error: string | null;
  permissionState?: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export function MicPermissionHelp({
  onRequestMic,
  isListening,
  error,
  permissionState,
}: MicPermissionHelpProps) {
  if (isListening) return null;

  const fromHomeScreen = isStandalonePwa();

  return (
    <div className="permission-help">
      <div className="no-audio-notice">
        <strong>No sound from the iPad is normal.</strong> This app does not play music. It only
        listens to your piano through the microphone.
      </div>

      <p className="permission-title">Enable the microphone</p>
      <p className="permission-desc">
        Tap the button below. iOS should ask <strong>"Allow microphone?"</strong> — tap Allow.
      </p>

      {permissionState === 'denied' && (
        <div className="permission-denied">
          <p>
            <strong>Microphone is blocked.</strong> On your iPad go to:
          </p>
          <p className="settings-path">{getMicSettingsPath()}</p>
          {fromHomeScreen && (
            <p className="permission-desc permission-desc--small">
              Tip: If it still fails from the home screen icon, open{' '}
              <strong>purchio.github.io/excursion</strong> in Safari directly, allow the mic there,
              then try the home screen icon again.
            </p>
          )}
        </div>
      )}

      {fromHomeScreen && permissionState !== 'denied' && (
        <p className="permission-desc permission-desc--small">
          Opened from home screen? If no popup appears, try opening{' '}
          <strong>purchio.github.io/excursion</strong> in Safari first and tap Allow when asked.
        </p>
      )}

      {isIOS() && (
        <p className="permission-desc permission-desc--small">
          Camera permission only appears when you tap 📷 or start camera calibration — not at launch.
        </p>
      )}

      <button type="button" className="btn-primary btn-large" onClick={onRequestMic}>
        Enable microphone & start
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
