import { Midi } from '@tonejs/midi';
import type { SongDifficulty, TimedNote, TimedSong } from '../types/song';
import { assignFingers, handForMidi } from './fingerHeuristics';
import {
  dedupeSimultaneousNotes,
  filterPlayableRange,
  pickPianoTrackIndices,
} from './midiSimplify';

const MIN_NOTE_MS = 80;
const MAX_SONG_MS = 10 * 60 * 1000;

function inferDifficulty(noteCount: number, span: number): SongDifficulty {
  if (noteCount < 80 && span < 24) return 'beginner';
  if (noteCount < 400 && span < 36) return 'intermediate';
  return 'advanced';
}

function computeRange(notes: TimedNote[]): { startMidi: number; endMidi: number } {
  if (notes.length === 0) return { startMidi: 48, endMidi: 84 };
  const midis = notes.map((n) => n.midi);
  const min = Math.min(...midis);
  const max = Math.max(...midis);
  return {
    startMidi: Math.max(21, min - 2),
    endMidi: Math.min(108, max + 2),
  };
}

function cleanTitle(filename: string): string {
  return filename
    .replace(/\.mid(i)?$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseMidiBuffer(
  buffer: ArrayBuffer,
  meta: {
    id?: string;
    title?: string;
    artist?: string;
    description?: string;
    midiPath?: string;
  } = {},
): TimedSong {
  const midi = new Midi(buffer);
  const splitAt = 60;
  const rawNotes: TimedNote[] = [];

  const pianoTracks = pickPianoTrackIndices(midi.tracks);
  const tracksToUse =
    pianoTracks.length > 0 ? pianoTracks.map((i) => midi.tracks[i]) : midi.tracks;

  for (const track of tracksToUse) {
    if (track.channel === 9) continue;
    for (const note of track.notes) {
      const startMs = Math.max(0, note.time * 1000);
      const durationMs = Math.max(MIN_NOTE_MS, note.duration * 1000);
      if (startMs > MAX_SONG_MS) continue;

      rawNotes.push({
        midi: note.midi,
        startMs,
        durationMs,
        velocity: note.velocity,
        hand: handForMidi(note.midi, splitAt),
      });
    }
  }

  rawNotes.sort((a, b) => a.startMs - b.startMs || a.midi - b.midi);
  const simplified = dedupeSimultaneousNotes(filterPlayableRange(rawNotes));
  const notes = assignFingers(simplified);
  const durationMs = notes.reduce(
    (max, n) => Math.max(max, n.startMs + n.durationMs),
    0,
  );
  const { startMidi, endMidi } = computeRange(notes);
  const span = endMidi - startMidi;

  const title = meta.title ?? (midi.name || cleanTitle(meta.id ?? 'imported'));
  const id = meta.id ?? `midi-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id,
    title,
    artist: meta.artist ?? 'MIDI',
    description:
      meta.description ??
      `${notes.length} notes · ${Math.round(durationMs / 1000)}s · import a MIDI file or use bundled songs`,
    difficulty: inferDifficulty(notes.length, span),
    notes,
    durationMs,
    startMidi,
    endMidi,
    source: meta.midiPath ? 'midi' : 'upload',
    midiPath: meta.midiPath,
    defaultMode: 'playalong',
  };
}

export async function loadMidiFromUrl(url: string, meta: Parameters<typeof parseMidiBuffer>[1]): Promise<TimedSong> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load MIDI: ${response.status}`);
  const buffer = await response.arrayBuffer();
  return parseMidiBuffer(buffer, meta);
}

export async function parseMidiFile(file: File): Promise<TimedSong> {
  const buffer = await file.arrayBuffer();
  return parseMidiBuffer(buffer, {
    id: `upload-${Date.now()}`,
    title: cleanTitle(file.name),
    artist: 'Your upload',
    description: `Imported from ${file.name}`,
  });
}
