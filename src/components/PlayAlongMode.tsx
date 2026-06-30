import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TimedSong } from '../types/song';
import { useCalibration } from '../context/CalibrationContext';
import { useMidiPlayback } from '../hooks/useMidiPlayback';
import { usePitchDetection } from '../hooks/usePitchDetection';
import { notesMatchCalibrated } from '../utils/calibratedPitch';
import { FULL_KEYBOARD_END, FULL_KEYBOARD_START } from '../utils/keyboardLayout';
import { formatDuration } from '../utils/songUtils';
import {
  formatLeadNotesLine,
  getLeadNotesAtHitLine,
  matchAnyExpected,
} from '../utils/scrollPractice';
import { getHandMoments, midisForMoment } from '../utils/handPlan';
import { CalibratedCameraView } from './CalibratedCameraView';
import { HandPlan } from './HandPlan';
import { MicPermissionHelp } from './MicPermissionHelp';
import { PianoKeyboard } from './PianoKeyboard';
import { BpmControl } from './BpmControl';
import { queryMicPermission } from '../utils/deviceUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, ChevronLeft, Pause, Play, Square } from 'lucide-react';

interface PlayAlongModeProps {
  song: TimedSong;
  onBack: () => void;
  onSwitchToGuided?: () => void;
}

export function PlayAlongMode({ song, onBack, onSwitchToGuided }: PlayAlongModeProps) {
  const { calibration } = useCalibration();
  const [micEnabled, setMicEnabled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [hitCount, setHitCount] = useState(0);
  const scoredRef = useRef<Set<string>>(new Set());

  const audioKeys = calibration?.audioKeys ?? [];

  const {
    isListening,
    detectedMidi,
    error: micError,
    startListening,
    stopListening,
  } = usePitchDetection();

  const onComplete = useCallback(() => {
    if (micEnabled) stopListening();
  }, [micEnabled, stopListening]);

  const {
    isPlaying,
    currentTimeMs,
    bpm,
    setBpm,
    play,
    pause,
    resume,
    stop,
  } = useMidiPlayback({
    notes: song.notes,
    muted: micEnabled,
    onComplete,
  });

  const leadAtHit = useMemo(
    () => getLeadNotesAtHitLine(song.notes, currentTimeMs, 150),
    [song.notes, currentTimeMs],
  );

  const moments = useMemo(
    () => getHandMoments(song.notes, currentTimeMs, 6),
    [song.notes, currentTimeMs],
  );

  const nowMoment = moments[0] ?? null;
  const nextMoment = moments[1] ?? null;
  const activeMidis = nowMoment ? midisForMoment(nowMoment) : [];
  const previewMidis = nextMoment ? midisForMoment(nextMoment) : [];

  const matchedNote = useMemo(
    () =>
      matchAnyExpected(detectedMidi, leadAtHit, (d, e) =>
        notesMatchCalibrated(d, e, audioKeys),
      ),
    [detectedMidi, leadAtHit, audioKeys],
  );

  useEffect(() => {
    void queryMicPermission().then(setMicPermission);
  }, []);

  useEffect(() => {
    if (!micEnabled || !isPlaying || !matchedNote) return;
    const key = `${matchedNote.midi}-${matchedNote.startMs}`;
    if (scoredRef.current.has(key)) return;
    scoredRef.current.add(key);
    setHitCount((c) => c + 1);
  }, [matchedNote, micEnabled, isPlaying]);

  const handleStart = async () => {
    scoredRef.current.clear();
    setHitCount(0);
    if (micEnabled) await startListening();
    await play();
  };

  const handlePause = () => {
    pause();
    if (micEnabled) stopListening();
  };

  const handleResume = async () => {
    if (micEnabled) await startListening();
    await resume();
  };

  const handleStop = () => {
    stop();
    if (micEnabled) stopListening();
    scoredRef.current.clear();
  };

  const progress = song.durationMs > 0 ? currentTimeMs / song.durationMs : 0;
  const leadLine = formatLeadNotesLine(leadAtHit);

  return (
    <div className="practice-mode playalong space-y-4">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Songs
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{song.title}</h2>
          <p className="truncate text-sm text-muted-foreground">{song.artist}</p>
        </div>
        <Button
          variant={showCamera ? 'secondary' : 'outline'}
          size="icon"
          onClick={() => setShowCamera((v) => !v)}
          title="Toggle camera"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">Play along</Badge>
        {onSwitchToGuided && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onSwitchToGuided}>
            Switch to guided
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Switch id="mic-verify" checked={micEnabled} onCheckedChange={setMicEnabled} />
          <Label htmlFor="mic-verify" className="text-sm text-muted-foreground">
            Mic verify
          </Label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
        {!isPlaying && currentTimeMs === 0 ? (
          <Button size="icon" onClick={handleStart} title="Start">
            <Play className="h-4 w-4" />
          </Button>
        ) : isPlaying ? (
          <Button size="icon" variant="secondary" onClick={handlePause} title="Pause">
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="icon" onClick={handleResume} title="Resume">
            <Play className="h-4 w-4" />
          </Button>
        )}
        {(isPlaying || currentTimeMs > 0) && (
          <Button size="icon" variant="outline" onClick={handleStop} title="Stop">
            <Square className="h-3.5 w-3.5" />
          </Button>
        )}
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatDuration(currentTimeMs)} / {formatDuration(song.durationMs)}
        </span>
        <div className="ml-auto">
          <BpmControl bpm={bpm} onChange={setBpm} />
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={progress * 100} className="h-1.5" />
      </div>

      {!isPlaying && currentTimeMs === 0 ? (
        <Alert>
          <AlertDescription>
            <p className="font-medium text-foreground">See where your hands go</p>
            <p className="mt-1 text-sm">
              Yellow keys = play now. Dashed keys = next position. Plan both hands like a real
              pianist — no falling notes.
              {micEnabled && ' Mic on mutes speaker audio.'}
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <HandPlan now={nowMoment} upcoming={moments} />

          <PianoKeyboard
            startMidi={song.startMidi}
            endMidi={song.endMidi}
            activeMidis={activeMidis}
            previewMidis={previewMidis}
            pressedMidi={detectedMidi}
            showFullKeyboard
            fullRangeStart={FULL_KEYBOARD_START}
            fullRangeEnd={FULL_KEYBOARD_END}
          />


          {leadLine && (
            <p className="text-center text-sm text-muted-foreground">
              {micEnabled && hitCount > 0 ? `${hitCount} verified · ` : ''}
              Now: {leadLine}
            </p>
          )}
        </>
      )}

      {micEnabled && !isPlaying && currentTimeMs === 0 && (
        <MicPermissionHelp
          onRequestMic={handleStart}
          isListening={isListening}
          error={micError}
          permissionState={micPermission}
        />
      )}

      {!isPlaying && currentTimeMs === 0 && !micEnabled && (
        <Button className="w-full" size="lg" onClick={handleStart}>
          Start
        </Button>
      )}

      {micError && (
        <Alert variant="destructive">
          <AlertDescription>{micError}</AlertDescription>
        </Alert>
      )}

      <CalibratedCameraView
        enabled={showCamera}
        highlightedMidi={activeMidis[0] ?? null}
        detectedMidi={detectedMidi}
      />
    </div>
  );
}
