import { useCamera } from '../hooks/useCamera';

interface CameraViewProps {
  enabled: boolean;
}

export function CameraView({ enabled }: CameraViewProps) {
  const { isActive, videoRef, error, startCamera, stopCamera } = useCamera();

  if (!enabled) return null;

  return (
    <div className="camera-view">
      <div className="camera-header">
        <span>Camera view</span>
        <button
          type="button"
          className="btn-small"
          onClick={isActive ? stopCamera : startCamera}
        >
          {isActive ? 'Stop' : 'Start camera'}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="camera-frame">
        <video ref={videoRef} playsInline muted className="camera-video" />
        {!isActive && (
          <div className="camera-placeholder">
            <p>Point your iPad or iPhone above the keys</p>
            <p className="hint">Use a stand or lean it on the music desk so it can see your hands</p>
          </div>
        )}
        {isActive && (
          <div className="camera-overlay">
            <div className="guide-line guide-line--center" />
            <p className="overlay-hint">Align keys with the center guide</p>
          </div>
        )}
      </div>
    </div>
  );
}
