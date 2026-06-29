const MIN_FREQUENCY = 60;
const MIN_VOLUME = 0.015;

export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const rms = getRms(buffer);
  if (rms < MIN_VOLUME) return null;

  const size = buffer.length;
  const maxSamples = Math.floor(size / 2);
  const correlations = new Float32Array(maxSamples);

  for (let lag = 0; lag < maxSamples; lag++) {
    let sum = 0;
    for (let i = 0; i < maxSamples; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    correlations[lag] = sum;
  }

  let bestLag = -1;
  let bestCorr = 0;

  const minLag = Math.floor(sampleRate / 2000);
  const maxLag = Math.floor(sampleRate / MIN_FREQUENCY);

  for (let lag = minLag; lag < maxLag && lag < correlations.length; lag++) {
    if (correlations[lag] > bestCorr) {
      const prev = correlations[lag - 1] ?? 0;
      const next = correlations[lag + 1] ?? 0;
      if (correlations[lag] > prev && correlations[lag] > next) {
        bestCorr = correlations[lag];
        bestLag = lag;
      }
    }
  }

  if (bestLag <= 0) return null;

  const y1 = correlations[bestLag - 1] ?? 0;
  const y2 = correlations[bestLag];
  const y3 = correlations[bestLag + 1] ?? 0;
  const refinedLag = bestLag + (y3 - y1) / (2 * (2 * y2 - y1 - y3));

  return sampleRate / refinedLag;
}

function getRms(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}
