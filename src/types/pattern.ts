import type { Hand, TimedNote } from './song';

export interface PracticePattern {
  id: string;
  label: string;
  hand: Hand;
  startMs: number;
  endMs: number;
  durationMs: number;
  measureLabel: string;
  repeatGoal: number;
  /** Notes for this hand in the pattern window */
  notes: TimedNote[];
  /** Mini graph: normalized midi heights 0–1 */
  sparkline: number[];
}
