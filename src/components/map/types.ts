/**
 * The MapEngine seam. Both the native (MapLibre) and web (Leaflet) canvases
 * implement this identical prop contract, so the overlay UI never depends on
 * which engine is mounted.
 */
import type { LatLng, LngLat } from '@/lib/geo';
import type { CameraIntent } from '@/state/types';

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
}

export interface MapCanvasProps {
  center: LngLat;
  zoom: number;
  dark: boolean;
  cameraIntent: CameraIntent | null;
  userLocation: LatLng | null;
  routeGeometry: LngLat[] | null;
  routeColor: string;
  routeCasing: string;
  markers: MapMarker[];
  selectedId?: string | null;
  bottomInset?: number;
  onPressMarker?: (id: string) => void;
  onPressMap?: () => void;
}
