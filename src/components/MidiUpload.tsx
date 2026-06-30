import { useRef, useState } from 'react';
import type { TimedSong } from '../types/song';
import { parseMidiFile } from '../utils/midiParser';

interface MidiUploadProps {
  onLoaded: (song: TimedSong) => void;
}

export function MidiUpload({ onLoaded }: MidiUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.mid(i)?$/i)) {
      setError('Please choose a .mid or .midi file');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const song = await parseMidiFile(file);
      onLoaded(song);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse MIDI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="midi-upload">
      <input
        ref={inputRef}
        type="file"
        accept=".mid,.midi,audio/midi"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        className="btn-secondary midi-upload-btn"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? 'Parsing…' : '📂 Load MIDI file'}
      </button>
      {error && <p className="error-text">{error}</p>}
      <p className="midi-upload-hint">
        Import .mid files from{' '}
        <a href="https://ics.uci.edu/~dhirschb/midi/stones/index.html" target="_blank" rel="noreferrer">
          UCI Stones
        </a>
        ,{' '}
        <a href="https://ics.uci.edu/~dhirschb/midi/rock/index.html" target="_blank" rel="noreferrer">
          UCI Rock
        </a>
        , or{' '}
        <a href="https://github.com/ldrolez/free-midi-chords" target="_blank" rel="noreferrer">
          free-midi-chords
        </a>
        .
      </p>
    </div>
  );
}
