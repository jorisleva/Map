/**
 * The single app screen. The map mounts once and stays mounted; the glass
 * overlays render-switch on `screen`. Camera moves flow through the store's
 * cameraIntent. Safe-area insets replace the design's mocked status bar (the OS
 * provides the real one).
 */
import { useMemo } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AIPanel } from '@/components/ai/AIPanel';
import { AlertCard } from '@/components/alert/AlertCard';
import { MapCanvas } from '@/components/map/MapCanvas';
import type { MapMarker } from '@/components/map/types';
import { ManeuverBanner } from '@/components/nav/ManeuverBanner';
import { NavBottomPanel } from '@/components/nav/NavBottomPanel';
import { AIOrb } from '@/components/overlays/AIOrb';
import { ControlChips } from '@/components/overlays/ControlChips';
import { SearchPill } from '@/components/overlays/SearchPill';
import { BottomSheet } from '@/components/sheet/BottomSheet';
import { NearbyList } from '@/components/sheet/NearbyList';
import { PlaceDetail } from '@/components/sheet/PlaceDetail';
import { MAP_DEFAULTS } from '@/constants/config';
import { useDemoAlert } from '@/hooks/useDemoAlert';
import { useLocation } from '@/hooks/useLocation';
import { useNavProgress } from '@/hooks/useNavProgress';
import { toLngLat } from '@/lib/geo';
import { useStore } from '@/state/store';
import type { Place } from '@/state/types';
import { useTheme } from '@/theme/useTheme';

export default function MapScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  useLocation();
  useNavProgress();
  useDemoAlert();

  const screen = useStore((s) => s.screen);
  const userLocation = useStore((s) => s.userLocation);
  const cameraIntent = useStore((s) => s.cameraIntent);
  const route = useStore((s) => s.route);
  const nearby = useStore((s) => s.nearby);
  const aiCards = useStore((s) => s.aiCards);
  const selectedPlace = useStore((s) => s.selectedPlace);
  const alert = useStore((s) => s.alert);
  const sheetSnap = useStore((s) => s.sheetSnap);
  const selectPlace = useStore((s) => s.selectPlace);

  const isBrowse = screen === 'browse';
  const isPlace = screen === 'place';
  const isNav = screen === 'nav';
  const isAi = screen === 'ai';

  const markers = useMemo<MapMarker[]>(() => {
    if (isNav) {
      return route
        ? [{ id: route.destination.id, lng: route.destination.lng, lat: route.destination.lat }]
        : [];
    }
    const list: Place[] = [];
    if (isAi) list.push(...aiCards);
    else list.push(...nearby);
    if (selectedPlace) list.push(selectedPlace);
    const seen = new Set<string>();
    return list
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .map((p) => ({ id: p.id, lng: p.lng, lat: p.lat }));
  }, [isNav, isAi, route, nearby, aiCards, selectedPlace]);

  const onPressMarker = (id: string) => {
    const p = [...nearby, ...aiCards, selectedPlace].find((x) => x?.id === id);
    if (p) selectPlace(p);
  };

  const center = userLocation ? toLngLat(userLocation) : MAP_DEFAULTS.center;

  return (
    <View style={styles.root}>
      <MapCanvas
        center={center}
        zoom={MAP_DEFAULTS.zoom}
        dark={t.isDark}
        cameraIntent={cameraIntent}
        userLocation={userLocation}
        routeGeometry={route?.geometry ?? null}
        routeColor={t.accent}
        routeCasing={t.color.routeCasing}
        markers={markers}
        selectedId={selectedPlace?.id ?? null}
        onPressMarker={onPressMarker}
        onPressMap={() => Keyboard.dismiss()}
      />

      {/* top: search pill (browse/place) or maneuver banner (nav) */}
      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        {isNav ? <ManeuverBanner /> : <SearchPill />}
      </View>

      {/* right control chips */}
      {(isBrowse || isPlace) && (
        <View style={[styles.right, { top: insets.top + 88 }]} pointerEvents="box-none">
          <ControlChips />
        </View>
      )}

      {/* alert overlay (above the map, below the chrome) */}
      {alert && (isBrowse || isPlace) && (
        <View style={[styles.alert, { top: insets.top + 150 }]} pointerEvents="box-none">
          <AlertCard />
        </View>
      )}

      {/* bottom regions by screen */}
      {(isBrowse || isPlace) && (
        <BottomSheet>{isPlace ? <PlaceDetail /> : <NearbyList />}</BottomSheet>
      )}
      {isAi && <AIPanel />}
      {isNav && (
        <View style={[styles.navBottom, { bottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <NavBottomPanel />
        </View>
      )}

      {/* floating AI orb, above the sheet peek (hidden when the sheet is expanded) */}
      {isBrowse && sheetSnap === 'peek' && (
        <View style={[styles.orb, { bottom: insets.bottom + 250 }]} pointerEvents="box-none">
          <AIOrb />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  top: { position: 'absolute', left: 16, right: 16 },
  right: { position: 'absolute', right: 14 },
  alert: { position: 'absolute', left: 22, right: 22 },
  navBottom: { position: 'absolute', left: 14, right: 14 },
  orb: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
});
