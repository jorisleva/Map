/**
 * Tiny in-memory TTL cache for idempotent GETs (Photon suggestions, Overpass
 * cells, Nominatim queries) — keeps us within OSM fair-use limits and makes the
 * UI feel instant on repeat queries. Deliberately process-lifetime only.
 */
interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

/** Returns the cached value, or runs `fn`, caches it for `ttlMs`, and returns it. */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  const now = Date.now();
  if (hit && hit.expires > now) return hit.value;
  const value = await fn();
  store.set(key, { value, expires: now + ttlMs });
  // Opportunistic prune so the map can't grow unbounded.
  if (store.size > 200) {
    for (const [k, v] of store) if (v.expires <= now) store.delete(k);
  }
  return value;
}

export function clearCache() {
  store.clear();
}
