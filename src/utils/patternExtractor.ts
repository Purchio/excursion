import type { PracticePattern } from '../types/pattern';
import type { Hand, TimedNote, TimedSong } from '../types/song';

const PHRASE_GAP_MS = 380;
const MIN_PHRASE_NOTES = 2;
const MS_PER_MEASURE = 2000;
const PATTERN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function phraseSignature(notes: TimedNote[]): string {
  const t0 = notes[0]?.startMs ?? 0;
  return notes
    .map((n) => `${n.midi}:${Math.round((n.startMs - t0) / 45)}`)
    .join('|');
}

function splitPhrases(notes: TimedNote[]): TimedNote[][] {
  const sorted = [...notes].sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  const phrases: TimedNote[][] = [];
  let chunk: TimedNote[] = [];
  let lastEnd = 0;

  for (const note of sorted) {
    if (chunk.length > 0 && note.startMs - lastEnd > PHRASE_GAP_MS) {
      if (chunk.length >= MIN_PHRASE_NOTES) phrases.push(chunk);
      chunk = [];
    }
    chunk.push(note);
    lastEnd = Math.max(lastEnd, note.startMs + note.durationMs);
  }
  if (chunk.length >= MIN_PHRASE_NOTES) phrases.push(chunk);

  return phrases;
}

function measureLabel(startMs: number, endMs: number): string {
  const m1 = Math.floor(startMs / MS_PER_MEASURE) + 1;
  const m2 = Math.floor(endMs / MS_PER_MEASURE) + 1;
  return m1 === m2 ? `m.${m1}` : `m.${m1}–${m2}`;
}

function sparklineFromNotes(notes: TimedNote[]): number[] {
  if (notes.length === 0) return [];
  const midis = notes.map((n) => n.midi);
  const min = Math.min(...midis);
  const max = Math.max(...midis);
  const span = Math.max(1, max - min);
  const buckets = 24;
  const t0 = notes[0].startMs;
  const t1 = notes[notes.length - 1].startMs + notes[notes.length - 1].durationMs;
  const spanT = Math.max(1, t1 - t0);
  const result: number[] = [];

  for (let i = 0; i < buckets; i++) {
    const t = t0 + (i / buckets) * spanT;
    const atT = notes.filter((n) => t >= n.startMs && t < n.startMs + n.durationMs);
    const midi = atT.length > 0 ? atT[atT.length - 1].midi : notes[0].midi;
    result.push((midi - min) / span);
  }
  return result;
}

function buildPattern(
  hand: Hand,
  phrase: TimedNote[],
  labelIndex: number,
  occurrences: number,
  songId: string,
): PracticePattern {
  const startMs = phrase[0].startMs;
  const endMs = Math.max(...phrase.map((n) => n.startMs + n.durationMs)) + 80;

  return {
    id: `${songId}-${hand}-${labelIndex}`,
    label: `Pattern ${PATTERN_LETTERS[labelIndex] ?? labelIndex}`,
    hand,
    startMs,
    endMs,
    durationMs: endMs - startMs,
    measureLabel: measureLabel(startMs, endMs),
    repeatGoal: Math.min(8, Math.max(3, occurrences)),
    notes: phrase.map((n) => ({ ...n })),
    sparkline: sparklineFromNotes(phrase),
  };
}

function dedupePhrases(phrases: TimedNote[][]): Array<{ phrase: TimedNote[]; count: number }> {
  const bySig = new Map<string, { phrase: TimedNote[]; count: number }>();
  for (const phrase of phrases) {
    const sig = phraseSignature(phrase);
    const existing = bySig.get(sig);
    if (existing) existing.count++;
    else bySig.set(sig, { phrase, count: 1 });
  }
  return [...bySig.values()].sort((a, b) => a.phrase[0].startMs - b.phrase[0].startMs);
}

function patternsForHand(song: TimedSong, hand: Hand): PracticePattern[] {
  const handNotes = song.notes.filter((n) => n.hand === hand);
  if (handNotes.length < MIN_PHRASE_NOTES) return [];

  const phrases = splitPhrases(handNotes);
  let groups = dedupePhrases(phrases);

  if (groups.length === 0) {
    const mid = Math.floor(handNotes.length / 2);
    groups = [
      { phrase: handNotes.slice(0, mid), count: 3 },
      { phrase: handNotes.slice(mid), count: 3 },
    ].filter((g) => g.phrase.length >= MIN_PHRASE_NOTES);
  }

  return groups.slice(0, 14).map((g, i) =>
    buildPattern(hand, g.phrase, i, g.count, song.id),
  );
}

export function extractPracticePatterns(song: TimedSong): {
  left: PracticePattern[];
  right: PracticePattern[];
} {
  return {
    left: patternsForHand(song, 'left'),
    right: patternsForHand(song, 'right'),
  };
}

/** Shift pattern notes to t=0 for loop playback */
export function normalizePatternNotes(notes: TimedNote[]): TimedNote[] {
  if (notes.length === 0) return [];
  const offset = notes[0].startMs;
  return notes.map((n) => ({
    ...n,
    startMs: n.startMs - offset,
  }));
}

export function patternPlaybackNotes(pattern: PracticePattern, song: TimedSong): TimedNote[] {
  const inWindow = song.notes.filter(
    (n) =>
      n.hand === pattern.hand &&
      n.startMs >= pattern.startMs - 20 &&
      n.startMs < pattern.endMs,
  );
  const source = inWindow.length > 0 ? inWindow : pattern.notes;
  return normalizePatternNotes(source);
}
