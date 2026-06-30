import { midiToNote } from '../utils/noteUtils';

interface KeyMatchBannerProps {
  expectedMidi: number | null;
  detectedMidi: number | null;
  detectedNote: string | null;
  volume: number;
}

export function KeyMatchBanner({
  expectedMidi,
  detectedMidi,
  detectedNote,
  volume,
}: KeyMatchBannerProps) {
  if (expectedMidi == null) return null;

  const expectedNote = midiToNote(expectedMidi);
  const volumeOk = volume > 0.006;

  if (!volumeOk) {
    return (
      <div className="match-banner match-banner--waiting">
        <span className="match-banner-icon">🎤</span>
        <div>
          <strong>Play the yellow key now</strong>
          <p>The mic bar below should move when you play.</p>
        </div>
      </div>
    );
  }

  if (!detectedNote) {
    return (
      <div className="match-banner match-banner--waiting">
        <span className="match-banner-icon">👂</span>
        <div>
          <strong>Listening… play {expectedNote} on your piano</strong>
          <p>Hold the note for about a second.</p>
        </div>
      </div>
    );
  }

  const matches = detectedMidi != null && Math.abs(detectedMidi - expectedMidi) <= 1;

  if (matches) {
    return (
      <div className="match-banner match-banner--yes">
        <span className="match-banner-icon">✓</span>
        <div>
          <strong>Right key!</strong>
          <p>
            App hears <strong>{detectedNote}</strong> — matches {expectedNote}. Tap{' '}
            <strong>Save this key</strong> below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-banner match-banner--no">
      <span className="match-banner-icon">✗</span>
      <div>
        <strong>Wrong key</strong>
        <p>
          App hears <strong>{detectedNote}</strong> but you need <strong>{expectedNote}</strong>.
          Use the keyboard below — count white keys to the yellow one.
        </p>
      </div>
    </div>
  );
}
