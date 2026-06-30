import type { Hand, TimedNote } from '../types/song';

/** Next few notes per hand — keeps the scroll view readable. */
export function getUpcomingDisplayNotes(
  notes: TimedNote[],
  timeMs: number,
  perHand = 2,
): TimedNote[] {
  const upcoming = notes
    .filter((n) => n.startMs >= timeMs - 80)
    .sort((a, b) => a.startMs - b.startMs);

  const seen = { left: 0, right: 0 };
  const result: TimedNote[] = [];

  for (const note of upcoming) {
    if (seen[note.hand] >= perHand) continue;
    seen[note.hand]++;
    result.push(note);
  }

  return result;
}

export function fingerColumnX(
  laneX: number,
  laneWidth: number,
  finger?: number,
): number {
  const col = Math.min(4, Math.max(0, (finger ?? 3) - 1));
  const padding = 12;
  const inner = laneWidth - padding * 2;
  return laneX + padding + (col + 0.5) * (inner / 5);
}

export const CALM_LANE_COLORS: Record<Hand, { fill: string; glow: string }> = {
  left: { fill: 'rgba(180, 100, 100, 0.85)', glow: 'rgba(180, 100, 100, 0.2)' },
  right: { fill: 'rgba(90, 130, 190, 0.85)', glow: 'rgba(90, 130, 190, 0.2)' },
};
