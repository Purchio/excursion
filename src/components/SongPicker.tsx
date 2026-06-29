import type { Song } from '../data/songs';

interface SongPickerProps {
  songs: Song[];
  onSelect: (song: Song) => void;
}

export function SongPicker({ songs, onSelect }: SongPickerProps) {
  return (
    <div className="song-picker">
      <h2>Choose a song</h2>
      <p className="subtitle">Start with a beginner song, then try the Muse piano intros.</p>
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
            <span className="song-note-count">{song.notes.length} notes</span>
          </button>
        ))}
      </div>
    </div>
  );
}
