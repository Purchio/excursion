import type { Hand, TimedNote } from '../types/song';
import { getLeadNotesAtHitLine } from './scrollPractice';

export interface HandMoment {
  timeMs: number;
  right?: TimedNote;
  left?: TimedNote;
}

function momentFromLeads(timeMs: number, leads: TimedNote[]): HandMoment {
  return {
    timeMs,
    right: leads.find((n) => n.hand === 'right'),
    left: leads.find((n) => n.hand === 'left'),
  };
}

/** Distinct upcoming hand positions — how a pianist plans ahead. */
export function getHandMoments(
  notes: TimedNote[],
  fromMs: number,
  limit = 5,
): HandMoment[] {
  const times = [
    ...new Set(notes.filter((n) => n.startMs >= fromMs - 60).map((n) => n.startMs)),
  ]
    .sort((a, b) => a - b)
    .slice(0, limit);

  return times.map((timeMs) =>
    momentFromLeads(timeMs, getLeadNotesAtHitLine(notes, timeMs, 100)),
  );
}

export function midisForMoment(moment: HandMoment): number[] {
  return [moment.right?.midi, moment.left?.midi].filter((m): m is number => m != null);
}

export function momentLabel(moment: HandMoment): string {
  const parts: string[] = [];
  if (moment.right) parts.push(`RH ${noteChip(moment.right)}`);
  if (moment.left) parts.push(`LH ${noteChip(moment.left)}`);
  return parts.join(' · ') || 'Rest';
}

function noteChip(note: TimedNote): string {
  const name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][
    note.midi % 12
  ];
  const octave = Math.floor(note.midi / 12) - 1;
  const finger = note.finger ? ` f${note.finger}` : '';
  return `${name}${octave}${finger}`;
}

export function handLabel(hand: Hand): string {
  return hand === 'right' ? 'Right hand' : 'Left hand';
}
