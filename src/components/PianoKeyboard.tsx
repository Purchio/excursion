import { useEffect, useRef } from 'react';
import { fingerLabel, getPianoKeys, isBlackKey, midiToNote, type PianoKey } from '../utils/noteUtils';

interface PianoKeyboardProps {
  startMidi: number;
  endMidi: number;
  highlightedMidi?: number | null;
  pressedMidi?: number | null;
  correctMidi?: number | null;
  showFinger?: number;
  /** Show full keyboard range for counting keys (scrolls to highlight) */
  showFullKeyboard?: boolean;
  fullRangeStart?: number;
  fullRangeEnd?: number;
}

const PRACTICE_WHITE_WIDTH = 36;
const FULL_WHITE_WIDTH = 22;
const WHITE_HEIGHT = 120;
const BLACK_HEIGHT = 76;

function getBlackKeyOffset(midi: number, keys: PianoKey[], whiteWidth: number, blackWidth: number): number {
  const whiteKeysBefore = keys.filter((k) => !k.isBlack && k.midi < midi).length;
  const note = midi % 12;
  const offsets: Record<number, number> = {
    1: 0.65, 3: 0.65, 6: 0.65, 8: 0.65, 10: 0.65,
  };
  return whiteKeysBefore * whiteWidth + (offsets[note] ?? 0.5) * whiteWidth - blackWidth / 2;
}

export function getWhiteKeyIndex(midi: number, rangeStart: number): number {
  let index = 0;
  for (let m = rangeStart; m < midi; m++) {
    if (!isBlackKey(m)) index++;
  }
  return index + 1;
}

export function PianoKeyboard({
  startMidi,
  endMidi,
  highlightedMidi,
  pressedMidi,
  correctMidi,
  showFinger,
  showFullKeyboard = false,
  fullRangeStart = 36,
  fullRangeEnd = 84,
}: PianoKeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayStart = showFullKeyboard ? fullRangeStart : startMidi;
  const displayEnd = showFullKeyboard ? fullRangeEnd : endMidi;
  const whiteWidth = showFullKeyboard ? FULL_WHITE_WIDTH : PRACTICE_WHITE_WIDTH;
  const blackWidth = showFullKeyboard ? 14 : 22;

  const keys = getPianoKeys(displayStart, displayEnd);
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);
  const width = whiteKeys.length * whiteWidth;

  useEffect(() => {
    if (!highlightedMidi || !containerRef.current) return;
    const target = containerRef.current.querySelector(`[data-midi="${highlightedMidi}"]`);
    target?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [highlightedMidi, displayStart, displayEnd]);

  const whiteKeyPosition =
    highlightedMidi != null ? getWhiteKeyIndex(highlightedMidi, displayStart) : null;

  return (
    <div className={`piano-wrapper ${showFullKeyboard ? 'piano-wrapper--full' : ''}`}>
      {showFullKeyboard && highlightedMidi != null && (
        <p className="piano-position-hint">
          <strong>White key #{whiteKeyPosition}</strong> from the left — scroll the keyboard to
          find the yellow key ({midiToNote(highlightedMidi)})
        </p>
      )}
      <div
        ref={containerRef}
        className={`piano-container ${showFullKeyboard ? 'piano-container--full' : ''}`}
      >
        <svg
          viewBox={`0 0 ${width} ${WHITE_HEIGHT + 16}`}
          className="piano-keyboard"
          role="img"
          aria-label="Piano keyboard"
        >
          {whiteKeys.map((key) => {
            const index = whiteKeys.indexOf(key);
            const isHighlighted = key.midi === highlightedMidi;
            const isPressed = key.midi === pressedMidi;
            const isCorrect = key.midi === correctMidi;
            let fill = '#f5f0e8';
            if (isCorrect) fill = '#4ade80';
            else if (isPressed) fill = '#7c6cff';
            else if (isHighlighted) fill = '#fde68a';

            return (
              <g key={key.midi} data-midi={key.midi}>
                <rect
                  x={index * whiteWidth}
                  y={0}
                  width={whiteWidth - 1}
                  height={WHITE_HEIGHT}
                  rx={2}
                  fill={fill}
                  stroke={isHighlighted ? '#f59e0b' : '#333'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                />
                {(showFullKeyboard || key.midi % 12 === 0) && (
                  <text
                    x={index * whiteWidth + whiteWidth / 2}
                    y={WHITE_HEIGHT - 6}
                    textAnchor="middle"
                    fontSize={showFullKeyboard ? 7 : 9}
                    fill="#666"
                  >
                    {midiToNote(key.midi).replace('#', '♯')}
                  </text>
                )}
              </g>
            );
          })}

          {blackKeys.map((key) => {
            const x = getBlackKeyOffset(key.midi, keys, whiteWidth, blackWidth);
            const isHighlighted = key.midi === highlightedMidi;
            const isPressed = key.midi === pressedMidi;
            const isCorrect = key.midi === correctMidi;
            let fill = '#1a1a24';
            if (isCorrect) fill = '#22c55e';
            else if (isPressed) fill = '#6d5ce0';
            else if (isHighlighted) fill = '#f59e0b';

            return (
              <rect
                key={key.midi}
                data-midi={key.midi}
                x={x}
                y={0}
                width={blackWidth}
                height={BLACK_HEIGHT}
                rx={2}
                fill={fill}
                stroke={isHighlighted ? '#f59e0b' : '#000'}
                strokeWidth={isHighlighted ? 2 : 1}
              />
            );
          })}
        </svg>
      </div>

      {showFinger && highlightedMidi && (
        <div className="finger-hint">
          <span className="finger-number">{showFinger}</span>
          <span className="finger-name">{fingerLabel(showFinger)}</span>
          <span className="finger-note">Play {midiToNote(highlightedMidi)}</span>
        </div>
      )}
    </div>
  );
}
