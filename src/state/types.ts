import type { LatLng, LngLat } from '@/lib/geo';

export type Screen = 'browse' | 'place' | 'ai' | 'nav' | 'alert';
export type Status = 'idle' | 'loading' | 'ready' | 'error';
export type AiStatus = 'idle' | 'thinking' | 'listening' | 'error';

/** The one normalized shape every data source (Nominatim/Overpass/Photon/AI) maps to. */
export interface Place {
  id: string;
  name: string;
  category?: string;
  lat: number;
  lng: number;
  /** one-line descriptor, e.g. "4,6 · Café · Ouvert" or "2,50 €/h · Ouvert 24h" */
  meta?: string;
  distanceM?: number;
  address?: string;
  rating?: number;
  hours?: string;
  phone?: string;
  source: 'nominatim' | 'overpass' | 'photon' | 'ai';
}

export interface Suggestion {
  id: string;
  label: string;
  sub?: string;
  lat: number;
  lng: number;
}

export interface Maneuver {
  type: string;
  modifier?: string;
  location: LngLat;
}

export interface RouteStep {
  instruction: string; // French, precomputed via osrm-text-instructions
  name: string; // street name
  distance: number; // meters for this step
  duration: number; // seconds for this step
  maneuver: Maneuver;
}

export interface Route {
  geometry: LngLat[];
  distance: number; // total meters
  duration: number; // total seconds
  steps: RouteStep[];
  destination: Place;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AlertInfo {
  title: string;
  body?: string;
}

/** Imperative camera request. Store stays pure; MapCanvas owns the ref. */
export type CameraIntent =
  | { kind: 'center'; center: LngLat; zoom?: number; nonce: number }
  | { kind: 'bounds'; bounds: [number, number, number, number]; nonce: number };

export type { LatLng, LngLat };
