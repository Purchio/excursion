import { fingerLabel, getPianoKeys, midiToNote, type PianoKey } from '../utils/noteUtils';

interface PianoKeyboardProps {
  startMidi: number;
  endMidi: number;
  highlightedMidi?: number | null;
  pressedMidi?: number | null;
  correctMidi?: number | null;
  showFinger?: number;
}

const WHITE_WIDTH = 36;
const WHITE_HEIGHT = 140;
const BLACK_WIDTH = 22;
const BLACK_HEIGHT = 88;

function getBlackKeyOffset(midi: number, keys: PianoKey[]): number {
  const whiteKeysBefore = keys.filter((k) => !k.isBlack && k.midi < midi).length;
  const note = midi % 12;
  const offsets: Record<number, number> = {
    1: 0.65,
    3: 0.65,
    6: 0.65,
    8: 0.65,
    10: 0.65,
  };
  return whiteKeysBefore * WHITE_WIDTH + (offsets[note] ?? 0.5) * WHITE_WIDTH - BLACK_WIDTH / 2;
}

export function PianoKeyboard({
  startMidi,
  endMidi,
  highlightedMidi,
  pressedMidi,
  correctMidi,
  showFinger,
}: PianoKeyboardProps) {
  const keys = getPianoKeys(startMidi, endMidi);
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);
  const width = whiteKeys.length * WHITE_WIDTH;

  return (
    <div className="piano-container">
      <svg
        viewBox={`0 0 ${width} ${WHITE_HEIGHT + 20}`}
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
            <g key={key.midi}>
              <rect
                x={index * WHITE_WIDTH}
                y={0}
                width={WHITE_WIDTH - 1}
                height={WHITE_HEIGHT}
                rx={2}
                fill={fill}
                stroke="#333"
                strokeWidth={1}
              />
              <text
                x={index * WHITE_WIDTH + WHITE_WIDTH / 2}
                y={WHITE_HEIGHT - 10}
                textAnchor="middle"
                fontSize={9}
                fill="#666"
              >
                {midiToNote(key.midi).replace('#', '♯')}
              </text>
            </g>
          );
        })}

        {blackKeys.map((key) => {
          const x = getBlackKeyOffset(key.midi, keys);
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
              x={x}
              y={0}
              width={BLACK_WIDTH}
              height={BLACK_HEIGHT}
              rx={2}
              fill={fill}
              stroke="#000"
              strokeWidth={1}
            />
          );
        })}
      </svg>

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
