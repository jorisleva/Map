/**
 * Routing via the public OSRM demo server (no key, car profile). Returns the
 * drawable geometry, total distance/duration, and flattened turn-by-turn steps
 * with French instructions precomputed.
 */
import { ENDPOINTS } from '@/constants/config';
import type { LatLng, LngLat } from '@/lib/geo';
import { httpJson } from '@/lib/http';
import type { Place, Route, RouteStep } from '@/state/types';

import { frenchInstruction } from './instructions';

interface OsrmStep {
  name: string;
  distance: number;
  duration: number;
  geometry: { coordinates: LngLat[] };
  maneuver: { type: string; modifier?: string; location: LngLat };
}
interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: { coordinates: LngLat[] };
  legs: { steps: OsrmStep[] }[];
}
interface OsrmResponse {
  code: string;
  message?: string;
  routes: OsrmRoute[];
}

export async function getRoute(
  from: LatLng,
  to: Place,
  profile: 'driving' | 'walking' | 'cycling' = 'driving',
): Promise<Route> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url =
    `${ENDPOINTS.osrm}/route/v1/${profile}/${coords}` +
    `?steps=true&geometries=geojson&overview=full`;
  const data = await httpJson<OsrmResponse>(url, { timeoutMs: 20000 });
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(data.message ?? 'Itinéraire introuvable');
  }
  const r = data.routes[0];
  const steps: RouteStep[] = r.legs
    .flatMap((leg) => leg.steps)
    .map((s) => {
      const maneuver = { type: s.maneuver.type, modifier: s.maneuver.modifier, location: s.maneuver.location };
      return {
        instruction: frenchInstruction(maneuver, s.name),
        name: s.name,
        distance: s.distance,
        duration: s.duration,
        maneuver,
      };
    });
  return {
    geometry: r.geometry.coordinates,
    distance: r.distance,
    duration: r.duration,
    steps,
    destination: to,
  };
}
