/**
 * Web map canvas — the WebView/Leaflet fallback the plan calls for, implemented
 * as Leaflet-in-DOM (this file is only bundled for web, so `document`/`window`
 * are available). Same MapCanvasProps contract as the native MapLibre canvas.
 * If Leaflet can't load (e.g. offline), a styled placeholder keeps the UI intact.
 */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { TILES } from '@/constants/config';

import type { MapCanvasProps } from './types';

const CONTAINER_ID = 'liquid-glass-map';
let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (typeof document === 'undefined') return Promise.reject(new Error('no dom'));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.async = true;
    js.onload = () => resolve((window as any).L);
    js.onerror = () => reject(new Error('leaflet failed'));
    document.head.appendChild(js);
  });
  return leafletPromise;
}

export function MapCanvas({
  center,
  zoom,
  dark,
  cameraIntent,
  userLocation,
  routeGeometry,
  routeColor,
  routeCasing,
  markers,
  selectedId,
  onPressMarker,
  onPressMap,
}: MapCanvasProps) {
  const map = useRef<any>(null);
  const routeLayers = useRef<any[]>([]);
  const markerLayer = useRef<any>(null);
  const userMarker = useRef<any>(null);
  const [failed, setFailed] = useState(false);

  // init
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || map.current) return;
        const el = document.getElementById(CONTAINER_ID);
        if (!el) return;
        const m = L.map(el, { zoomControl: false, attributionControl: true }).setView(
          [center[1], center[0]],
          zoom,
        );
        L.tileLayer(TILES.osmRasterUrl, {
          maxZoom: 19,
          attribution: TILES.attribution,
        }).addTo(m);
        m.on('click', () => onPressMap?.());
        markerLayer.current = L.layerGroup().addTo(m);
        map.current = m;
        setFailed(false);
        // force layout after the container settles
        setTimeout(() => m.invalidateSize(), 60);
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // camera
  useEffect(() => {
    const m = map.current;
    const ci = cameraIntent;
    if (!m || !ci) return;
    const L = (window as any).L;
    if (ci.kind === 'center') m.flyTo([ci.center[1], ci.center[0]], ci.zoom ?? m.getZoom(), { duration: 0.6 });
    else m.flyToBounds(L.latLngBounds([ci.bounds[1], ci.bounds[0]], [ci.bounds[3], ci.bounds[2]]), { duration: 0.6, padding: [40, 60] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraIntent?.nonce]);

  // route
  useEffect(() => {
    const m = map.current;
    const L = (window as any).L;
    if (!m || !L) return;
    routeLayers.current.forEach((l) => m.removeLayer(l));
    routeLayers.current = [];
    if (routeGeometry && routeGeometry.length) {
      const latlngs = routeGeometry.map(([lng, lat]) => [lat, lng]);
      const casing = L.polyline(latlngs, { color: routeCasing, weight: 11, opacity: 0.9, lineCap: 'round' }).addTo(m);
      const line = L.polyline(latlngs, { color: routeColor, weight: 6, lineCap: 'round' }).addTo(m);
      routeLayers.current = [casing, line];
    }
  }, [routeGeometry, routeColor, routeCasing]);

  // markers
  useEffect(() => {
    const m = map.current;
    const L = (window as any).L;
    if (!m || !L || !markerLayer.current) return;
    markerLayer.current.clearLayers();
    for (const mk of markers) {
      const selected = mk.id === selectedId;
      L.circleMarker([mk.lat, mk.lng], {
        radius: selected ? 9 : 6,
        color: '#fff',
        weight: 2,
        fillColor: selected ? '#6ea8ff' : '#e2483d',
        fillOpacity: 1,
      })
        .on('click', () => onPressMarker?.(mk.id))
        .addTo(markerLayer.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, selectedId]);

  // user location
  useEffect(() => {
    const m = map.current;
    const L = (window as any).L;
    if (!m || !L) return;
    if (userMarker.current) {
      m.removeLayer(userMarker.current);
      userMarker.current = null;
    }
    if (userLocation) {
      userMarker.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 7,
        color: '#fff',
        weight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 1,
      }).addTo(m);
    }
  }, [userLocation]);

  return (
    <View
      // react-native-web maps nativeID → DOM id (used by Leaflet)
      nativeID={CONTAINER_ID}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: dark ? '#0f1217' : '#e8e5df' },
        failed && (dark ? styles.fallbackDark : styles.fallbackLight),
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fallbackLight: { backgroundColor: '#e3dfd6' },
  fallbackDark: { backgroundColor: '#12151b' },
});
