/**
 * The app store: the `screen` state machine plus all live data. Selector-based
 * (Zustand) so the AI panel updating never re-renders the map. Actions are the
 * legal transitions and own the async service calls. Animation/gesture state
 * (sheet drag) lives in Reanimated, not here — only the committed snap does.
 */
import { create } from 'zustand';

import { boundsOf, toLngLat, type LatLng, type LngLat } from '@/lib/geo';
import * as nominatim from '@/services/geocode/nominatim';
import { runAssistant } from '@/services/ai/loop';
import { AiUnavailableError } from '@/services/ai/mistral';
import * as overpass from '@/services/places/overpass';
import { getRoute } from '@/services/routing/osrm';
import type {
  AiStatus,
  AlertInfo,
  CameraIntent,
  ChatMessage,
  Place,
  Route,
  Screen,
  Status,
  Suggestion,
} from '@/state/types';

interface AppState {
  screen: Screen;
  userLocation: LatLng | null;
  cameraIntent: CameraIntent | null;
  followUser: boolean;

  searchQuery: string;
  suggestions: Suggestion[];
  searchStatus: Status;

  nearby: Place[];
  nearbyStatus: Status;

  selectedPlace: Place | null;

  route: Route | null;
  stepIndex: number;
  navStatus: Status;

  conversation: ChatMessage[];
  aiStatus: AiStatus;
  aiCards: Place[];

  alert: AlertInfo | null;
  alertShown: boolean;

  sheetSnap: 'peek' | 'full';

  // actions
  setUserLocation: (p: LatLng) => void;
  flyTo: (center: LngLat, zoom?: number) => void;
  setFollowUser: (v: boolean) => void;

  setQuery: (q: string) => void;
  setSuggestions: (s: Suggestion[]) => void;
  pickSuggestion: (s: Suggestion) => void;
  submitSearch: (q: string) => Promise<void>;

  loadNearby: (force?: boolean) => Promise<void>;

  selectPlace: (p: Place) => void;
  goBrowse: () => void;

  startRoute: (dest?: Place) => Promise<void>;
  endRoute: () => void;
  advanceStep: () => void;

  openAI: () => void;
  sendUserMessage: (text: string) => Promise<void>;

  triggerAlert: (a: AlertInfo) => void;
  dismissAlert: () => void;

  setSheetSnap: (s: 'peek' | 'full') => void;
  toggleSheet: () => void;
}

/** Omit that distributes over a discriminated union (keeps each variant's keys). */
type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;

