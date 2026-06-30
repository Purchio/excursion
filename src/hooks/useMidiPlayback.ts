import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import type { TimedNote } from '../types/song';

interface UseMidiPlaybackOptions {
  notes: TimedNote[];
  muted?: boolean;
  onTimeUpdate?: (timeMs: number) => void;
  onComplete?: () => void;
}

export function useMidiPlayback({ notes, muted = false, onTimeUpdate, onComplete }: UseMidiPlaybackOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [speed, setSpeed] = useState(1);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partRef = useRef<Tone.Part | null>(null);
  const rafRef = useRef<number>(0);
  const startWallRef = useRef(0);
  const pausedAtRef = useRef(0);

  const dispose = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    partRef.current?.dispose();
    partRef.current = null;
    synthRef.current?.dispose();
    synthRef.current = null;
  }, []);

  const buildPart = useCallback(() => {
    dispose();
    if (notes.length === 0) return;

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.8 },
    }).toDestination();
    synth.volume.value = muted ? -Infinity : -8;
    synthRef.current = synth;

    const events = notes.map((n) => ({
      time: n.startMs / 1000,
      midi: n.midi,
      duration: n.durationMs / 1000,
      velocity: n.velocity,
    }));

    const part = new Tone.Part((time, event) => {
      synth.triggerAttackRelease(
        Tone.Frequency(event.midi, 'midi').toFrequency(),
        event.duration,
        time,
        event.velocity,
      );
    }, events);
    part.loop = false;
    part.playbackRate = speed;
    partRef.current = part;
  }, [notes, dispose, speed, muted]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.value = muted ? -Infinity : -8;
  }, [muted]);

  useEffect(() => {
    buildPart();
    return dispose;
  }, [buildPart, dispose]);

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startWallRef.current) * speed + pausedAtRef.current;
    setCurrentTimeMs(elapsed);
    onTimeUpdate?.(elapsed);

    const duration = notes.reduce((m, n) => Math.max(m, n.startMs + n.durationMs), 0);
    if (elapsed >= duration) {
      setIsPlaying(false);
      onComplete?.();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [notes, onTimeUpdate, onComplete, speed]);

  const play = useCallback(async () => {
    await Tone.start();
    buildPart();
    const part = partRef.current;
    if (!part) return;

    part.stop();
    part.cancel(0);
    startWallRef.current = performance.now();
    pausedAtRef.current = 0;
    setCurrentTimeMs(0);
    Tone.Transport.bpm.value = 120;
    Tone.Transport.start();
    part.start(0);
    setIsPlaying(true);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [buildPart, tick]);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    partRef.current?.stop();
    Tone.Transport.pause();
    pausedAtRef.current = currentTimeMs;
    setIsPlaying(false);
  }, [currentTimeMs]);

  const resume = useCallback(async () => {
    await Tone.start();
    const part = partRef.current;
    if (!part) return;
    part.start(0, pausedAtRef.current / 1000);
    Tone.Transport.start();
    startWallRef.current = performance.now();
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    partRef.current?.stop();
    Tone.Transport.stop();
    pausedAtRef.current = 0;
    setCurrentTimeMs(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (partRef.current) partRef.current.playbackRate = speed;
  }, [speed]);

  const seek = useCallback((ms: number) => {
    const wasPlaying = isPlaying;
    partRef.current?.stop();
    pausedAtRef.current = ms;
    setCurrentTimeMs(ms);
    if (wasPlaying) {
      partRef.current?.start(0, ms / 1000);
      startWallRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [isPlaying, tick]);

  return {
    isPlaying,
    currentTimeMs,
    speed,
    setSpeed,
    play,
    pause,
    resume,
    stop,
    seek,
  };
}
