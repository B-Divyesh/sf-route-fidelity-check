import type { GeoPoint, RouteData } from './types';

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_POINTS = 200_000;

export function haversineM(a: GeoPoint, b: GeoPoint): number {
  const rad = Math.PI / 180;
  const p1 = a.lat * rad;
  const p2 = b.lat * rad;
  const dp = (b.lat - a.lat) * rad;
  const dl = (b.lon - a.lon) * rad;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 6_371_008.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function routeLength(points: GeoPoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) total += haversineM(points[index - 1], points[index]);
  return total;
}

function decodeEntities(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => ({
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
  })[entity] ?? entity);
}

function attribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1];
}

export function parseGpxText(text: string, fileName = 'route.gpx'): RouteData {
  if (!text.trim()) throw new Error('This file is empty. Choose a GPX file with a track or route.');
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('This GPX contains unsupported document declarations. Export a plain GPX file and try again.');
  if (!/<gpx\b/i.test(text)) throw new Error('This does not look like a GPX file. Choose a .gpx export.');

  const trackTags = text.match(/<trkpt\b[^>]*>/gi) ?? [];
  const routeTags = text.match(/<rtept\b[^>]*>/gi) ?? [];
  const tags = trackTags.length ? trackTags : routeTags;
  if (tags.length > MAX_POINTS) throw new Error(`This route has more than ${MAX_POINTS.toLocaleString()} points. Simplify it before comparing.`);

  const points: GeoPoint[] = [];
  for (const tag of tags) {
    const lat = Number(attribute(tag, 'lat'));
    const lon = Number(attribute(tag, 'lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      throw new Error('A track point has invalid coordinates. Re-export the GPX and try again.');
    }
    points.push({ lat, lon });
  }
  if (points.length < 2) throw new Error('No usable GPX track was found. The file needs at least two track or route points.');

  const nameMatch = text.match(/<(?:trk|rte)\b[^>]*>[\s\S]*?<name\b[^>]*>([\s\S]*?)<\/name>/i);
  const name = nameMatch ? decodeEntities(nameMatch[1].replace(/<[^>]+>/g, '').trim()) : fileName.replace(/\.gpx$/i, '');
  return { fileName, name: name || 'Untitled route', points, lengthM: routeLength(points) };
}

export async function readGpxFile(file: File): Promise<RouteData> {
  if (file.size > MAX_FILE_BYTES) throw new Error('This file is over 15 MB. Simplify the route or export fewer track points.');
  if (!file.name.toLowerCase().endsWith('.gpx')) throw new Error('Choose a file ending in .gpx.');
  return parseGpxText(await file.text(), file.name);
}
