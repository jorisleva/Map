/**
 * The tool-calling loop: chat → (if the model calls search_places) run the tool,
 * feed results back, chat again → final French reply. Result cards come from the
 * structured tool output, never from parsing the prose.
 */
import type { ChatMessage, Place } from '@/state/types';

import { chat, type MistralMessage } from './mistral';
import { SYSTEM_PROMPT } from './prompt';
import { runSearchPlaces, searchPlacesTool, type AiContext } from './tools';

export interface AssistantResult {
  reply: string;
  cards: Place[];
}

const toToolJson = (p: Place) => ({
  name: p.name,
  category: p.category,
  meta: p.meta,
  distance_m: p.distanceM != null ? Math.round(p.distanceM) : undefined,
  lat: p.lat,
  lng: p.lng,
});

export async function runAssistant(
  userText: string,
  history: ChatMessage[],
  ctx: AiContext,
): Promise<AssistantResult> {
  const messages: MistralMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userText },
  ];

  const first = await chat({ messages, tools: [searchPlacesTool], tool_choice: 'auto' });
  const msg = first.choices?.[0]?.message;
  const cards: Place[] = [];
  const seen = new Set<string>();

  if (msg?.tool_calls?.length) {
    // Must echo the assistant message that carries the tool_calls before results.
    messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: msg.tool_calls });

    for (const call of msg.tool_calls) {
      let args: { query?: string; radius?: number } = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        // malformed arguments → empty search
      }
      let places: Place[] = [];
      try {
        places = await runSearchPlaces(args, ctx);
      } catch {
        // tool failure → empty result, model handles gracefully
      }
      for (const p of places) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          cards.push(p);
        }
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        name: call.function.name,
        content: JSON.stringify(places.slice(0, 6).map(toToolJson)),
      });
    }

    const second = await chat({ messages });
    return { reply: second.choices?.[0]?.message?.content ?? '', cards };
  }

  return { reply: msg?.content ?? '', cards };
}
