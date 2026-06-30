import type { Hand, TimedNote } from '../types/song';

const PIANO_LOW = 36; // C2
const PIANO_HIGH = 84; // C6
const CHORD_BUCKET_MS = 50;

function inPianoRange(midi: number): boolean {
  return midi >= PIANO_LOW && midi <= PIANO_HIGH;
}

/**
 * Pick the 1–2 tracks that look like piano (most notes in playable range).
 * Full-band MIDIs like Satisfaction have bass/drums/guitar on separate tracks.
 */
export function pickPianoTrackIndices(
  tracks: Array<{ channel: number; notes: Array<{ midi: number }> }>,
): number[] {
  const scored = tracks.map((track, index) => {
    if (track.channel === 9) return { index, score: -1 };
    const inRange = track.notes.filter((n) => inPianoRange(n.midi)).length;
    const score = inRange * 3 + track.notes.length;
    return { index, score };
  });

  return scored
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((t) => t.index);
}

/**
 * At each moment, keep at most one note per hand (highest in each hand for chords).
 */
export function dedupeSimultaneousNotes(notes: TimedNote[]): TimedNote[] {
  if (notes.length === 0) return notes;

  const sorted = [...notes].sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  const buckets = new Map<number, TimedNote[]>();

  for (const note of sorted) {
    const bucket = Math.round(note.startMs / CHORD_BUCKET_MS);
    const list = buckets.get(bucket) ?? [];
    list.push(note);
    buckets.set(bucket, list);
  }

  const result: TimedNote[] = [];
  for (const group of buckets.values()) {
    const byHand: Record<Hand, TimedNote | null> = { left: null, right: null };
    for (const note of group) {
      const current = byHand[note.hand];
      if (!current || note.midi > current.midi) {
        byHand[note.hand] = note;
      }
    }
    if (byHand.left) result.push(byHand.left);
    if (byHand.right) result.push(byHand.right);
  }

  return result.sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
}

export function filterPlayableRange(notes: TimedNote[]): TimedNote[] {
  return notes.filter((n) => inPianoRange(n.midi));
}

/**
 * Full pipeline: piano tracks → playable range → one note per hand per moment.
 */
export function simplifyForPianoPractice(notes: TimedNote[]): TimedNote[] {
  return dedupeSimultaneousNotes(filterPlayableRange(notes));
}
