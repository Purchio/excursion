import type { Hand, TimedNote } from '../types/song';
import { midiToNote } from './noteUtils';

export function getNotesAtHitLine(
  notes: TimedNote[],
  timeMs: number,
  windowMs = 120,
): TimedNote[] {
  return notes.filter((n) => Math.abs(n.startMs - timeMs) <= windowMs);
}

/** One lead note per hand at the hit line — what mic verification should target. */
export function getLeadNotesAtHitLine(
  notes: TimedNote[],
  timeMs: number,
  windowMs = 120,
): TimedNote[] {
  const atHit = getNotesAtHitLine(notes, timeMs, windowMs);
  const byHand: Partial<Record<Hand, TimedNote>> = {};

  for (const note of atHit) {
    const current = byHand[note.hand];
    if (!current || note.midi > current.midi) {
      byHand[note.hand] = note;
    }
  }

  return (['right', 'left'] as Hand[])
    .map((h) => byHand[h])
    .filter((n): n is TimedNote => n != null);
}

export function formatLeadNotesLine(notes: TimedNote[]): string {
  if (notes.length === 0) return '';
  return notes
    .map((n) => {
      const hand = n.hand === 'right' ? 'RH' : 'LH';
      const finger = n.finger ? ` · f${n.finger}` : '';
      return `${midiToNote(n.midi)} (${hand}${finger})`;
    })
    .join(' + ');
}

export function matchAnyExpected(
  detectedMidi: number | null,
  expected: TimedNote[],
  matchFn: (detected: number | null, expected: number) => boolean,
): TimedNote | null {
  if (detectedMidi == null || expected.length === 0) return null;
  return expected.find((n) => matchFn(detectedMidi, n.midi)) ?? null;
}
