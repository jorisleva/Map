/**
 * Resolves how the app reaches Mistral — the single seam between the UI and the
 * AI transport. UI code never learns whether it's proxy or direct.
 *
 * Auto behavior (no EXPO_PUBLIC_MISTRAL_MODE set):
 *   - direct  when EXPO_PUBLIC_MISTRAL_API_KEY is present
 *   - proxy   otherwise (web → relative /api/mistral; native → EXPO_PUBLIC_API_BASE_URL)
 */
import { Platform } from 'react-native';

import { AI, ENDPOINTS } from '@/constants/config';

export type AiTransport =
  | { kind: 'direct'; url: string; apiKey: string; model: string }
  | { kind: 'proxy'; url: string; model: string }
  | { kind: 'none'; reason: string };

const direct = (): AiTransport =>
  AI.publicKey
    ? { kind: 'direct', url: ENDPOINTS.mistralDirect, apiKey: AI.publicKey, model: AI.model }
    : { kind: 'none', reason: 'EXPO_PUBLIC_MISTRAL_API_KEY manquant.' };

export function resolveAiTransport(): AiTransport {
  if (AI.mode === 'direct') return direct();

  const wantProxy = AI.mode === 'proxy' || !AI.publicKey;
  if (!wantProxy) return direct();

  const base = Platform.OS === 'web' ? '' : AI.apiBase;
  if (Platform.OS !== 'web' && !base) {
    // No proxy origin reachable on device: fall back to a direct key if we have one.
    if (AI.publicKey) return direct();
    return {
      kind: 'none',
      reason:
        'Configurez MISTRAL_API_KEY + EXPO_PUBLIC_API_BASE_URL (proxy) ou EXPO_PUBLIC_MISTRAL_API_KEY (direct).',
    };
  }
  return { kind: 'proxy', url: `${base}/api/mistral`, model: AI.model };
}
