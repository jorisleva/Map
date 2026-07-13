/**
 * Geo helpers. THE single place that knows about coordinate order.
 * MapLibre / GeoJSON / OSRM all use [lng, lat]; expo-location gives
 * {latitude, longitude}. Never swap coordinates inline anywhere else.
 */

/** [longitude, latitude] — map / OSRM / GeoJSON order. */
export type LngLat = [number, number];

export interface LatLng {
  lat: number;
  lng: number;
}

export const toLngLat = (p: LatLng): LngLat => [p.lng, p.lat];
export const fromLngLat = ([lng, lat]: LngLat): LatLng => ({ lat, lng });
export const fromCoords = (c: { latitude: number; longitude: number }): LatLng => ({
  lat: c.latitude,
  lng: c.longitude,
});

const R = 6371000; // Earth radius, meters
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in meters. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Initial bearing a→b, degrees clockwise from north (0–360). */
export function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Bounding box [minLng,minLat,maxLng,maxLat] around a set of points. */
export function boundsOf(points: LngLat[]): [number, number, number, number] | null {
  if (!points.length) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [minLng, minLat, maxLng, maxLat];
}

// ── French-formatted units (decimal comma, 24h clock) ────────────────────────

/** "80 m", "300 m", "1,2 km". */
export function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '—';
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  const km = meters / 1000;
  return `${km.toFixed(km < 10 ? 1 : 0).replace('.', ',')} km`;
}

/** "3 min", "12 min", "1 h 05". */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return '—';
  const min = Math.round(seconds / 60);
  if (min < 60) return `${Math.max(1, min)} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} h${m ? ` ${String(m).padStart(2, '0')}` : ''}`;
}

/** Wall-clock arrival time `now + seconds` → "14:32". */
export function etaClock(seconds: number, nowMs: number = Date.now()): string {
  const d = new Date(nowMs + seconds * 1000);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}
