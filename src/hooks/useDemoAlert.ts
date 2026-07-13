/**
 * Surfaces the designed "Zone de vigilance" safety card contextually — once per
 * session, a few seconds after the nearby data settles while browsing. In a real
 * deployment this would be driven by a geofence / community safety feed.
 */
import { useEffect } from 'react';

import { useStore } from '@/state/store';

export function useDemoAlert() {
  const nearbyStatus = useStore((s) => s.nearbyStatus);
  const alertShown = useStore((s) => s.alertShown);
  const screen = useStore((s) => s.screen);
  const triggerAlert = useStore((s) => s.triggerAlert);

  useEffect(() => {
    if (nearbyStatus !== 'ready' || alertShown || screen !== 'browse') return;
    const t = setTimeout(() => {
      triggerAlert({
        title: 'Zone de vigilance',
        body: 'Secteur signalé · vols à la tire fréquents dans ce quartier. Restez attentif·ve.',
      });
    }, 5000);
    return () => clearTimeout(t);
  }, [nearbyStatus, alertShown, screen, triggerAlert]);
}
