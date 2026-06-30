import { RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DEFAULT_BPM } from '@/hooks/useMidiPlayback';

interface BpmControlProps {
  bpm: number;
  onChange: (bpm: number) => void;
  disabled?: boolean;
}

const MIN_BPM = 40;
const MAX_BPM = 160;

export function BpmControl({ bpm, onChange, disabled }: BpmControlProps) {
  const clamp = (v: number) => Math.min(MAX_BPM, Math.max(MIN_BPM, v));

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="bpm" className="text-xs text-muted-foreground">
        BPM
      </Label>
      <input
        id="bpm"
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        step={5}
        value={bpm}
        disabled={disabled}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-1.5 w-20 accent-primary sm:w-28"
      />
      <input
        type="number"
        min={MIN_BPM}
        max={MAX_BPM}
        value={bpm}
        disabled={disabled}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="w-14 rounded-md border border-input bg-background px-2 py-1 text-center text-sm tabular-nums"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={disabled || bpm === DEFAULT_BPM}
        title={`Reset to ${DEFAULT_BPM} BPM`}
        onClick={() => onChange(DEFAULT_BPM)}
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
