/**
 * Mistral transport. The single seam between the assistant and the network:
 * proxy (key server-side) or direct (EXPO_PUBLIC key) — resolved in lib/env.
 * Plain fetch (the official SDK is ESM-only and trips Metro).
 */
import { resolveAiTransport } from '@/lib/env';
import { httpJson } from '@/lib/http';

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface MistralMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ChatBody {
  messages: MistralMessage[];
  tools?: unknown[];
  tool_choice?: 'auto' | 'any' | 'none';
  temperature?: number;
}

export interface ChatResponse {
  choices: {
    message: { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] };
    finish_reason: string;
  }[];
}

/** Thrown when no transport is configured (no key / no proxy origin). */
export class AiUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'AiUnavailableError';
  }
}

export async function chat(body: ChatBody): Promise<ChatResponse> {
  const t = resolveAiTransport();
  if (t.kind === 'none') throw new AiUnavailableError(t.reason);

  const payload = JSON.stringify({ model: t.model, temperature: 0.3, ...body });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (t.kind === 'direct') headers.Authorization = `Bearer ${t.apiKey}`;

  return httpJson<ChatResponse>(t.url, {
    method: 'POST',
    headers,
    body: payload,
    timeoutMs: 30000,
    retries: 0,
  });
}
