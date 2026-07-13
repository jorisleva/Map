/**
 * Photon (Komoot) — OSM search built for type-ahead, unlike Nominatim which
 * forbids autocomplete. Used by the search pill as the user types (debounced +
 * cached + location-biased).
 */
import { ENDPOINTS } from '@/constants/config';
import { cached } from '@/lib/cache';
import type { LatLng } from '@/lib/geo';
import { httpJson } from '@/lib/http';
import type { Suggestion } from '@/state/types';

import { photonToSuggestion } from '@/services/places/normalize';

interface PhotonResponse {
  features: { geometry: { coordinates: [number, number] }; properties: Record<string, string> }[];
}

export function suggest(q: string, near?: LatLng | null, limit = 6): Promise<Suggestion[]> {
  const query = q.trim();
  if (query.length < 2) return Promise.resolve([]);
  const bias = near ? `${near.lat.toFixed(2)},${near.lng.toFixed(2)}` : '';
  return cached(`photon:${query}:${bias}`, 3 * 60 * 1000, async () => {
    const loc = near ? `&lat=${near.lat}&lon=${near.lng}` : '';
    const url = `${ENDPOINTS.photon}/api?q=${encodeURIComponent(query)}&limit=${limit}&lang=fr${loc}`;
    const data = await httpJson<PhotonResponse>(url, { timeoutMs: 12000 });
    return (data.features ?? []).map(photonToSuggestion);
  });
}
