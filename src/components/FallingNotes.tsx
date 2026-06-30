import { useEffect, useRef } from 'react';
import type { TimedNote } from '../types/song';
import { midiToNote } from '../utils/noteUtils';
import {
  CALM_LANE_COLORS,
  fingerColumnX,
  getUpcomingDisplayNotes,
} from '../utils/fallingNotesDisplay';

interface FallingNotesProps {
  notes: TimedNote[];
  currentTimeMs: number;
  isPlaying?: boolean;
  lookAheadMs?: number;
  height?: number;
}

const BLOCK_H = 44;
const HIT_Y_OFFSET = 36;

function paintFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  notes: TimedNote[],
  timeMs: number,
  lookAheadMs: number,
) {
  const hitY = height - HIT_Y_OFFSET;
  const laneWidth = width / 2;
  const fallDistance = hitY - 24;
  const visible = getUpcomingDisplayNotes(notes, timeMs, 2);

  ctx.fillStyle = '#14141c';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(120, 80, 80, 0.07)';
  ctx.fillRect(0, 0, laneWidth, height);
  ctx.fillStyle = 'rgba(80, 100, 140, 0.07)';
  ctx.fillRect(laneWidth, 0, laneWidth, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, hitY);
  ctx.lineTo(width, hitY);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 10px system-ui, sans-serif';
  ctx.fillText('Left hand', 12, 16);
  ctx.fillText('Right hand', laneWidth + 12, 16);

  for (const note of visible) {
    const timeUntil = note.startMs - timeMs;
    if (timeUntil < -120 || timeUntil > lookAheadMs) continue;

    const laneX = note.hand === 'left' ? 0 : laneWidth;
    const x = fingerColumnX(laneX, laneWidth, note.finger);
    const progress = 1 - timeUntil / lookAheadMs;
    const y = 24 + progress * fallDistance - BLOCK_H;
    const colors = CALM_LANE_COLORS[note.hand];
    const nearHit = timeUntil < 180 && timeUntil >= -80;

    ctx.fillStyle = colors.glow;
    ctx.beginPath();
    ctx.roundRect(x - 22, y - 2, 44, BLOCK_H + 4, 8);
    ctx.fill();

    ctx.fillStyle = nearHit ? colors.fill : colors.fill.replace('0.85', '0.65');
    ctx.beginPath();
    ctx.roundRect(x - 20, y, 40, BLOCK_H, 8);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(note.finger ?? '·'), x, y + 19);

    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(midiToNote(note.midi).replace('#', '♯'), x, y + 34);
  }

  ctx.textAlign = 'left';
}

export function FallingNotes({
  notes,
  currentTimeMs,
  isPlaying = false,
  lookAheadMs = 2800,
  height = 240,
}: FallingNotesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(currentTimeMs);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  timeRef.current = currentTimeMs;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      if (width < 10) return;
      sizeRef.current = { width, height, dpr };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOnce = (t: number) => {
      const { width, height: h, dpr } = sizeRef.current;
      if (width < 10) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintFrame(ctx, width, h, notes, t, lookAheadMs);
    };

    cancelAnimationFrame(rafRef.current);

    if (!isPlaying) {
      drawOnce(currentTimeMs);
      return;
    }

    const loop = () => {
      drawOnce(timeRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [notes, currentTimeMs, isPlaying, lookAheadMs]);

  return (
    <div ref={containerRef} className="falling-notes falling-notes--calm">
      <canvas ref={canvasRef} aria-label="Upcoming notes" />
      <p className="falling-notes-hint">Shows the next 2 notes per hand</p>
    </div>
  );
}
