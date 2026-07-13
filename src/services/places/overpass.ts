/**
 * Nearby POIs via the Overpass API (no key). Used both by the "À proximité" list
 * and by the AI `search_places` tool. Cached per rounded cell + radius so we stay
 * within fair-use limits.
 */
import { ENDPOINTS, NEARBY } from '@/constants/config';
import { cached } from '@/lib/cache';
import type { LatLng } from '@/lib/geo';
import { httpJson } from '@/lib/http';
import type { Place } from '@/state/types';

import { normalizeOverpass } from './normalize';

interface OverpassResponse {
  elements: {
    type: 'node' | 'way' | 'relation';
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  }[];
}

function buildQuery(center: LatLng, radius: number, selectors: string[]): string {
  const around = `(around:${radius},${center.lat.toFixed(6)},${center.lng.toFixed(6)})`;
  const body = selectors
    .map((sel) => {
      const [key, value] = sel.split('=');
      return `node["${key}"="${value}"]${around};`;
    })
    .join('');
  return `[out:json][timeout:20];(${body});out center 40;`;
}

async function run(center: LatLng, radius: number, selectors: string[]): Promise<Place[]> {
  const q = buildQuery(center, radius, selectors);
  const data = await httpJson<OverpassResponse>(ENDPOINTS.overpass, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(q)}`,
    timeoutMs: 25000,
  });
  const places = data.elements
    .map((el) => normalizeOverpass(el, center))
    .filter((p): p is Place => p !== null);
  // De-dupe and sort by distance.
  const seen = new Set<string>();
  return places
    .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
    .sort((a, b) => (a.distanceM ?? 1e9) - (b.distanceM ?? 1e9));
}

const defaultSelectors = [
  ...NEARBY.amenities.map((a) => `amenity=${a}`),
  ...NEARBY.shops.map((s) => `shop=${s}`),
];

/** The default "À proximité" mix. */
export function nearby(center: LatLng, radius: number = NEARBY.radius): Promise<Place[]> {
  const key = `overpass:nearby:${center.lat.toFixed(3)},${center.lng.toFixed(3)}:${radius}`;
  return cached(key, 5 * 60 * 1000, () => run(center, radius, defaultSelectors));
}

/** A targeted query (used by the AI tool), e.g. selectors ['amenity=parking']. */
export function query(center: LatLng, radius: number, selectors: string[]): Promise<Place[]> {
  const key = `overpass:q:${center.lat.toFixed(3)},${center.lng.toFixed(3)}:${radius}:${selectors.join(',')}`;
  return cached(key, 5 * 60 * 1000, () => run(center, radius, selectors));
}
