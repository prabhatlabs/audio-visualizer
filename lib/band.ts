type Band = [number, number];

export function createFrequencyBands(
  noOfBands: number,
  lowFreq: number,
  highFreq: number,
): Band[] {
  if (noOfBands <= 0) {
    throw new Error("noOfBands must be > 0");
  }

  if (lowFreq <= 0 || highFreq <= lowFreq) {
    throw new Error("Invalid frequency range");
  }

  const bands: Band[] = [];
  const logLow = Math.log10(lowFreq);
  const logHigh = Math.log10(highFreq);
  const step = (logHigh - logLow) / noOfBands;

  for (let i = 0; i < noOfBands; i++) {
    const min = Math.pow(10, logLow + step * i);
    const max = Math.pow(10, logLow + step * (i + 1));
    bands.push([Math.round(min), Math.round(max)]);
  }

  return bands;
}

export function getBandEnergy(
  data: Uint8Array,
  sampleRate: number,
  fftSize: number,
  minHz: number,
  maxHz: number,
) {
  const hzPerBin = sampleRate / fftSize;
  const start = Math.floor(minHz / hzPerBin);
  const end = Math.ceil(maxHz / hzPerBin);

  let sum = 0;
  for (let i = start; i <= end; i++) {
    sum += data[i];
  }

  return sum / (end - start + 1) / 255;
}

export function smooth(current: number, target: number, factor = 0.25) {
  return current + (target - current) * factor;
}

type Point = { x: number; y: number };

export function bandsToPoints(
  bands: number[],
  cx: number,
  cy: number,
  baseRadius: number,
  amplitude: number,
): Point[] {
  const count = bands.length;

  return bands.map((band, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = baseRadius + band * amplitude;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  });
}

export function pointsToPath(points: Point[]): string {
  if (!points.length) return "";

  const d = points.map((p, i) => {
    const next = points[(i + 1) % points.length];
    const cx = (p.x + next.x) / 2;
    const cy = (p.y + next.y) / 2;
    return `${i === 0 ? "M" : "Q"} ${p.x} ${p.y} ${cx} ${cy}`;
  });

  return d.join(" ") + " Z";
}
