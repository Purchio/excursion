export interface SongNote {
  midi: number;
  durationMs: number;
  finger?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  description: string;
  difficulty: 'beginner' | 'intermediate';
  startMidi: number;
  endMidi: number;
  notes: SongNote[];
}

export const SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Traditional',
    description: 'A gentle first song — learn one note at a time with your right hand.',
    difficulty: 'beginner',
    startMidi: 60,
    endMidi: 72,
    notes: [
      { midi: 60, durationMs: 600, finger: 1 },
      { midi: 60, durationMs: 600, finger: 1 },
      { midi: 67, durationMs: 600, finger: 5 },
      { midi: 67, durationMs: 600, finger: 5 },
      { midi: 69, durationMs: 600, finger: 1 },
      { midi: 69, durationMs: 600, finger: 1 },
      { midi: 67, durationMs: 900, finger: 5 },
      { midi: 65, durationMs: 600, finger: 4 },
      { midi: 65, durationMs: 600, finger: 4 },
      { midi: 64, durationMs: 600, finger: 3 },
      { midi: 64, durationMs: 600, finger: 3 },
      { midi: 62, durationMs: 600, finger: 2 },
      { midi: 62, durationMs: 600, finger: 2 },
      { midi: 60, durationMs: 900, finger: 1 },
    ],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy (Theme)',
    artist: 'Beethoven',
    description: 'The famous melody — great for building confidence after your first song.',
    difficulty: 'beginner',
    startMidi: 60,
    endMidi: 72,
    notes: [
      { midi: 64, durationMs: 500, finger: 3 },
      { midi: 64, durationMs: 500, finger: 3 },
      { midi: 65, durationMs: 500, finger: 4 },
      { midi: 67, durationMs: 500, finger: 5 },
      { midi: 67, durationMs: 500, finger: 5 },
      { midi: 65, durationMs: 500, finger: 4 },
      { midi: 64, durationMs: 500, finger: 3 },
      { midi: 62, durationMs: 500, finger: 2 },
      { midi: 60, durationMs: 500, finger: 1 },
      { midi: 60, durationMs: 500, finger: 1 },
      { midi: 62, durationMs: 500, finger: 2 },
      { midi: 64, durationMs: 500, finger: 3 },
      { midi: 64, durationMs: 750, finger: 3 },
      { midi: 62, durationMs: 250, finger: 2 },
      { midi: 62, durationMs: 1000, finger: 2 },
    ],
  },
  {
    id: 'madness-intro',
    title: 'Madness (Piano Intro)',
    artist: 'Muse',
    description:
      'The haunting piano opening from Madness — simplified for beginners. Uses a repeating D–F–A pattern in the right hand.',
    difficulty: 'intermediate',
    startMidi: 50,
    endMidi: 74,
    notes: [
      { midi: 62, durationMs: 800, finger: 1 },
      { midi: 65, durationMs: 800, finger: 3 },
      { midi: 69, durationMs: 800, finger: 5 },
      { midi: 65, durationMs: 800, finger: 3 },
      { midi: 62, durationMs: 800, finger: 1 },
      { midi: 65, durationMs: 800, finger: 3 },
      { midi: 69, durationMs: 800, finger: 5 },
      { midi: 72, durationMs: 1200, finger: 5 },
      { midi: 69, durationMs: 800, finger: 5 },
      { midi: 65, durationMs: 800, finger: 3 },
      { midi: 62, durationMs: 800, finger: 1 },
      { midi: 57, durationMs: 800, finger: 5 },
      { midi: 62, durationMs: 800, finger: 1 },
      { midi: 65, durationMs: 800, finger: 3 },
      { midi: 69, durationMs: 1200, finger: 5 },
    ],
  },
  {
    id: 'space-dementia-intro',
    title: 'Space Dementia (Opening)',
    artist: 'Muse',
    description:
      'The dramatic low piano motif from Space Dementia — slow, moody, and perfect for feeling the keys.',
    difficulty: 'intermediate',
    startMidi: 36,
    endMidi: 60,
    notes: [
      { midi: 43, durationMs: 1000, finger: 5 },
      { midi: 48, durationMs: 1000, finger: 1 },
      { midi: 50, durationMs: 1000, finger: 2 },
      { midi: 55, durationMs: 1000, finger: 5 },
      { midi: 50, durationMs: 1000, finger: 2 },
      { midi: 48, durationMs: 1000, finger: 1 },
      { midi: 43, durationMs: 1000, finger: 5 },
      { midi: 41, durationMs: 1000, finger: 4 },
      { midi: 43, durationMs: 1000, finger: 5 },
      { midi: 48, durationMs: 1000, finger: 1 },
      { midi: 50, durationMs: 1000, finger: 2 },
      { midi: 55, durationMs: 1500, finger: 5 },
    ],
  },
];

export function getSongById(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}
