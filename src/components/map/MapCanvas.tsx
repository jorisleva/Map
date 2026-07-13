/**
 * Native map canvas — MapLibre React Native rendering raw OpenStreetMap raster
 * tiles (or a MapTiler style when a key is set), the route line, user puck, and
 * POI markers. The ONLY file that imports MapLibre. Camera moves are driven by
 * the store's `cameraIntent` nonce, keeping the store pure.
 */
import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  RasterSource,
} from '@maplibre/maplibre-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { TILES } from '@/constants/config';
import { toLngLat } from '@/lib/geo';

import type { MapCanvasProps } from './types';

const bgStyle = (dark: boolean) => ({
  version: 8 as const,
  sources: {},
  layers: [
    { id: 'bg', type: 'background' as const, paint: { 'background-color': dark ? '#0f1217' : '#e8e5df' } },
  ],
});

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
  bottomInset = 0,
  onPressMarker,
  onPressMap,
}: MapCanvasProps) {
  const cameraRef = useRef<CameraRef>(null);

  useEffect(() => {
    const ci = cameraIntent;
    const cam = cameraRef.current;
    if (!ci || !cam) return;
    if (ci.kind === 'center') {
      cam.flyTo({ center: ci.center, zoom: ci.zoom ?? zoom, duration: 700 });
    } else {
      cam.fitBounds(ci.bounds, {
        duration: 700,
        padding: { top: 130, bottom: bottomInset + 170, left: 44, right: 44 },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraIntent?.nonce]);

  const maptiler = TILES.maptilerKey;
  const styleUrl = maptiler
    ? `https://api.maptiler.com/maps/${dark ? 'streets-v2-dark' : 'streets-v2'}/style.json?key=${maptiler}`
    : undefined;

  const routeData = routeGeometry
    ? {
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: routeGeometry },
        properties: {},
      }
    : null;

  return (
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={styleUrl ?? bgStyle(dark)}
      attribution
      onPress={() => onPressMap?.()}
    >
      <Camera ref={cameraRef} initialViewState={{ center, zoom }} />

      {!styleUrl && (
        <RasterSource
          id="osm"
          tileSize={256}
          maxzoom={19}
          tiles={[TILES.osmRasterUrl]}
          attribution={TILES.attribution}
        >
          <Layer id="osm-tiles" type="raster" />
        </RasterSource>
      )}

      {routeData && (
        <GeoJSONSource id="route" data={routeData}>
          <Layer
            id="route-casing"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': routeCasing, 'line-width': 11 }}
          />
          <Layer
            id="route-line"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': routeColor, 'line-width': 6 }}
          />
        </GeoJSONSource>
      )}

      {userLocation && (
        <Marker id="user" lngLat={toLngLat(userLocation)}>
          <View style={styles.userHalo}>
            <View style={styles.userDot} />
          </View>
        </Marker>
      )}

      {markers.map((m) => (
        <Marker key={m.id} id={m.id} lngLat={[m.lng, m.lat]} onPress={() => onPressMarker?.(m.id)}>
          <View style={[styles.pin, m.id === selectedId && styles.pinSelected]} />
        </Marker>
      ))}
    </Map>
  );
}

const styles = StyleSheet.create({
  userHalo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(110,168,255,0.25)',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3b82f6',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e2483d',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  pinSelected: {
    backgroundColor: '#6ea8ff',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
