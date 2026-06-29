export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export interface PianoKey {
  midi: number;
  note: string;
  isBlack: boolean;
  finger?: number;
}

const A0_MIDI = 21;
const C8_MIDI = 108;

export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return `${name}${octave}`;
}

export function noteToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  const name = match[1] as NoteName;
  const octave = parseInt(match[2], 10);
  const index = NOTE_NAMES.indexOf(name);
  if (index === -1) throw new Error(`Invalid note name: ${name}`);
  return (octave + 1) * 12 + index;
}

export function isBlackKey(midi: number): boolean {
  const name = NOTE_NAMES[midi % 12];
  return name.includes('#');
}

export function getPianoKeys(startMidi = 48, endMidi = 84): PianoKey[] {
  const keys: PianoKey[] = [];
  for (let midi = startMidi; midi <= endMidi; midi++) {
    keys.push({
      midi,
      note: midiToNote(midi),
      isBlack: isBlackKey(midi),
    });
  }
  return keys;
}

export function frequencyToMidi(frequency: number): number | null {
  if (!frequency || frequency < 27.5 || frequency > 4186) return null;
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function notesMatch(detectedMidi: number | null, expectedMidi: number, tolerance = 1): boolean {
  if (detectedMidi === null) return false;
  return Math.abs(detectedMidi - expectedMidi) <= tolerance;
}

export function fingerLabel(finger?: number): string {
  if (!finger) return '';
  const labels: Record<number, string> = {
    1: 'Thumb',
    2: 'Index',
    3: 'Middle',
    4: 'Ring',
    5: 'Pinky',
  };
  return labels[finger] ?? '';
}

export { A0_MIDI, C8_MIDI };
