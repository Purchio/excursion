import { SONGS } from './songs';
import type { TimedSong } from '../types/song';
import { legacySongToTimed } from '../utils/songUtils';
import { loadMidiFromUrl } from '../utils/midiParser';

const BASE = import.meta.env.BASE_URL;

export const BUILTIN_TIMED_SONGS: TimedSong[] = SONGS.map(legacySongToTimed);

/** Bundled MIDI files — loaded on demand */
export const MIDI_CATALOG: Array<{
  id: string;
  title: string;
  artist: string;
  description: string;
  path: string;
}> = [
  {
    id: 'satisfaction',
    title: '(I Can\'t Get No) Satisfaction',
    artist: 'The Rolling Stones',
    description:
      'Classic rock piano cover — from the UCI MIDI collection. Great for that Spotify rock-piano vibe.',
    path: `${BASE}midi/Satisfaction.mid`,
  },
];

const midiCache = new Map<string, TimedSong>();

export async function loadMidiSong(catalogId: string): Promise<TimedSong> {
  const cached = midiCache.get(catalogId);
  if (cached) return cached;

  const entry = MIDI_CATALOG.find((c) => c.id === catalogId);
  if (!entry) throw new Error(`Unknown MIDI: ${catalogId}`);

  const song = await loadMidiFromUrl(entry.path, {
    id: entry.id,
    title: entry.title,
    artist: entry.artist,
    description: entry.description,
    midiPath: entry.path,
  });
  midiCache.set(catalogId, song);
  return song;
}

export function getAllBuiltinSongs(): TimedSong[] {
  return BUILTIN_TIMED_SONGS;
}
