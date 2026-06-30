import { useCallback, useMemo, useState } from 'react';
import type { TimedSong } from '../types/song';
import type { PracticePattern } from '../types/pattern';
import { patternPlaybackNotes } from '../utils/patternExtractor';
import { useMidiPlayback } from '../hooks/useMidiPlayback';
import { getHandMoments, midisForMoment } from '../utils/handPlan';
import { formatDuration } from '../utils/songUtils';
import { HandPlan } from './HandPlan';
import { PianoKeyboard } from './PianoKeyboard';
import { BpmControl } from './BpmControl';
import { PatternSparkline } from './PatternSparkline';
import { FULL_KEYBOARD_END, FULL_KEYBOARD_START } from '../utils/keyboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Pause, Play, Repeat, Square } from 'lucide-react';

interface PatternLoopModeProps {
  song: TimedSong;
  pattern: PracticePattern;
  onBack: () => void;
}

export function PatternLoopMode({ song, pattern, onBack }: PatternLoopModeProps) {
  const playbackNotes = useMemo(
    () => patternPlaybackNotes(pattern, song),
    [pattern, song],
  );

  const loopRegion = useMemo(
    () => ({
      startMs: 0,
      endMs: pattern.durationMs,
    }),
    [pattern.durationMs],
  );

  const [repsDone, setRepsDone] = useState(0);

  const onLoop = useCallback(() => {
    setRepsDone((c) => c + 1);
  }, []);

  const {
    isPlaying,
    currentTimeMs,
    bpm,
    setBpm,
    play,
    pause,
    resume,
    stop,
    regionEndMs,
  } = useMidiPlayback({
    notes: playbackNotes,
    loop: loopRegion,
    onLoop,
  });

  const moments = useMemo(
    () => getHandMoments(playbackNotes, currentTimeMs, 5),
    [playbackNotes, currentTimeMs],
  );
  const nowMoment = moments[0] ?? null;
  const nextMoment = moments[1] ?? null;
  const activeMidis = nowMoment ? midisForMoment(nowMoment) : [];
  const previewMidis = nextMoment ? midisForMoment(nextMoment) : [];

  const progress = regionEndMs > 0 ? (currentTimeMs / regionEndMs) * 100 : 0;
  const handColor = pattern.hand === 'left' ? 'text-red-400' : 'text-blue-400';

  const handleStart = () => {
    setRepsDone(0);
    void play();
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Patterns
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{pattern.label}</h2>
          <p className={`truncate text-sm ${handColor}`}>
            {pattern.hand === 'left' ? 'Left hand' : 'Right hand'} · {pattern.measureLabel}
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Repeat className="h-3 w-3" />
          Loop
        </Badge>
      </header>

      <div className="rounded-lg border border-border bg-card p-3">
        <PatternSparkline points={pattern.sparkline} />
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Goal: {pattern.repeatGoal}× · Looped: {repsDone} time{repsDone !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
        {!isPlaying && currentTimeMs < 100 ? (
          <Button size="icon" onClick={handleStart} title="Start loop">
            <Play className="h-4 w-4" />
          </Button>
        ) : isPlaying ? (
          <Button size="icon" variant="secondary" onClick={pause} title="Pause">
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" onClick={resume} title="Resume">
            <Play className="h-4 w-4" />
          </Button>
        )}
        <Button size="icon" variant="outline" onClick={stop} title="Stop">
          <Square className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatDuration(currentTimeMs)} / {formatDuration(regionEndMs)}
        </span>
        <div className="ml-auto">
          <BpmControl bpm={bpm} onChange={setBpm} />
        </div>
      </div>

      <Progress value={Math.min(100, progress)} className="h-1.5" />

      <HandPlan now={nowMoment} upcoming={moments} />

      <PianoKeyboard
        startMidi={song.startMidi}
        endMidi={song.endMidi}
        activeMidis={activeMidis}
        previewMidis={previewMidis}
        showFullKeyboard
        fullRangeStart={FULL_KEYBOARD_START}
        fullRangeEnd={FULL_KEYBOARD_END}
      />

      <p className="text-center text-xs text-muted-foreground">
        This pattern loops automatically — slow the BPM until it feels easy, then speed up.
      </p>
    </div>
  );
}
