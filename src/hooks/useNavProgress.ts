/**
 * Advances the turn-by-turn step when the user's real position comes within
 * ~25m of the upcoming maneuver. (Manual advance is also available by tapping the
 * maneuver banner, useful for demos where the device isn't moving.)
 */
import { useEffect } from 'react';

import { fromLngLat, haversine } from '@/lib/geo';
import { useStore } from '@/state/store';

export function useNavProgress() {
  const screen = useStore((s) => s.screen);
  const route = useStore((s) => s.route);
  const stepIndex = useStore((s) => s.stepIndex);
  const user = useStore((s) => s.userLocation);
  const advanceStep = useStore((s) => s.advanceStep);

  useEffect(() => {
    if (screen !== 'nav' || !route || !user) return;
    const step = route.steps[stepIndex];
    if (!step) return;
    if (haversine(user, fromLngLat(step.maneuver.location)) < 25) {
      advanceStep();
    }
  }, [screen, route, stepIndex, user, advanceStep]);
}
