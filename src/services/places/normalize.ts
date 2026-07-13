/**
 * Collapses every data source into the single `Place`/`Suggestion` shape the UI
 * consumes, so lists (PoiRow, ResultCard, PlaceDetail) never care where a result
 * came from. Also maps raw OSM tags → French category labels.
 */
import { haversine, type LatLng } from '@/lib/geo';
import type { Place, Suggestion } from '@/state/types';

const CATEGORY_FR: Record<string, string> = {
  cafe: 'Café',
  restaurant: 'Restaurant',
  bar: 'Bar',
  pub: 'Pub',
  fast_food: 'Restauration rapide',
  pharmacy: 'Pharmacie',
  fuel: 'Station-service',
  parking: 'Parking',
  bank: 'Banque',
  atm: 'Distributeur',
  bicycle_rental: 'Vélos en libre-service',
  hospital: 'Hôpital',
  toilets: 'Toilettes',
  supermarket: 'Supermarché',
  convenience: 'Supérette',
  bakery: 'Boulangerie',
  hotel: 'Hôtel',
  station: 'Gare',
  bus_stop: 'Arrêt de bus',
};

export function labelFor(key?: string, value?: string): string {
  if (value && CATEGORY_FR[value]) return CATEGORY_FR[value];
  if (value) return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Lieu';
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export function normalizeOverpass(el: OverpassElement, user?: LatLng | null): Place | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;
  const tags = el.tags ?? {};
  const value = tags.amenity ?? tags.shop ?? tags.tourism ?? tags.railway;
  const category = labelFor(tags.amenity ? 'amenity' : tags.shop ? 'shop' : 'lieu', value);
  const name = tags.name ?? tags.brand ?? tags.operator ?? category;

  const metaParts = [category];
  if (tags.cuisine) metaParts.push(tags.cuisine.split(';')[0].replace(/_/g, ' '));
  if (tags.fee === 'yes') metaParts.push('Payant');
  if (tags.opening_hours === '24/7') metaParts.push('Ouvert 24h');

  return {
    id: `${el.type}/${el.id}`,
    name,
    category,
    lat,
    lng,
    meta: metaParts.join(' · '),
    distanceM: user ? haversine(user, { lat, lng }) : undefined,
    address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || undefined,
    hours: tags.opening_hours,
    phone: tags.phone ?? tags['contact:phone'],
    source: 'overpass',
  };
}

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

export function normalizeNominatim(item: NominatimItem, user?: LatLng | null): Place {
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  const category = labelFor(item.class, item.type);
  const addr = item.address ?? {};
  const shortName =
    item.name ||
    addr.amenity ||
    addr.shop ||
    addr.building ||
    addr.road ||
    item.display_name.split(',')[0];
  return {
    id: `nominatim/${item.place_id}`,
    name: shortName,
    category,
    lat,
    lng,
    meta: category,
    distanceM: user ? haversine(user, { lat, lng }) : undefined,
    address: item.display_name,
    source: 'nominatim',
  };
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string>;
}

export function photonToSuggestion(f: PhotonFeature): Suggestion {
  const [lng, lat] = f.geometry.coordinates;
  const p = f.properties;
  const label = p.name ?? [p.housenumber, p.street].filter(Boolean).join(' ') ?? 'Lieu';
  const sub = [p.street && p.street !== label ? p.street : null, p.postcode, p.city, p.country]
    .filter(Boolean)
    .join(', ');
  return { id: `${p.osm_type ?? 'x'}${p.osm_id ?? `${lat},${lng}`}`, label, sub, lat, lng };
}
