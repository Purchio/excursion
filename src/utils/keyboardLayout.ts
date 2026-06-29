import type { KeyboardBounds, VisualKeyPosition } from '../types/calibration';
import { isBlackKey, midiToNote } from './noteUtils';

const BLACK_OFFSETS: Record<number, number> = {
  1: 0.55,
  3: 0.55,
  6: 0.55,
  8: 0.55,
  10: 0.55,
};

export function computeVisualKeyPositions(bounds: KeyboardBounds): VisualKeyPosition[] {
  const positions: VisualKeyPosition[] = [];
  const whiteMidis: number[] = [];

  for (let midi = bounds.startMidi; midi <= bounds.endMidi; midi++) {
    if (!isBlackKey(midi)) whiteMidis.push(midi);
  }

  if (whiteMidis.length === 0) return positions;

  const totalWidth = bounds.rightX - bounds.leftX;
  const whiteWidth = totalWidth / whiteMidis.length;

  for (let midi = bounds.startMidi; midi <= bounds.endMidi; midi++) {
    if (isBlackKey(midi)) {
      const whiteBefore = whiteMidis.filter((w) => w < midi).length;
      const offset = BLACK_OFFSETS[midi % 12] ?? 0.55;
      const x = bounds.leftX + whiteBefore * whiteWidth + offset * whiteWidth;
      positions.push({ midi, x, y: bounds.keyY - 0.04, isBlack: true });
    } else {
      const whiteIndex = whiteMidis.indexOf(midi);
      const x = bounds.leftX + whiteIndex * whiteWidth + whiteWidth / 2;
      positions.push({ midi, x, y: bounds.keyY, isBlack: false });
    }
  }

  return positions;
}

export function getVisualKeyPosition(
  visualKeys: VisualKeyPosition[],
  midi: number,
): VisualKeyPosition | undefined {
  return visualKeys.find((k) => k.midi === midi);
}

export function suggestNoteRange(startMidi: number, endMidi: number): string {
  return `${midiToNote(startMidi)} – ${midiToNote(endMidi)}`;
}

export const CALIBRATION_OCTAVE_START = 48; // C3
export const CALIBRATION_OCTAVE_END = 72; // C5

export function getCalibrationKeySequence(startMidi: number, endMidi: number): number[] {
  const keys: number[] = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    keys.push(midi);
  }
  return keys;
}

export function getWhiteKeySequence(startMidi: number, endMidi: number): number[] {
  const keys: number[] = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    if (!isBlackKey(midi)) keys.push(midi);
  }
  return keys;
}

export function getBlackKeySequence(startMidi: number, endMidi: number): number[] {
  const keys: number[] = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    if (isBlackKey(midi)) keys.push(midi);
  }
  return keys;
}