export const useStore = create<AppState>((set, get) => {
  const camera = (intent: DistributiveOmit<CameraIntent, 'nonce'>): CameraIntent =>
    ({ ...intent, nonce: (get().cameraIntent?.nonce ?? 0) + 1 } as CameraIntent);

  return {
    screen: 'browse',
    userLocation: null,
    cameraIntent: null,
    followUser: true,

    searchQuery: '',
    suggestions: [],
    searchStatus: 'idle',

    nearby: [],
    nearbyStatus: 'idle',

    selectedPlace: null,

    route: null,
    stepIndex: 0,
    navStatus: 'idle',

    conversation: [],
    aiStatus: 'idle',
    aiCards: [],

    alert: null,
    alertShown: false,

    sheetSnap: 'peek',

    setUserLocation: (p) => {
      const first = get().userLocation == null;
      set({ userLocation: p });
      if (first) {
        set({ cameraIntent: camera({ kind: 'center', center: toLngLat(p), zoom: 15 }) });
        void get().loadNearby();
      }
    },

    flyTo: (center, zoom) => set({ cameraIntent: camera({ kind: 'center', center, zoom }) }),
    setFollowUser: (v) => set({ followUser: v }),

    setQuery: (q) => set({ searchQuery: q }),
    setSuggestions: (s) => set({ suggestions: s }),

    pickSuggestion: (s) => {
      const place: Place = {
        id: s.id,
        name: s.label,
        category: s.sub?.split(',')[0],
        lat: s.lat,
        lng: s.lng,
        meta: s.sub,
        address: s.sub,
        source: 'photon',
      };
      set({ searchQuery: '', suggestions: [] });
      get().selectPlace(place);
    },

    submitSearch: async (q) => {
      const query = q.trim();
      if (!query) return;
      set({ searchStatus: 'loading', suggestions: [] });
      try {
        const results = await nominatim.search(query, get().userLocation);
        if (results.length) {
          set({ searchStatus: 'ready', searchQuery: '' });
          get().selectPlace(results[0]);
        } else {
          set({ searchStatus: 'error' });
        }
      } catch {
        set({ searchStatus: 'error' });
      }
    },

    loadNearby: async (force) => {
      const { userLocation, nearbyStatus } = get();
      if (!userLocation) return;
      if (nearbyStatus === 'loading' && !force) return;
      set({ nearbyStatus: 'loading' });
      try {
        const places = await overpass.nearby(userLocation);
        set({ nearby: places, nearbyStatus: 'ready' });
      } catch {
        set({ nearbyStatus: 'error' });
      }
    },

    selectPlace: (p) =>
      set({
        selectedPlace: p,
        screen: 'place',
        sheetSnap: 'full',
        followUser: false,
        cameraIntent: camera({ kind: 'center', center: toLngLat(p), zoom: 16 }),
      }),

    goBrowse: () => set({ screen: 'browse', sheetSnap: 'peek' }),

    startRoute: async (dest) => {
      const to = dest ?? get().selectedPlace;
      const from = get().userLocation;
      if (!to) return;
      if (!from) {
        set({ navStatus: 'error' });
        return;
      }
      set({ navStatus: 'loading' });
      try {
        const route = await getRoute(from, to);
        const bounds = boundsOf(route.geometry);
        set({
          route,
          stepIndex: 0,
          screen: 'nav',
          navStatus: 'ready',
          followUser: true,
          cameraIntent: bounds ? camera({ kind: 'bounds', bounds }) : get().cameraIntent,
        });
      } catch {
        set({ navStatus: 'error' });
      }
    },

    endRoute: () =>
      set({ route: null, stepIndex: 0, navStatus: 'idle', screen: 'browse', sheetSnap: 'peek' }),

    advanceStep: () => {
      const { route, stepIndex } = get();
      if (!route) return;
      if (stepIndex >= route.steps.length - 1) {
        get().endRoute();
        return;
      }
      const next = stepIndex + 1;
      set({
        stepIndex: next,
        cameraIntent: camera({ kind: 'center', center: route.steps[next].maneuver.location, zoom: 16 }),
      });
    },

    openAI: () => set({ screen: 'ai', aiStatus: 'idle' }),

    sendUserMessage: async (text) => {
      const content = text.trim();
      if (!content) return;
      const history = get().conversation;
      set((s) => ({
        conversation: [...s.conversation, { role: 'user', content }],
        aiStatus: 'thinking',
        aiCards: [],
      }));
      try {
        const { reply, cards } = await runAssistant(content, history, {
          userLocation: get().userLocation,
        });
        set((s) => ({
          conversation: [...s.conversation, { role: 'assistant', content: reply || '…' }],
          aiCards: cards,
          aiStatus: 'idle',
        }));
      } catch (e) {
        const msg =
          e instanceof AiUnavailableError
            ? `Assistant indisponible — ${e.message}`
            : "Désolé, je n'ai pas pu contacter l'assistant. Vérifiez la connexion et la clé Mistral.";
        set((s) => ({
          conversation: [...s.conversation, { role: 'assistant', content: msg }],
          aiStatus: 'error',
        }));
      }
    },

    triggerAlert: (a) => set({ alert: a, alertShown: true }),
    dismissAlert: () => set({ alert: null }),

    setSheetSnap: (s) => set({ sheetSnap: s }),
    toggleSheet: () => set((st) => ({ sheetSnap: st.sheetSnap === 'peek' ? 'full' : 'peek' })),
  };
});

// Dev-only: expose the store for E2E driving / screenshots.
if (typeof window !== 'undefined' && (globalThis as unknown as { __DEV__?: boolean }).__DEV__) {
  (window as unknown as { __lgStore?: typeof useStore }).__lgStore = useStore;
}
