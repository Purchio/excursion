import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { PianoCalibration } from '../types/calibration';
import { loadCalibration, saveCalibration, clearCalibration } from '../utils/calibrationStorage';

interface CalibrationContextValue {
  calibration: PianoCalibration | null;
  setCalibration: (calibration: PianoCalibration) => void;
  updateCalibration: (partial: Partial<PianoCalibration>) => void;
  resetCalibration: () => void;
  hasAudioCalibration: boolean;
  hasVisualCalibration: boolean;
}

const CalibrationContext = createContext<CalibrationContextValue | null>(null);

export function CalibrationProvider({ children }: { children: ReactNode }) {
  const [calibration, setCalibrationState] = useState<PianoCalibration | null>(() => loadCalibration());

  const setCalibration = useCallback((data: PianoCalibration) => {
    saveCalibration(data);
    setCalibrationState(data);
  }, []);

  const updateCalibration = useCallback((partial: Partial<PianoCalibration>) => {
    setCalibrationState((prev) => {
      const next: PianoCalibration = {
        version: 1,
        createdAt: prev?.createdAt ?? new Date().toISOString(),
        audioKeys: prev?.audioKeys ?? [],
        ...prev,
        ...partial,
      };
      saveCalibration(next);
      return next;
    });
  }, []);

  const resetCalibration = useCallback(() => {
    clearCalibration();
    setCalibrationState(null);
  }, []);

  const value = useMemo(
    () => ({
      calibration,
      setCalibration,
      updateCalibration,
      resetCalibration,
      hasAudioCalibration: (calibration?.audioKeys.length ?? 0) >= 8,
      hasVisualCalibration:
        !!calibration?.keyboardImage &&
        !!calibration?.keyboardBounds &&
        (calibration?.visualKeys?.length ?? 0) > 0,
    }),
    [calibration, setCalibration, updateCalibration, resetCalibration],
  );

  return <CalibrationContext.Provider value={value}>{children}</CalibrationContext.Provider>;
}

export function useCalibration() {
  const ctx = useContext(CalibrationContext);
  if (!ctx) throw new Error('useCalibration must be used within CalibrationProvider');
  return ctx;
}
