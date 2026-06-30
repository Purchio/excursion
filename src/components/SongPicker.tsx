import type { TimedSong } from '../types/song';
import { MIDI_CATALOG } from '../data/songLibrary';
import { formatDuration } from '../utils/songUtils';
import { MidiUpload } from './MidiUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SongPickerProps {
  songs: TimedSong[];
  onSelect: (song: TimedSong) => void;
  onSelectMidi: (catalogId: string) => void;
  onUpload: (song: TimedSong) => void;
  loadingMidiId?: string | null;
}

function difficultyVariant(difficulty: string): 'default' | 'secondary' | 'warning' {
  if (difficulty === 'beginner') return 'secondary';
  if (difficulty === 'advanced') return 'warning';
  return 'default';
}

function SongCard({
  title,
  artist,
  description,
  meta,
  badge,
  badgeVariant = 'default',
  onClick,
  disabled,
  dashed,
}: {
  title: string;
  artist: string;
  description: string;
  meta: string;
  badge: string;
  badgeVariant?: 'default' | 'secondary' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  dashed?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full text-left disabled:opacity-60"
    >
      <Card
        className={cn(
          'transition-colors hover:border-primary/50 hover:bg-accent/30',
          dashed && 'border-dashed',
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{title}</CardTitle>
            <Badge variant={badgeVariant}>{badge}</Badge>
          </div>
          <CardDescription className="text-xs font-medium text-muted-foreground/80">
            {artist}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </CardContent>
      </Card>
    </button>
  );
}

export function SongPicker({
  songs,
  onSelect,
  onSelectMidi,
  onUpload,
  loadingMidiId,
}: SongPickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Choose a song</h2>
        <p className="text-sm text-muted-foreground">
          Guided for beginners · Play along with hand planning for everything else.
        </p>
      </div>

      <MidiUpload onLoaded={onUpload} />

      <Tabs defaultValue="builtin">
        <TabsList>
          <TabsTrigger value="builtin">Built-in ({songs.length})</TabsTrigger>
          <TabsTrigger value="midi">MIDI library ({MIDI_CATALOG.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="builtin" className="space-y-3">
          {songs.map((song) => (
            <SongCard
              key={song.id}
              title={song.title}
              artist={song.artist}
              description={song.description}
              badge={song.difficulty}
              badgeVariant={difficultyVariant(song.difficulty)}
              meta={`${song.notes.length} notes · ${formatDuration(song.durationMs)} · ${song.defaultMode === 'playalong' ? 'play along' : 'guided'}`}
              onClick={() => onSelect(song)}
            />
          ))}
        </TabsContent>

        <TabsContent value="midi" className="space-y-3">
          {MIDI_CATALOG.map((entry) => (
            <SongCard
              key={entry.id}
              title={entry.title}
              artist={entry.artist}
              description={entry.description}
              badge="MIDI"
              dashed
              disabled={loadingMidiId === entry.id}
              meta={loadingMidiId === entry.id ? 'Loading…' : 'Tap to load · play along'}
              onClick={() => onSelectMidi(entry.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
