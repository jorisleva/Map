/**
 * Server-side proxy for Mistral. Holds MISTRAL_API_KEY (a NON-public env var, so
 * it never ships in the app bundle) and forwards the chat body to Mistral with
 * the Authorization header attached. The app calls this at /api/mistral.
 *
 * Runs on the Expo dev server in development; for production, deploy with
 * `web.output: "server"` (EAS Hosting or any Node host) and point native builds
 * at its origin via EXPO_PUBLIC_API_BASE_URL.
 */
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

export async function POST(request: Request): Promise<Response> {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    return Response.json(
      { error: 'MISTRAL_API_KEY non configurée côté serveur.' },
      { status: 500 },
    );
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return Response.json({ error: 'Corps de requête invalide.' }, { status: 400 });
  }

  try {
    const upstream = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body,
    });
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return Response.json({ error: "Impossible de contacter l'API Mistral." }, { status: 502 });
  }
}
