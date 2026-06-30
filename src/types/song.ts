export type Hand = 'left' | 'right';
export type SongDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type SongSource = 'builtin' | 'midi' | 'upload';
export type PracticeStyle = 'guided' | 'playalong';

export interface TimedNote {
  midi: number;
  startMs: number;
  durationMs: number;
  velocity: number;
  hand: Hand;
  finger?: number;
}

export interface TimedSong {
  id: string;
  title: string;
  artist: string;
  description: string;
  difficulty: SongDifficulty;
  notes: TimedNote[];
  durationMs: number;
  startMidi: number;
  endMidi: number;
  source: SongSource;
  /** Bundled MIDI path (relative to site root) */
  midiPath?: string;
  /** Preferred practice mode */
  defaultMode?: PracticeStyle;
}
