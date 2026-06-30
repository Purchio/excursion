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
import { CalibratedCameraView } from './CalibratedCameraView';
import { FallingNotes } from './FallingNotes';
import { MicPermissionHelp } from './MicPermissionHelp';
import { PianoKeyboard } from './PianoKeyboard';
import { ScrollMicBanner } from './ScrollMicBanner';
import { queryMicPermission } from '../utils/deviceUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, ChevronLeft } from 'lucide-react';

interface ScrollPracticeModeProps {
  song: TimedSong;
  onBack: () => void;
  onSwitchToGuided?: () => void;
}

export function ScrollPracticeMode({ song, onBack, onSwitchToGuided }: ScrollPracticeModeProps) {
  const { calibration } = useCalibration();
  // Mic off by default — full MIDI arrangements + speaker playback confuse pitch detection
  const [micEnabled, setMicEnabled] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [hitCount, setHitCount] = useState(0);
  const scoredRef = useRef<Set<string>>(new Set());

  const audioKeys = calibration?.audioKeys ?? [];

  const {
    isListening,
    detectedMidi,
    detectedNote,
    volume,
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
    speed,
    setSpeed,
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

  const primaryMidi = leadAtHit.find((n) => n.hand === 'right')?.midi
    ?? leadAtHit[0]?.midi
    ?? null;

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
    <div className="practice-mode scroll-practice space-y-4">
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
        <Badge>Scroll mode</Badge>
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

      <div className="space-y-1">
        <Progress value={progress * 100} className="h-1.5" />
        <p className="text-center text-xs text-muted-foreground">
          {formatDuration(currentTimeMs)} / {formatDuration(song.durationMs)}
        </p>
      </div>

      <FallingNotes
        notes={song.notes}
        currentTimeMs={currentTimeMs}
        isPlaying={isPlaying}
      />

      {!isPlaying && currentTimeMs === 0 ? (
        <Alert>
          <AlertDescription>
            <p className="font-medium text-foreground">Falling notes + playback</p>
            <p className="mt-1 text-sm">
              Blue = right hand, red = left. Numbers = fingers.
              {micEnabled
                ? ' Mic verify is on — speaker audio mutes so the iPad only hears your piano.'
                : ' Turn on Mic verify to check keys on your real piano.'}
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <PianoKeyboard
            startMidi={song.startMidi}
            endMidi={song.endMidi}
            highlightedMidi={primaryMidi}
            pressedMidi={detectedMidi}
            showFullKeyboard
            fullRangeStart={FULL_KEYBOARD_START}
            fullRangeEnd={FULL_KEYBOARD_END}
          />

          {micEnabled && (
            <ScrollMicBanner
              leadNotes={leadAtHit}
              detectedNote={detectedNote}
              volume={volume}
              matchedNote={matchedNote}
            />
          )}

          {leadLine && (
            <p className="text-center text-sm text-amber-200/90">
              {micEnabled ? 'Target: ' : 'Now: '}{leadLine}
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

      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying && currentTimeMs === 0 ? (
          <Button className="flex-1" size="lg" onClick={handleStart}>
            {micEnabled ? 'Start (mic on, audio muted)' : 'Start playback'}
          </Button>
        ) : isPlaying ? (
          <Button variant="secondary" onClick={handlePause}>
            Pause
          </Button>
        ) : (
          <Button onClick={handleResume}>Resume</Button>
        )}
        {(isPlaying || currentTimeMs > 0) && (
          <Button variant="outline" onClick={handleStop}>
            Stop
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Label htmlFor="speed">Speed</Label>
          <select
            id="speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value={0.5}>0.5×</option>
            <option value={0.75}>0.75×</option>
            <option value={1}>1×</option>
            <option value={1.25}>1.25×</option>
          </select>
        </div>
      </div>

      {micEnabled && isPlaying && (
        <p className="text-center text-sm text-muted-foreground">
          {hitCount} notes verified on your piano
        </p>
      )}

      {micError && (
        <Alert variant="destructive">
          <AlertDescription>{micError}</AlertDescription>
        </Alert>
      )}

      <CalibratedCameraView
        enabled={showCamera}
        highlightedMidi={primaryMidi}
        detectedMidi={detectedMidi}
      />
    </div>
  );
}
