const KEY_PREFIX = 'piano-coach-patterns-done';

function storageKey(songId: string): string {
  return `${KEY_PREFIX}:${songId}`;
}

export function getCompletedPatterns(songId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(songId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function setPatternCompleted(songId: string, patternId: string, done: boolean): void {
  const set = getCompletedPatterns(songId);
  if (done) set.add(patternId);
  else set.delete(patternId);
  localStorage.setItem(storageKey(songId), JSON.stringify([...set]));
}
