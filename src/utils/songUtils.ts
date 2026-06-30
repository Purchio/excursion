import type { Song } from '../data/songs';
import type { TimedNote, TimedSong } from '../types/song';
import { assignFingers, handForMidi } from './fingerHeuristics';

export function legacySongToTimed(song: Song): TimedSong {
  let cursor = 0;
  const rawNotes: TimedNote[] = song.notes.map((n) => {
    const note: TimedNote = {
      midi: n.midi,
      startMs: cursor,
      durationMs: n.durationMs,
      velocity: 0.8,
      hand: handForMidi(n.midi),
      finger: n.finger,
    };
    cursor += n.durationMs;
    return note;
  });

  const notes = rawNotes.some((n) => n.finger) ? rawNotes : assignFingers(rawNotes);

  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    description: song.description,
    difficulty: song.difficulty,
    notes,
    durationMs: cursor,
    startMidi: song.startMidi,
    endMidi: song.endMidi,
    source: 'builtin',
    defaultMode: song.difficulty === 'beginner' ? 'guided' : 'scroll',
  };
}

export function getActiveNotesAtTime(notes: TimedNote[], timeMs: number): TimedNote[] {
  return notes.filter((n) => timeMs >= n.startMs && timeMs < n.startMs + n.durationMs);
}

export function getNotesAtHitLine(
  notes: TimedNote[],
  timeMs: number,
  windowMs = 120,
): TimedNote[] {
  return notes.filter((n) => Math.abs(n.startMs - timeMs) <= windowMs);
}

export function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
