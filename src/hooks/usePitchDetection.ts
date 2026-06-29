import { useCallback, useEffect, useRef, useState } from 'react';
import { detectPitch } from '../utils/pitchDetection';
import { frequencyToMidi } from '../utils/noteUtils';

interface UsePitchDetectionResult {
  isListening: boolean;
  detectedMidi: number | null;
  detectedNote: string | null;
  volume: number;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export function usePitchDetection(): UsePitchDetectionResult {
  const [isListening, setIsListening] = useState(false);
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array | null>(null);

  const analyze = useCallback(() => {
    const analyser = analyserRef.current;
    const buffer = bufferRef.current;
    if (!analyser || !buffer) return;

    analyser.getFloatTimeDomainData(buffer);

    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    setVolume(rms);

    const frequency = detectPitch(buffer, analyser.context.sampleRate);
    if (frequency) {
      const midi = frequencyToMidi(frequency);
      if (midi !== null) {
        const octave = Math.floor(midi / 12) - 1;
        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        setDetectedMidi(midi);
        setDetectedNote(`${names[midi % 12]}${octave}`);
      }
    } else {
      setDetectedMidi(null);
      setDetectedNote(null);
    }

    rafRef.current = requestAnimationFrame(analyze);
  }, []);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setDetectedMidi(null);
    setDetectedNote(null);
    setVolume(0);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      await audioContext.resume();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      analyserRef.current = analyser;
      bufferRef.current = new Float32Array(analyser.fftSize);

      setIsListening(true);
      rafRef.current = requestAnimationFrame(analyze);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Microphone access denied. Please allow mic access in Settings.',
      );
    }
  }, [analyze]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return {
    isListening,
    detectedMidi,
    detectedNote,
    volume,
    error,
    startListening,
    stopListening,
  };
}
