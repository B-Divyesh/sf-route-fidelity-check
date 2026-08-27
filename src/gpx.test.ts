import { describe, expect, it } from 'vitest';
import { parseGpxText } from './gpx';

describe('parseGpxText', () => {
  it('reads a GPX track name and points', () => {
    const route = parseGpxText('<gpx><trk><name>Canal &amp; woods</name><trkseg><trkpt lat="51" lon="-1"/><trkpt lat="51.01" lon="-1.01"/></trkseg></trk></gpx>', 'ride.gpx');
    expect(route.name).toBe('Canal & woods');
    expect(route.points).toHaveLength(2);
    expect(route.lengthM).toBeGreaterThan(1000);
  });

  it('falls back to route points', () => {
    const route = parseGpxText('<gpx><rte><rtept lat="1" lon="2"/><rtept lat="1.1" lon="2.1"/></rte></gpx>');
    expect(route.points).toHaveLength(2);
  });

  it('rejects malformed and unsafe inputs with actionable messages', () => {
    expect(() => parseGpxText('not xml')).toThrow(/does not look/i);
    expect(() => parseGpxText('<!DOCTYPE gpx><gpx/>')).toThrow(/unsupported/i);
    expect(() => parseGpxText('<gpx><trkpt lat="999" lon="2"/><trkpt lat="1" lon="2"/></gpx>')).toThrow(/invalid coordinates/i);
  });
});
