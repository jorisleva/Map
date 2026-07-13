# Navigation Liquid Glass

Application mobile de **cartographie et navigation** au style *Liquid Glass*, construite
avec **Expo** (React Native). Les cartes et la navigation reposent sur **OpenStreetMap**,
et l'assistant intégré est propulsé par **Mistral AI**.

L'interface reproduit fidèlement le projet Claude Design _« Navigation mobile Liquid
Glass »_ (panneaux de verre dépoli, thèmes clair/sombre, iOS/Android), mais chaque écran
est adossé à de vraies données : carte OSM, POI à proximité, géocodage, itinéraires
tour-par-tour et réponses IA réelles.

## Écrans

| Écran | Contenu |
|-------|---------|
| **Recherche** | Carte plein écran, barre « Où allez-vous ? » (auto-complétion Photon), pastilles de contrôle, fiche « À proximité » glissable, orbe IA |
| **Lieu** | Fiche détaillée : nom, note · catégorie · horaires, photos, actions (Itinéraire / Appeler / Enregistrer), adresse |
| **Assistant IA** | Conversation Mistral avec appel d'outil `search_places`, cartes de résultats, saisie vocale/texte |
| **Navigation** | Bannière de manœuvre (distance + rue + « Puis… »), tracé de l'itinéraire, panneau ETA · durée · distance |
| **Alerte** | Carte ambrée « Zone de vigilance » avec halo |

## Stack

- **Expo SDK 57** (React Native 0.86, React 19), **expo-router**, TypeScript
- **Carte** : [`@maplibre/maplibre-react-native`](https://maplibre.org/maplibre-react-native/) (tuiles OSM natives) sur iOS/Android ; repli **Leaflet** sur le web
- **Verre** : `expo-blur` (+ `expo-glass-effect` sur iOS 26), `expo-linear-gradient`
- **Gestes/animations** : `react-native-gesture-handler`, `react-native-reanimated`
- **État** : `zustand`
- **Services OSM** (sans clé par défaut) : OSRM (itinéraires), Nominatim + Photon (géocodage), Overpass (POI)
- **IA** : Mistral (`mistral-small-latest`) via appel d'outils OpenAI-compatible

## Démarrage

```bash
npm install
cp .env.example .env      # renseignez au minimum la clé Mistral (voir plus bas)

# Web (aperçu rapide dans le navigateur — carte via Leaflet)
npm run web

# iOS / Android — nécessite un build de développement (MapLibre est natif)
npx expo prebuild
npx expo run:ios      # ou: npx expo run:android
# ou via EAS : npx eas build --profile development
```

> **Important** : MapLibre est un module natif — l'app **ne fonctionne pas dans Expo Go**.
> Utilisez un *dev build* (`expo prebuild` + `run:ios/android`, ou EAS). Le web utilise
> automatiquement un repli Leaflet (via `MapCanvas.web.tsx`).

## Configuration (`.env`)

Seules les variables `EXPO_PUBLIC_*` sont incluses dans le bundle client.
`MISTRAL_API_KEY` (sans préfixe) reste **côté serveur**.

| Variable | Rôle |
|----------|------|
| `MISTRAL_API_KEY` | Clé Mistral pour le **proxy** `app/api/mistral+api.ts` (recommandé, ne fuit pas dans le bundle) |
| `EXPO_PUBLIC_MISTRAL_API_KEY` | Alternative : clé embarquée pour un **appel direct** (pratique en dev, non sécurisé) |
| `EXPO_PUBLIC_MISTRAL_MODE` | Force `proxy` ou `direct` (auto sinon) |
| `EXPO_PUBLIC_API_BASE_URL` | Origine du proxy pour un appareil réel (le natif ne peut pas appeler `/api/...` en relatif) |
| `EXPO_PUBLIC_MAPTILER_KEY` | Bascule la carte vers un style MapTiler (sinon tuiles OSM brutes) |
| `EXPO_PUBLIC_OSRM_URL` / `_NOMINATIM_URL` / `_PHOTON_URL` / `_OVERPASS_URL` | Surcharge des services OSM |
| `EXPO_PUBLIC_APP_USER_AGENT` | User-Agent requis par la politique d'usage OSM |

**Transport IA.** Par défaut : proxy si `MISTRAL_API_KEY` est côté serveur, sinon appel
direct si `EXPO_PUBLIC_MISTRAL_API_KEY` est défini. Le proxy tourne sur le serveur de dev
Expo ; **en production**, déployez avec `web.output: "server"` (EAS Hosting ou tout hôte
Node) et pointez le natif via `EXPO_PUBLIC_API_BASE_URL`. Sans clé, le panneau IA affiche
un message clair au lieu de planter.

**Services OSM** : les valeurs par défaut sont gratuites et sans clé, mais soumises à des
limites d'usage (Nominatim 1 req/s + User-Agent, OSRM démo « usage léger », tuiles OSM
démo). Passez à MapTiler/Stadia (tuiles) ou OpenRouteService (routage) via `.env` pour la
production.

## Architecture

```
src/
  app/            écran unique (index) + layout + route proxy /api/mistral
  theme/          tokens clair/sombre + recette de verre + ThemeProvider/useTheme
  state/          store zustand (machine à états d'écran) + types + selectors nav
  components/     glass · map (seam natif/web) · overlays · sheet · nav · ai · alert
  services/       routing (OSRM) · geocode (Nominatim/Photon) · places (Overpass) · ai (Mistral + tool loop)
  hooks/          localisation, progression nav, debounce, alerte contextuelle
  lib/            http (User-Agent/timeout) · cache TTL · limiter · geo · env
  constants/      config (endpoints + clés via env)
```

**Coutures (seams)** — chaque axe est isolé pour pouvoir être remplacé sans toucher à l'UI :
le moteur de carte (`MapCanvas` natif vs web), le transport IA (`services/ai/mistral.ts` +
`lib/env.ts`), la source de données (tout se normalise en `Place`), et le thème
(`tokens.ts`). La carte reste montée en permanence ; les caméras passent par un
`cameraIntent` dans le store (le store reste pur, `MapCanvas` détient la ref).

## Vérification

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm run web         # aperçu de tous les écrans (clair/sombre)
```

Les clients de service (`getRoute`, `nominatim.search`, `overpass.nearby`) ont été
validés contre les vrais serveurs OSM. Le rendu complet de la carte native + GPS +
navigation tour-par-tour se teste sur un *dev build* iOS/Android.
