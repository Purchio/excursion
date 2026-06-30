import { midiToNote } from '../utils/noteUtils';
import type { TimedNote } from '../types/song';
import { formatLeadNotesLine } from '../utils/scrollPractice';

interface ScrollMicBannerProps {
  leadNotes: TimedNote[];
  detectedMidi: number | null;
  detectedNote: string | null;
  volume: number;
  matchedNote: TimedNote | null;
}

export function ScrollMicBanner({
  leadNotes,
  detectedNote,
  volume,
  matchedNote,
}: ScrollMicBannerProps) {
  if (leadNotes.length === 0) return null;

  const volumeOk = volume > 0.008;
  const targetLine = formatLeadNotesLine(leadNotes);

  if (!volumeOk) {
    return (
      <div className="match-banner match-banner--waiting">
        <span className="match-banner-icon">🎤</span>
        <div>
          <strong>Play louder — mic is quiet</strong>
          <p>Move iPad back 12–18" so it hears your piano, not your hands.</p>
        </div>
      </div>
    );
  }

  if (matchedNote) {
    return (
      <div className="match-banner match-banner--yes">
        <span className="match-banner-icon">✓</span>
        <div>
          <strong>Got it — {midiToNote(matchedNote.midi)}!</strong>
          <p>Keep going as notes hit the line.</p>
        </div>
      </div>
    );
  }

  if (detectedNote) {
    return (
      <div className="match-banner match-banner--no">
        <span className="match-banner-icon">✗</span>
        <div>
          <strong>Wrong key</strong>
          <p>
            App hears <strong>{detectedNote}</strong>. Target: <strong>{targetLine}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-banner match-banner--waiting">
      <span className="match-banner-icon">👂</span>
      <div>
        <strong>Now: {targetLine}</strong>
        <p>Play on your real piano as the note hits the line. Speaker audio is muted so the mic stays accurate.</p>
      </div>
    </div>
  );
}
