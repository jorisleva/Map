# Tester sur iPhone via TestFlight — sans ordinateur

Ce guide se fait **entièrement depuis le navigateur de ton téléphone**. À la fin, tu
lances un bouton dans GitHub, EAS construit l'app dans le cloud et l'envoie sur
**TestFlight**, où tu l'installes en un tap.

**Prérequis :** un compte **Apple Developer** (99 $/an, tu l'as ✅) et un compte **Expo**
(gratuit). Temps de mise en place : ~15 min. Les builds iOS EAS prennent ensuite 10–25 min.

---

## 1. Compte Expo + jeton (secret GitHub `EXPO_TOKEN`)

1. Crée un compte sur **expo.dev**.
2. **expo.dev → Account settings → Access tokens → Create token**. Copie le jeton.
3. Dans **GitHub → ton repo `Map` → Settings → Secrets and variables → Actions → New
   repository secret** :
   - Name : `EXPO_TOKEN`
   - Secret : *(colle le jeton)*

## 2. Créer le projet EAS + coller le `projectId`

1. **expo.dev → Projects → Create a project** (nom : `navigation-liquid-glass`). Copie le
   **Project ID** affiché.
2. Dans GitHub, édite **`app.json`** (crayon ✏️) et remplace
   `REMPLACER-PAR-VOTRE-EAS-PROJECT-ID` par ton Project ID. Commit.
   > Si le nom `com.jorisleva.liquidglass` (le *bundle identifier* dans `app.json`) ne te
   > convient pas, change-le ici aussi — il doit être unique sur l'App Store.

## 3. Clé App Store Connect (déverrouille signature + envoi)

1. **appstoreconnect.apple.com → Users and Access → Integrations → App Store Connect API →
   Generate API Key** (rôle **App Manager** ou **Admin**).
2. Note l'**Issuer ID** et le **Key ID**, et télécharge le fichier **`.p8`** (une seule fois).
3. Ajoute cette clé à EAS : **expo.dev → ton projet → Credentials → iOS → App Store Connect
   API Key → Add** (colle Issuer ID, Key ID, et le fichier `.p8`).

   EAS s'en sert pour **générer automatiquement** le certificat + le profil de signature
   **et** pour envoyer sur TestFlight — aucun autre secret Apple n'est nécessaire.

## 4. Clé Mistral pour l'app (secret EAS)

Le build natif appelle Mistral en direct, donc la clé doit être embarquée :

- **expo.dev → ton projet → Secrets → Create secret** :
  - Name : `EXPO_PUBLIC_MISTRAL_API_KEY`
  - Value : *(ta clé Mistral)*

> ⚠️ Ainsi la clé est incluse dans le build (OK pour un test perso via TestFlight). Pour une
> vraie publication, on déploierait plutôt le proxy `app/api/mistral+api.ts` et on utiliserait
> `EXPO_PUBLIC_API_BASE_URL` — dis-le-moi si tu veux cette version.

## 5. Lancer le build

1. **GitHub → repo → onglet Actions → « iOS · TestFlight » → Run workflow** (laisse le profil
   `production`).
2. Le premier build crée automatiquement les identifiants de signature (via la clé de l'étape
   3) et enregistre le bundle ID chez Apple. Suis l'avancement dans **expo.dev → Builds**.
3. À la fin, EAS **soumet l'app à TestFlight**. Le traitement Apple prend encore ~5–15 min.

## 6. Installer sur l'iPhone

1. Installe l'app **TestFlight** depuis l'App Store.
2. À la première soumission, va sur **appstoreconnect.apple.com → ton app → TestFlight** et
   ajoute-toi comme testeur (**Internal Testing**, ton propre e-mail Apple).
3. Ouvre **TestFlight** sur l'iPhone → l'app apparaît → **Installer**. 🎉

Ensuite, pour chaque nouvelle version : relance simplement le workflow (étape 5).

---

## Notes

- **Limites EAS** : le plan gratuit inclut un nombre limité de builds/mois et les builds iOS
  peuvent être mis en file d'attente. Un plan payant EAS supprime l'attente.
- **Carte native** : cette version installe la vraie carte **MapLibre** (OpenStreetMap natif),
  contrairement à Expo Go.
- **Rien à signer côté Apple manuellement** : EAS gère certificat + profil via la clé API de
  l'étape 3.
