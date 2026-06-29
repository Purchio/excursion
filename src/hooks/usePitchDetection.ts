import { useCallback, useEffect, useRef, useState } from 'react';
import { useCalibration } from '../context/CalibrationContext';
import { detectPitch } from '../utils/pitchDetection';
import { frequencyToCalibratedMidi } from '../utils/calibratedPitch';
import { frequencyToMidi, midiToNote } from '../utils/noteUtils';

interface UsePitchDetectionResult {
  isListening: boolean;
  detectedMidi: number | null;
  detectedNote: string | null;
  rawFrequency: number | null;
  volume: number;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  frequencySamples: number[];
  clearSamples: () => void;
}

export function usePitchDetection(): UsePitchDetectionResult {
  const { calibration } = useCalibration();
  const [isListening, setIsListening] = useState(false);
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [rawFrequency, setRawFrequency] = useState<number | null>(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [frequencySamples, setFrequencySamples] = useState<number[]>([]);

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
      setRawFrequency(frequency);
      const audioKeys = calibration?.audioKeys ?? [];
      const midi =
        audioKeys.length > 0
          ? frequencyToCalibratedMidi(frequency, audioKeys)
          : frequencyToMidi(frequency);

      if (midi !== null) {
        setDetectedMidi(midi);
        setDetectedNote(midiToNote(midi));
        if (rms > 0.02) {
          setFrequencySamples((prev) => [...prev.slice(-30), frequency]);
        }
      }
    } else {
      setRawFrequency(null);
      setDetectedMidi(null);
      setDetectedNote(null);
    }

    rafRef.current = requestAnimationFrame(analyze);
  }, [calibration?.audioKeys]);

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
    setRawFrequency(null);
    setVolume(0);
  }, []);

  const clearSamples = useCallback(() => {
    setFrequencySamples([]);
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    clearSamples();
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
  }, [analyze, clearSamples]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return {
    isListening,
    detectedMidi,
    detectedNote,
    rawFrequency,
    volume,
    error,
    startListening,
    stopListening,
    frequencySamples,
    clearSamples,
  };
}
