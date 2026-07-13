/**
 * Pure derivations for the turn-by-turn UI: current/next maneuver, the live
 * "big distance" to the next turn, and the remaining ETA/distance summary.
 */
import { etaClock, formatDistance, formatDuration, fromLngLat, haversine, type LatLng } from '@/lib/geo';
import type { Route, RouteStep } from '@/state/types';

export function currentStep(route: Route | null, i: number): RouteStep | null {
  if (!route || !route.steps.length) return null;
  return route.steps[Math.min(i, route.steps.length - 1)];
}

export function nextStep(route: Route | null, i: number): RouteStep | null {
  if (!route) return null;
  return i + 1 < route.steps.length ? route.steps[i + 1] : null;
}

/** Live distance to the upcoming maneuver (falls back to the step's own length). */
export function bannerDistance(route: Route | null, i: number, user: LatLng | null): string {
  const step = currentStep(route, i);
  if (!step) return '—';
  if (user) return formatDistance(haversine(user, fromLngLat(step.maneuver.location)));
  return formatDistance(step.distance);
}

export function remaining(route: Route | null, i: number): { distance: number; duration: number } {
  if (!route) return { distance: 0, duration: 0 };
  let distance = 0;
  let duration = 0;
  for (let k = i; k < route.steps.length; k++) {
    distance += route.steps[k].distance;
    duration += route.steps[k].duration;
  }
  return { distance, duration };
}

export function navSummary(route: Route | null, i: number): { eta: string; line: string } {
  const { distance, duration } = remaining(route, i);
  return {
    eta: etaClock(duration),
    line: `${formatDuration(duration)} · ${formatDistance(distance)}`,
  };
}
