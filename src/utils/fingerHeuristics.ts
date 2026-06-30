import type { Hand, TimedNote } from '../types/song';

const CHORD_WINDOW_MS = 40;
const POSITION_RESET_SEMITONES = 7;

function assignFingersToChord(midis: number[]): Map<number, number> {
  const sorted = [...midis].sort((a, b) => a - b);
  const result = new Map<number, number>();
  const span = sorted.length;

  if (span === 1) {
    result.set(sorted[0], 3);
    return result;
  }

  sorted.forEach((midi, i) => {
    const finger = Math.min(5, Math.max(1, Math.round(1 + (i * 4) / Math.max(1, span - 1))));
    result.set(midi, finger);
  });
  return result;
}

function fingerForMelodyNote(midi: number, anchorMidi: number): number {
  const offset = midi - anchorMidi;
  const finger = 3 + offset;
  return Math.min(5, Math.max(1, finger));
}

/**
 * Assign fingers 1–5 per hand using chord grouping and melody anchoring.
 */
export function assignFingers(notes: TimedNote[]): TimedNote[] {
  const byHand: Record<Hand, TimedNote[]> = { left: [], right: [] };
  for (const note of notes) {
    byHand[note.hand].push(note);
  }

  const result: TimedNote[] = [];

  for (const hand of ['left', 'right'] as Hand[]) {
    const handNotes = [...byHand[hand]].sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
    let anchorMidi = handNotes[0]?.midi ?? 60;
    let i = 0;

    while (i < handNotes.length) {
      const groupStart = handNotes[i].startMs;
      const group: TimedNote[] = [];
      while (
        i < handNotes.length &&
        handNotes[i].startMs - groupStart <= CHORD_WINDOW_MS
      ) {
        group.push(handNotes[i]);
        i++;
      }

      const uniqueMidis = [...new Set(group.map((n) => n.midi))];
      if (uniqueMidis.length > 1) {
        const fingers = assignFingersToChord(uniqueMidis);
        for (const note of group) {
          result.push({ ...note, finger: fingers.get(note.midi) });
        }
        anchorMidi = Math.min(...uniqueMidis);
      } else {
        const midi = uniqueMidis[0];
        if (Math.abs(midi - anchorMidi) > POSITION_RESET_SEMITONES) {
          anchorMidi = midi;
        }
        const finger = fingerForMelodyNote(midi, anchorMidi);
        for (const note of group) {
          result.push({ ...note, finger });
        }
      }
    }
  }

  return result.sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
}

export function handForMidi(midi: number, splitAt = 60): Hand {
  return midi < splitAt ? 'left' : 'right';
}
