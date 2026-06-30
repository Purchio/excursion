import type { KeyCalibration } from '../types/calibration';
import { frequencyToMidi, midiToFrequency } from './noteUtils';

const MATCH_THRESHOLD_LOG2 = 0.035; // ~half semitone

export function frequencyToCalibratedMidi(
  frequency: number,
  audioKeys: KeyCalibration[],
): number | null {
  if (!audioKeys.length) return frequencyToMidi(frequency);

  let bestMidi: number | null = null;
  let bestDist = Infinity;

  const logFreq = Math.log2(frequency);

  for (const key of audioKeys) {
    const dist = Math.abs(logFreq - Math.log2(key.frequency));
    if (dist < bestDist) {
      bestDist = dist;
      bestMidi = key.midi;
    }
  }

  if (bestDist > MATCH_THRESHOLD_LOG2) {
    const offset = getTuningOffset(audioKeys);
    const adjusted = frequency / offset;
    return frequencyToMidi(adjusted);
  }

  return bestMidi;
}

export function getTuningOffset(audioKeys: KeyCalibration[]): number {
  if (!audioKeys.length) return 1;

  let sum = 0;
  for (const key of audioKeys) {
    const expected = midiToFrequency(key.midi);
    sum += key.frequency / expected;
  }
  return sum / audioKeys.length;
}

export function notesMatchCalibrated(
  detectedMidi: number | null,
  expectedMidi: number,
  audioKeys: KeyCalibration[],
  tolerance = 0,
): boolean {
  if (detectedMidi === null) return false;
  const effectiveTolerance = audioKeys.length >= 8 ? tolerance : 1;
  return Math.abs(detectedMidi - expectedMidi) <= effectiveTolerance;
}

export function averageStableFrequency(samples: number[]): number | null {
  if (samples.length < 5) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.2);
  const trimmed = sorted.slice(trim, sorted.length - trim);
  if (!trimmed.length) return null;
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export function isFrequencyStable(samples: number[], maxCentsDrift = 45, minSamples = 5): boolean {
  if (samples.length < minSamples) return false;
  const recent = samples.slice(-10);
  const logSamples = recent.map((f) => Math.log2(f));
  const mean = logSamples.reduce((a, b) => a + b, 0) / logSamples.length;
  const maxDrift = Math.max(...logSamples.map((l) => Math.abs(l - mean)));
  const centsDrift = maxDrift * 1200 / Math.LN2;
  return centsDrift < maxCentsDrift;
}

export function captureFrequency(samples: number[], rawFrequency: number | null): number | null {
  const avg = averageStableFrequency(samples);
  if (avg) return avg;
  if (rawFrequency && rawFrequency > 27) return rawFrequency;
  return null;
}
