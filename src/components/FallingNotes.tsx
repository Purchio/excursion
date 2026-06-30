import { useEffect, useRef } from 'react';
import type { TimedNote } from '../types/song';
import { midiToNote } from '../utils/noteUtils';

interface FallingNotesProps {
  notes: TimedNote[];
  currentTimeMs: number;
  startMidi: number;
  endMidi: number;
  lookAheadMs?: number;
  height?: number;
}

const LANE_COLORS = {
  left: '#f87171',
  right: '#60a5fa',
} as const;

export function FallingNotes({
  notes,
  currentTimeMs,
  startMidi,
  endMidi,
  lookAheadMs = 4000,
  height = 280,
}: FallingNotesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const hitY = height - 28;
    const laneWidth = width / 2;
    const midiSpan = Math.max(1, endMidi - startMidi);

    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, width, height);

    // Lane backgrounds
    ctx.fillStyle = 'rgba(248, 113, 113, 0.06)';
    ctx.fillRect(0, 0, laneWidth, height);
    ctx.fillStyle = 'rgba(96, 165, 250, 0.06)';
    ctx.fillRect(laneWidth, 0, laneWidth, height);

    // Hit line
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(width, hitY);
    ctx.stroke();

    // Lane labels
    ctx.fillStyle = LANE_COLORS.left;
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillText('LEFT', 10, 18);
    ctx.fillStyle = LANE_COLORS.right;
    ctx.fillText('RIGHT', laneWidth + 10, 18);

    const visible = notes.filter(
      (n) =>
        n.startMs >= currentTimeMs - 200 &&
        n.startMs <= currentTimeMs + lookAheadMs,
    );

    for (const note of visible) {
      const laneX = note.hand === 'left' ? 0 : laneWidth;
      const laneInner = laneWidth - 8;
      const xRatio = (note.midi - startMidi) / midiSpan;
      const x = laneX + 4 + xRatio * laneInner;
      const timeUntilHit = note.startMs - currentTimeMs;
      const y = hitY - (timeUntilHit / lookAheadMs) * (height - 40);
      const noteHeight = Math.max(14, (note.durationMs / lookAheadMs) * (height - 40));
      const w = Math.max(18, laneInner / 14);

      if (y + noteHeight < 0 || y > height) continue;

      const color = LANE_COLORS[note.hand];
      const isPast = timeUntilHit < 0;

      ctx.fillStyle = isPast ? `${color}55` : color;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - noteHeight, w, noteHeight, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(note.finger ?? '·'), x, y - noteHeight / 2 + 4);

      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText(midiToNote(note.midi).replace('#', '♯'), x, y - 4);
    }

    ctx.textAlign = 'left';
  }, [notes, currentTimeMs, startMidi, endMidi, lookAheadMs, height]);

  return (
    <div ref={containerRef} className="falling-notes">
      <canvas ref={canvasRef} aria-label="Falling notes visualization" />
    </div>
  );
}
