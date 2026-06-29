export interface KeyCalibration {
  midi: number;
  frequency: number;
}

export interface VisualKeyPosition {
  midi: number;
  x: number;
  y: number;
  isBlack: boolean;
}

export interface KeyboardBounds {
  leftX: number;
  rightX: number;
  keyY: number;
  startMidi: number;
  endMidi: number;
}

export interface PianoCalibration {
  version: 1;
  createdAt: string;
  audioKeys: KeyCalibration[];
  keyboardImage?: string;
  keyboardBounds?: KeyboardBounds;
  visualKeys?: VisualKeyPosition[];
}

export const CALIBRATION_STORAGE_KEY = 'piano-coach-calibration';
