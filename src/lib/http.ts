/**
 * Small fetch wrapper: descriptive User-Agent (mandatory for OSM services — RN's
 * native fetch honors it; browsers silently drop this forbidden header, which is
 * fine), an AbortController timeout, one retry on transient failure, JSON parse.
 */
import { USER_AGENT } from '@/constants/config';

export interface HttpOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

async function once(url: string, opts: HttpOptions): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
  // If the caller passed a signal, abort our controller when it aborts.
  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  try {
    return await fetch(url, {
      method: opts.method ?? 'GET',
      headers: { 'User-Agent': USER_AGENT, ...opts.headers },
      body: opts.body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function httpJson<T>(url: string, opts: HttpOptions = {}): Promise<T> {
  const retries = opts.retries ?? 1;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await once(url, opts);
      if (!res.ok) {
        // 4xx won't get better on retry; bail immediately.
        if (res.status >= 400 && res.status < 500) {
          throw new HttpError(res.status, `${res.status} ${res.statusText}`);
        }
        throw new HttpError(res.status, `${res.status} ${res.statusText}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) throw err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
