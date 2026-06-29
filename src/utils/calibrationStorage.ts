import type { PianoCalibration } from '../types/calibration';
import { CALIBRATION_STORAGE_KEY } from '../types/calibration';

export function loadCalibration(): PianoCalibration | null {
  try {
    const raw = localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PianoCalibration;
    if (data.version !== 1 || !Array.isArray(data.audioKeys)) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveCalibration(calibration: PianoCalibration): void {
  localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));
}

export function clearCalibration(): void {
  localStorage.removeItem(CALIBRATION_STORAGE_KEY);
}

export function isAudioCalibrated(calibration: PianoCalibration | null): boolean {
  return (calibration?.audioKeys.length ?? 0) >= 8;
}

export function isVisuallyCalibrated(calibration: PianoCalibration | null): boolean {
  return (
    !!calibration?.keyboardImage &&
    !!calibration.keyboardBounds &&
    (calibration.visualKeys?.length ?? 0) > 0
  );
}
