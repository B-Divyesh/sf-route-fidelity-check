export interface GeoPoint {
  lat: number;
  lon: number;
  ele?: number;
}

export interface RouteData {
  fileName: string;
  name: string;
  points: GeoPoint[];
  lengthM: number;
}

export interface XYPoint {
  x: number;
  y: number;
  progressM: number;
  sourceIndex: number;
}

export interface ComparedSample extends XYPoint {
  distanceM: number;
  nearestProgressM: number;
  divergent: boolean;
}

export interface Divergence {
  id: number;
  startM: number;
  endM: number;
  peakM: number;
  centerM: number;
}

export interface ComparisonResult {
  intended: XYPoint[];
  exported: XYPoint[];
  intendedSamples: ComparedSample[];
  exportedSamples: ComparedSample[];
  divergences: Divergence[];
  fidelityPercent: number;
  maxSeparationM: number;
  affectedLengthM: number;
  thresholdM: number;
}
