import { useRef, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import type { TimedSong } from '../types/song';
import { parseMidiFile } from '../utils/midiParser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Import MIDI</CardTitle>
        <CardDescription>
          From{' '}
          <a
            href="https://ics.uci.edu/~dhirschb/midi/stones/index.html"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            UCI Stones
          </a>
          ,{' '}
          <a
            href="https://ics.uci.edu/~dhirschb/midi/rock/index.html"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            UCI Rock
          </a>
          , or{' '}
          <a
            href="https://github.com/ldrolez/free-midi-chords"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            free-midi-chords
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
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
        <Button
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          <FolderOpen className="h-4 w-4" />
          {loading ? 'Parsing…' : 'Load MIDI file'}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
