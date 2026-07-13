/**
 * Nominatim geocoding (no key). Policy: max 1 req/s + descriptive User-Agent +
 * no autocomplete. So this is used only on *submit* (Photon handles type-ahead),
 * behind a 1.1s limiter and a short cache.
 */
import { ENDPOINTS } from '@/constants/config';
import { cached } from '@/lib/cache';
import type { LatLng } from '@/lib/geo';
import { httpJson } from '@/lib/http';
import { minInterval } from '@/lib/limiter';
import type { Place } from '@/state/types';

import { normalizeNominatim } from '@/services/places/normalize';

const gate = minInterval(1100);

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type: string;
  class: string;
  address?: Record<string, string>;
}

export function search(q: string, near?: LatLng | null): Promise<Place[]> {
  const query = q.trim();
  if (!query) return Promise.resolve([]);
  return cached(`nominatim:s:${query}`, 5 * 60 * 1000, () =>
    gate(async () => {
      const url =
        `${ENDPOINTS.nominatim}/search?q=${encodeURIComponent(query)}` +
        `&format=jsonv2&addressdetails=1&limit=6&accept-language=fr`;
      const items = await httpJson<NominatimItem[]>(url, { timeoutMs: 15000 });
      return items.map((it) => normalizeNominatim(it, near));
    }),
  );
}

export function reverse(lat: number, lng: number): Promise<Place | null> {
  return cached(`nominatim:r:${lat.toFixed(4)},${lng.toFixed(4)}`, 10 * 60 * 1000, () =>
    gate(async () => {
      const url =
        `${ENDPOINTS.nominatim}/reverse?lat=${lat}&lon=${lng}` +
        `&format=jsonv2&addressdetails=1&accept-language=fr`;
      const item = await httpJson<NominatimItem | null>(url, { timeoutMs: 15000 });
      return item && item.place_id ? normalizeNominatim(item) : null;
    }),
  );
}
