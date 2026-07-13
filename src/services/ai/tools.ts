/**
 * The single tool the assistant can call. Maps a natural-language query to OSM
 * selectors and runs the same Overpass/Nominatim clients the rest of the app
 * uses — so tool results normalize into `Place` exactly like the browse list.
 */
import { MAP_DEFAULTS } from '@/constants/config';
import { fromLngLat, type LatLng } from '@/lib/geo';
import * as nominatim from '@/services/geocode/nominatim';
import * as overpass from '@/services/places/overpass';
import type { Place } from '@/state/types';

export interface AiContext {
  userLocation: LatLng | null;
}

export const searchPlacesTool = {
  type: 'function' as const,
  function: {
    name: 'search_places',
    description:
      "Recherche des lieux ou points d'intérêt OpenStreetMap autour de la position de l'utilisateur. À utiliser dès que l'utilisateur cherche un endroit (parking, café, pharmacie, restaurant, station-service…).",
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: "Type de lieu recherché, ex: 'parking', 'café', 'pharmacie de garde'.",
        },
        radius: {
          type: 'integer',
          description: 'Rayon de recherche en mètres (défaut 800, max 3000).',
        },
      },
      required: ['query'],
    },
  },
};

const KEYWORDS: { re: RegExp; selectors: string[] }[] = [
  { re: /parking|stationnement|(se )?garer/i, selectors: ['amenity=parking'] },
  { re: /caf[ée]|coffee/i, selectors: ['amenity=cafe'] },
  { re: /restaurant|manger|d[îi]ner|d[ée]jeuner/i, selectors: ['amenity=restaurant', 'amenity=fast_food'] },
  { re: /\bbar\b|pub|boire|un verre/i, selectors: ['amenity=bar', 'amenity=pub'] },
  { re: /pharmacie|pharmacy/i, selectors: ['amenity=pharmacy'] },
  { re: /essence|carburant|station.?service|fuel/i, selectors: ['amenity=fuel'] },
  { re: /distributeur|\batm\b|retrait/i, selectors: ['amenity=atm'] },
  { re: /banque|bank/i, selectors: ['amenity=bank'] },
  { re: /v[ée]lo|bike|bicycle/i, selectors: ['amenity=bicycle_rental'] },
  { re: /supermarch[ée]|courses|[ée]picerie|grocery/i, selectors: ['shop=supermarket', 'shop=convenience'] },
  { re: /boulangerie|bakery|\bpain\b/i, selectors: ['shop=bakery'] },
  { re: /h[ôo]tel|dormir/i, selectors: ['tourism=hotel'] },
  { re: /h[ôo]pital|urgences|hospital/i, selectors: ['amenity=hospital'] },
  { re: /toilettes|\bwc\b|restroom/i, selectors: ['amenity=toilets'] },
];

export async function runSearchPlaces(
  args: { query?: string; radius?: number },
  ctx: AiContext,
): Promise<Place[]> {
  const query = (args.query ?? '').trim();
  const radius = Math.min(Math.max(args.radius ?? 800, 100), 3000);
  const center = ctx.userLocation ?? fromLngLat(MAP_DEFAULTS.center);

  const match = KEYWORDS.find((k) => k.re.test(query));
  if (match) {
    const places = await overpass.query(center, radius, match.selectors);
    return places.slice(0, 6);
  }
  // No category keyword → free-text geocode near the user.
  const places = await nominatim.search(query, center);
  return places.slice(0, 6);
}
