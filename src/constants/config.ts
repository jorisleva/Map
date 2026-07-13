/**
 * Central config. Every endpoint / key is overridable via an EXPO_PUBLIC_* env
 * var so the key-less OSM defaults can be swapped for keyed providers without
 * touching code.
 *
 * NOTE: Expo/Metro only inlines `process.env.EXPO_PUBLIC_*` when accessed
 * STATICALLY (a literal member expression). Dynamic access (process.env[key])
 * is NOT replaced at build time — hence the explicit reads below.
 */
import type { LngLat } from '@/lib/geo';

const or = (value: string | undefined, fallback = ''): string =>
  value == null || value === '' ? fallback : value;

/** OSM's tile/Nominatim policies require a descriptive User-Agent naming the app. */
export const USER_AGENT = or(
  process.env.EXPO_PUBLIC_APP_USER_AGENT,
  'NavigationLiquidGlass/1.0 (https://github.com/jorisleva/map)',
);

export const TILES = {
  /** Raw OSM raster (demo/fair-use). Swapped for MapTiler when a key is present. */
  osmRasterUrl: or(process.env.EXPO_PUBLIC_TILE_URL, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
  maptilerKey: or(process.env.EXPO_PUBLIC_MAPTILER_KEY),
  attribution: '© OpenStreetMap',
};

export const ENDPOINTS = {
  osrm: or(process.env.EXPO_PUBLIC_OSRM_URL, 'https://router.project-osrm.org'),
  nominatim: or(process.env.EXPO_PUBLIC_NOMINATIM_URL, 'https://nominatim.openstreetmap.org'),
  photon: or(process.env.EXPO_PUBLIC_PHOTON_URL, 'https://photon.komoot.io'),
  overpass: or(process.env.EXPO_PUBLIC_OVERPASS_URL, 'https://overpass-api.de/api/interpreter'),
  mistralDirect: 'https://api.mistral.ai/v1/chat/completions',
};

export const AI = {
  model: or(process.env.EXPO_PUBLIC_MISTRAL_MODEL, 'mistral-small-latest'),
  publicKey: or(process.env.EXPO_PUBLIC_MISTRAL_API_KEY),
  /** Absolute origin for the proxy on native (web uses a relative URL). */
  apiBase: or(process.env.EXPO_PUBLIC_API_BASE_URL),
  mode: or(process.env.EXPO_PUBLIC_MISTRAL_MODE), // '' | 'proxy' | 'direct'
};

/** Paris — the city the original design mocks up. */
export const MAP_DEFAULTS = {
  center: [2.3522, 48.8566] as LngLat,
  zoom: 13,
};

/** Categories fetched for the "À proximité" list and offered to the AI tool. */
export const NEARBY = {
  radius: 700,
  amenities: [
    'cafe',
    'restaurant',
    'bar',
    'fast_food',
    'pharmacy',
    'fuel',
    'parking',
    'bank',
    'atm',
    'bicycle_rental',
    'hospital',
  ],
  shops: ['supermarket', 'convenience', 'bakery'],
};
