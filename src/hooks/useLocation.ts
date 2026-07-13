/**
 * Foreground location: one-shot fix + continuous watch, pushed into the store.
 * Falls back to Paris (the design's city) when permission is denied or GPS is
 * unavailable, so the demo always has a populated map and nearby list.
 */
import * as Location from 'expo-location';
import { useEffect } from 'react';

import { MAP_DEFAULTS } from '@/constants/config';
import { fromCoords, fromLngLat } from '@/lib/geo';
import { useStore } from '@/state/store';

export function useLocation() {
  const setUserLocation = useStore((s) => s.setUserLocation);

  useEffect(() => {
    let mounted = true;
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) setUserLocation(fromLngLat(MAP_DEFAULTS.center));
          return;
        }
        const last = await Location.getLastKnownPositionAsync();
        if (last && mounted) setUserLocation(fromCoords(last.coords));

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (mounted) setUserLocation(fromCoords(current.coords));

        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
          (loc) => {
            if (mounted) setUserLocation(fromCoords(loc.coords));
          },
        );
      } catch {
        if (mounted) setUserLocation(fromLngLat(MAP_DEFAULTS.center));
      }
    })();

    return () => {
      mounted = false;
      sub?.remove();
    };
  }, [setUserLocation]);
}
