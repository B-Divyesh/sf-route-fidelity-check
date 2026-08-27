import { describe, expect, it } from 'vitest';
import { compareRoutes } from './compare';
import type { GeoPoint } from './types';

const line: GeoPoint[] = [
  { lat: 51.5, lon: -0.12 },
  { lat: 51.5, lon: -0.11 },
  { lat: 51.5, lon: -0.10 },
  { lat: 51.5, lon: -0.09 },
];

describe('compareRoutes', () => {
  it('accepts the same geometry with different point density', () => {
    const sparse = [line[0], line[3]];
    const result = compareRoutes(line, sparse, 20);
    expect(result.divergences).toHaveLength(0);
    expect(result.fidelityPercent).toBe(100);
  });

  it('does not treat reversed direction as a divergence', () => {
    const result = compareRoutes(line, [...line].reverse(), 20);
    expect(result.divergences).toHaveLength(0);
  });

  it('finds a material exported detour and reports a peak', () => {
    const detour: GeoPoint[] = [line[0], line[1], { lat: 51.505, lon: -0.105 }, line[2], line[3]];
    const result = compareRoutes(line, detour, 50);
    expect(result.divergences.length).toBeGreaterThan(0);
    expect(result.maxSeparationM).toBeGreaterThan(400);
    expect(result.fidelityPercent).toBeLessThan(100);
  });

  it('clamps thresholds to the supported range', () => {
    expect(compareRoutes(line, line, 1).thresholdM).toBe(10);
    expect(compareRoutes(line, line, 900).thresholdM).toBe(500);
  });
});
