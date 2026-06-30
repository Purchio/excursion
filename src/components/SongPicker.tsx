import { useState } from 'react';
import type { TimedSong } from '../types/song';
import { MIDI_CATALOG } from '../data/songLibrary';
import { formatDuration } from '../utils/songUtils';
import { MidiUpload } from './MidiUpload';

interface SongPickerProps {
  songs: TimedSong[];
  onSelect: (song: TimedSong) => void;
  onSelectMidi: (catalogId: string) => void;
  onUpload: (song: TimedSong) => void;
  loadingMidiId?: string | null;
}

export function SongPicker({
  songs,
  onSelect,
  onSelectMidi,
  onUpload,
  loadingMidiId,
}: SongPickerProps) {
  const [tab, setTab] = useState<'builtin' | 'midi'>('builtin');

  return (
    <div className="song-picker">
      <h2>Choose a song</h2>
      <p className="subtitle">
        Guided mode for beginners · Scroll mode with falling notes, fingers, and playback for everything else.
      </p>

      <MidiUpload onLoaded={onUpload} />

      <div className="song-tabs">
        <button
          type="button"
          className={tab === 'builtin' ? 'active' : ''}
          onClick={() => setTab('builtin')}
        >
          Built-in ({songs.length})
        </button>
        <button
          type="button"
          className={tab === 'midi' ? 'active' : ''}
          onClick={() => setTab('midi')}
        >
          MIDI library ({MIDI_CATALOG.length})
        </button>
      </div>

      {tab === 'builtin' ? (
        <div className="song-list">
          {songs.map((song) => (
            <button
              key={song.id}
              className="song-card"
              onClick={() => onSelect(song)}
              type="button"
            >
              <div className="song-card-header">
                <span className="song-title">{song.title}</span>
                <span className={`difficulty ${song.difficulty}`}>{song.difficulty}</span>
              </div>
              <span className="song-artist">{song.artist}</span>
              <p className="song-description">{song.description}</p>
              <span className="song-note-count">
                {song.notes.length} notes · {formatDuration(song.durationMs)}
                {song.defaultMode === 'scroll' ? ' · scroll' : ' · guided'}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="song-list">
          {MIDI_CATALOG.map((entry) => (
            <button
              key={entry.id}
              className="song-card song-card--midi"
              onClick={() => onSelectMidi(entry.id)}
              type="button"
              disabled={loadingMidiId === entry.id}
            >
              <div className="song-card-header">
                <span className="song-title">{entry.title}</span>
                <span className="difficulty intermediate">MIDI</span>
              </div>
              <span className="song-artist">{entry.artist}</span>
              <p className="song-description">{entry.description}</p>
              <span className="song-note-count">
                {loadingMidiId === entry.id ? 'Loading…' : 'Tap to load · scroll mode'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
