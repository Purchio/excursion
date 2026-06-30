import { midiToNote } from '../utils/noteUtils';

interface DetectionDebugProps {
  volume: number;
  detectedNote: string | null;
  detectedMidi: number | null;
  expectedMidi: number | null;
  rawFrequency: number | null;
  sampleCount: number;
}

export function DetectionDebug({
  volume,
  detectedNote,
  detectedMidi,
  expectedMidi,
  rawFrequency,
  sampleCount,
}: DetectionDebugProps) {
  const expectedNote = expectedMidi != null ? midiToNote(expectedMidi) : null;
  const matches =
    detectedMidi != null &&
    expectedMidi != null &&
    Math.abs(detectedMidi - expectedMidi) <= 1;

  const volumePct = Math.min(volume * 400, 100);
  const volumeOk = volume > 0.008;

  return (
    <div className="detection-debug">
      <div className="volume-meter volume-meter--large">
        <div className="volume-fill" style={{ width: `${volumePct}%` }} />
      </div>
      <div className="debug-grid">
        <div>
          <span className="debug-label">Mic level</span>
          <span className={volumeOk ? 'debug-ok' : 'debug-warn'}>
            {volumeOk ? 'Hearing sound' : 'Too quiet — play louder or move iPad back 12–18"'}
          </span>
        </div>
        <div>
          <span className="debug-label">App hears</span>
          <strong>{detectedNote ?? '—'}</strong>
        </div>
        <div>
          <span className="debug-label">You need</span>
          <strong>{expectedNote ?? '—'}</strong>
        </div>
        <div>
          <span className="debug-label">Match</span>
          <span className={matches ? 'match-badge' : 'debug-warn'}>
            {matches ? '✓ Yes' : detectedNote ? '✗ Wrong key' : '—'}
          </span>
        </div>
      </div>
      {rawFrequency && (
        <p className="debug-freq">
          {rawFrequency.toFixed(0)} Hz · {sampleCount} samples buffered
        </p>
      )}
    </div>
  );
}
