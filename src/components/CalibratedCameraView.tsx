import { useCalibration } from '../context/CalibrationContext';
import { useCamera } from '../hooks/useCamera';
import { getVisualKeyPosition } from '../utils/keyboardLayout';
import { midiToNote } from '../utils/noteUtils';

interface CalibratedCameraViewProps {
  enabled: boolean;
  highlightedMidi?: number | null;
  detectedMidi?: number | null;
}

export function CalibratedCameraView({
  enabled,
  highlightedMidi,
  detectedMidi = null,
}: CalibratedCameraViewProps) {
  const { calibration, hasVisualCalibration } = useCalibration();
  const { isActive, videoRef, error, startCamera, stopCamera } = useCamera();

  if (!enabled) return null;

  const visualKeys = calibration?.visualKeys ?? [];
  const keyboardImage = calibration?.keyboardImage;
  const highlightPos = highlightedMidi
    ? getVisualKeyPosition(visualKeys, highlightedMidi)
    : null;
  const detectedPos = detectedMidi ? getVisualKeyPosition(visualKeys, detectedMidi) : null;

  return (
    <div className="camera-view">
      <div className="camera-header">
        <span>{hasVisualCalibration ? 'Calibrated camera view' : 'Camera view'}</span>
        <button
          type="button"
          className="btn-small"
          onClick={isActive ? stopCamera : startCamera}
        >
          {isActive ? 'Stop' : 'Start camera'}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="camera-frame camera-frame--calibrated">
        {hasVisualCalibration && keyboardImage && !isActive ? (
          <div className="cal-image-static">
            <img src={keyboardImage} alt="Calibrated keyboard" className="cal-keyboard-photo" />
            {visualKeys.map((key) => (
              <div
                key={key.midi}
                className={`cal-key-dot ${key.isBlack ? 'black' : 'white'} ${
                  key.midi === highlightedMidi ? 'highlight' : ''
                } ${key.midi === detectedMidi ? 'active' : ''}`}
                style={{ left: `${key.x * 100}%`, top: `${key.y * 100}%` }}
              />
            ))}
            {highlightPos && (
              <div
                className="cal-finger-target"
                style={{
                  left: `${highlightPos.x * 100}%`,
                  top: `${highlightPos.y * 100}%`,
                }}
              >
                <span>Play {midiToNote(highlightedMidi!)}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="camera-video" />
            {!isActive && (
              <div className="camera-placeholder">
                <p>Point your iPad or iPhone above the keys</p>
                {!hasVisualCalibration && (
                  <p className="hint">Calibrate your piano for key overlays on this view</p>
                )}
              </div>
            )}
            {isActive && hasVisualCalibration && (
              <div className="camera-overlay camera-overlay--keys">
                {visualKeys.map((key) => (
                  <div
                    key={key.midi}
                    className={`cal-key-dot ${key.isBlack ? 'black' : 'white'} ${
                      key.midi === highlightedMidi ? 'highlight' : ''
                    } ${key.midi === detectedMidi ? 'active' : ''}`}
                    style={{ left: `${key.x * 100}%`, top: `${key.y * 100}%` }}
                  />
                ))}
                {highlightPos && (
                  <div
                    className="cal-finger-target"
                    style={{
                      left: `${highlightPos.x * 100}%`,
                      top: `${highlightPos.y * 100}%`,
                    }}
                  >
                    <span>{midiToNote(highlightedMidi!)}</span>
                  </div>
                )}
                {detectedPos && detectedMidi !== highlightedMidi && (
                  <div
                    className="cal-key-dot active wrong"
                    style={{
                      left: `${detectedPos.x * 100}%`,
                      top: `${detectedPos.y * 100}%`,
                    }}
                  />
                )}
              </div>
            )}
            {isActive && !hasVisualCalibration && (
              <div className="camera-overlay">
                <div className="guide-line guide-line--center" />
                <p className="overlay-hint">Align keys with the center guide</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
