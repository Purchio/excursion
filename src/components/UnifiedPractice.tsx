import { useState } from 'react';
import type { TimedSong, PracticeStyle } from '../types/song';
import { PracticeMode } from './PracticeMode';
import { PlayAlongMode } from './PlayAlongMode';
import { legacySongToTimed } from '../utils/songUtils';
import type { Song } from '../data/songs';

interface UnifiedPracticeProps {
  song: TimedSong;
  onBack: () => void;
}

export function UnifiedPractice({ song, onBack }: UnifiedPracticeProps) {
  const [mode, setMode] = useState<PracticeStyle>(song.defaultMode ?? 'playalong');

  if (mode === 'guided') {
    const legacy: Song = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      description: song.description,
      difficulty: song.difficulty === 'advanced' ? 'intermediate' : song.difficulty,
      startMidi: song.startMidi,
      endMidi: song.endMidi,
      notes: song.notes.map((n) => ({
        midi: n.midi,
        durationMs: n.durationMs,
        finger: n.finger,
      })),
    };

    return (
      <PracticeMode
        song={legacy}
        onBack={onBack}
        onSwitchToPlayAlong={() => setMode('playalong')}
      />
    );
  }

  return (
    <PlayAlongMode
      song={song}
      onBack={onBack}
      onSwitchToGuided={() => setMode('guided')}
    />
  );
}

export function timedFromLegacy(song: Song): TimedSong {
  return legacySongToTimed(song);
}
