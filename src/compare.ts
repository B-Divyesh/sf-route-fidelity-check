import type { ComparisonResult, ComparedSample, Divergence, GeoPoint, XYPoint } from './types';

const EARTH_RADIUS = 6_371_008.8;

export function projectRoutes(first: GeoPoint[], second: GeoPoint[]): [XYPoint[], XYPoint[]] {
  const all = [...first, ...second];
  const refLat = all.reduce((sum, point) => sum + point.lat, 0) / all.length;
  const refLon = all.reduce((sum, point) => sum + point.lon, 0) / all.length;
  const cosLat = Math.cos(refLat * Math.PI / 180);
  const project = (points: GeoPoint[]): XYPoint[] => {
    let progressM = 0;
    return points.map((point, index) => {
      const projected = {
        x: (point.lon - refLon) * Math.PI / 180 * EARTH_RADIUS * cosLat,
        y: -(point.lat - refLat) * Math.PI / 180 * EARTH_RADIUS,
        progressM,
        sourceIndex: index,
      };
      const next = points[index + 1];
      if (next) {
        const dx = (next.lon - point.lon) * Math.PI / 180 * EARTH_RADIUS * cosLat;
        const dy = (next.lat - point.lat) * Math.PI / 180 * EARTH_RADIUS;
        progressM += Math.hypot(dx, dy);
      }
      return projected;
    });
  };
  return [project(first), project(second)];
}

export function resample(points: XYPoint[], spacingM: number): XYPoint[] {
  if (points.length < 2) return points.slice();
  const samples: XYPoint[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    const count = Math.max(1, Math.ceil(segment / spacingM));
    for (let part = 1; part <= count; part += 1) {
      const t = part / count;
      samples.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        progressM: a.progressM + (b.progressM - a.progressM) * t,
        sourceIndex: i - 1,
      });
    }
  }
  return samples;
}

interface IndexedPoint extends XYPoint { index: number }

class PointGrid {
  private readonly cells = new Map<string, IndexedPoint[]>();
  private readonly cellSize: number;
  private readonly points: IndexedPoint[];

  constructor(points: XYPoint[], cellSize: number) {
    this.cellSize = cellSize;
    this.points = points.map((point, index) => ({ ...point, index }));
    for (const point of this.points) {
      const key = this.key(Math.floor(point.x / cellSize), Math.floor(point.y / cellSize));
      const cell = this.cells.get(key) ?? [];
      cell.push(point);
      this.cells.set(key, cell);
    }
  }

  private key(x: number, y: number): string { return `${x},${y}`; }

  nearest(point: XYPoint): IndexedPoint & { distanceM: number } {
    const cx = Math.floor(point.x / this.cellSize);
    const cy = Math.floor(point.y / this.cellSize);
    let nearest: IndexedPoint | undefined;
    let best = Number.POSITIVE_INFINITY;
    for (let ring = 0; ring < 10_000; ring += 1) {
      for (let x = cx - ring; x <= cx + ring; x += 1) {
        for (let y = cy - ring; y <= cy + ring; y += 1) {
          if (ring && x !== cx - ring && x !== cx + ring && y !== cy - ring && y !== cy + ring) continue;
          for (const candidate of this.cells.get(this.key(x, y)) ?? []) {
            const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
            if (distance < best) { best = distance; nearest = candidate; }
          }
        }
      }
      if (nearest && best <= Math.max(0, ring - 1) * this.cellSize) break;
      if (ring > 20 && !nearest) {
        for (const candidate of this.points) {
          const distance = Math.hypot(point.x - candidate.x, point.y - candidate.y);
          if (distance < best) { best = distance; nearest = candidate; }
        }
        break;
      }
    }
    return { ...(nearest ?? this.points[0]), distanceM: best };
  }
}

function measure(source: XYPoint[], target: XYPoint[], thresholdM: number, spacingM: number): ComparedSample[] {
  const samples = resample(source, spacingM);
  const targetSamples = resample(target, spacingM);
  const grid = new PointGrid(targetSamples, Math.max(40, thresholdM * 2));
  return samples.map((sample) => {
    const nearest = grid.nearest(sample);
    // Dense target sampling can overstate true point-to-line distance by at most half a sample.
    const distanceM = Math.max(0, nearest.distanceM - spacingM / 2);
    return { ...sample, distanceM, nearestProgressM: nearest.progressM, divergent: distanceM > thresholdM };
  });
}

function clusterDivergences(intended: ComparedSample[], exported: ComparedSample[], routeLengthM: number, thresholdM: number, spacingM: number): Divergence[] {
  const marks = [
    ...intended.filter((sample) => sample.divergent).map((sample) => ({ progress: sample.progressM, peak: sample.distanceM })),
    ...exported.filter((sample) => sample.divergent).map((sample) => ({ progress: sample.nearestProgressM, peak: sample.distanceM })),
  ].sort((a, b) => a.progress - b.progress);
  if (!marks.length) return [];
  const mergeGap = Math.max(100, thresholdM * 2.5);
  const groups: typeof marks[] = [[marks[0]]];
  for (const mark of marks.slice(1)) {
    const current = groups[groups.length - 1];
    if (mark.progress - current[current.length - 1].progress <= mergeGap) current.push(mark);
    else groups.push([mark]);
  }
  return groups.map((group, index) => {
    const startM = Math.max(0, group[0].progress - spacingM);
    const endM = Math.min(routeLengthM, group[group.length - 1].progress + spacingM);
    return { id: index + 1, startM, endM, peakM: Math.max(...group.map((mark) => mark.peak)), centerM: (startM + endM) / 2 };
  });
}

export function compareRoutes(intendedGeo: GeoPoint[], exportedGeo: GeoPoint[], thresholdM: number): ComparisonResult {
  if (intendedGeo.length < 2 || exportedGeo.length < 2) throw new Error('Both routes need at least two points.');
  const threshold = Math.min(500, Math.max(10, thresholdM));
  const [intended, exported] = projectRoutes(intendedGeo, exportedGeo);
  const spacingM = Math.min(20, Math.max(4, threshold / 4));
  const intendedSamples = measure(intended, exported, threshold, spacingM);
  const exportedSamples = measure(exported, intended, threshold, spacingM);
  const all = [...intendedSamples, ...exportedSamples];
  const within = all.filter((sample) => !sample.divergent).length;
  const routeLengthM = intended[intended.length - 1].progressM;
  const divergences = clusterDivergences(intendedSamples, exportedSamples, routeLengthM, threshold, spacingM);
  const affectedLengthM = divergences.reduce((sum, item) => sum + Math.max(spacingM, item.endM - item.startM), 0);
  return {
    intended,
    exported,
    intendedSamples,
    exportedSamples,
    divergences,
    fidelityPercent: all.length ? within / all.length * 100 : 100,
    maxSeparationM: Math.max(0, ...all.map((sample) => sample.distanceM)),
    affectedLengthM,
    thresholdM: threshold,
  };
}
