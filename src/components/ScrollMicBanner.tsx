import { CheckCircle2, Mic, XCircle, Ear } from 'lucide-react';
import { midiToNote } from '../utils/noteUtils';
import type { TimedNote } from '../types/song';
import { formatLeadNotesLine } from '../utils/scrollPractice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ScrollMicBannerProps {
  leadNotes: TimedNote[];
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
      <Alert variant="warning">
        <Mic className="h-4 w-4" />
        <AlertTitle>Play louder — mic is quiet</AlertTitle>
        <AlertDescription>
          Move iPad back 12–18" so it hears your piano, not your hands.
        </AlertDescription>
      </Alert>
    );
  }

  if (matchedNote) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Got it — {midiToNote(matchedNote.midi)}!</AlertTitle>
        <AlertDescription>Keep going as notes hit the line.</AlertDescription>
      </Alert>
    );
  }

  if (detectedNote) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Wrong key</AlertTitle>
        <AlertDescription>
          App hears <strong>{detectedNote}</strong>. Target: <strong>{targetLine}</strong>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <Ear className="h-4 w-4" />
      <AlertTitle>Now: {targetLine}</AlertTitle>
      <AlertDescription>
        Play on your real piano as the note hits the line. Speaker audio is muted so the mic stays
        accurate.
      </AlertDescription>
    </Alert>
  );
}
