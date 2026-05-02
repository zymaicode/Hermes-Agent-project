import type { AiConfig } from './types';

export interface AiApiResponse {
  content: string;
  error?: string;
}

export async function callAiApi(
  config: AiConfig,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 1024,
  systemPrompt?: string,
): Promise<AiApiResponse> {
  if (!config.apiKey) {
    return { content: '', error: 'no_api_key' };
  }

  const msgs = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  try {
    const url = `${config.endpoint}/v1/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: msgs, max_tokens: maxTokens }),
    });

    if (!response.ok) {
      return { content: '', error: `API error: ${response.status}` };
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return { content: data.choices[0]?.message?.content?.trim() || '' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: '', error: msg };
  }
}

export function extractJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
  } catch { /* ignore */ }
  return null;
}
