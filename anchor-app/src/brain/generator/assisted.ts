/**
 * ANCHOR — Assisted Mode Generator (Cloud LLM)
 * ===============================================
 * Opt-in cloud LLM generation mode. Uses a cloud API for higher quality.
 *
 * CRITICAL PRIVACY RULE: NEVER send raw journal text.
 * Only a structured, non-identifying summary is sent:
 * { mood: "low", trigger_category: "social", days_since_slip: 3 }
 *
 * The UI MUST show the user exactly what will be sent BEFORE sending.
 */

import type { CheckInData, CorpusChunk, SupportResponse } from '../contracts';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseModelResponse,
  guardrailCheck,
} from './prompts';

// Cloud API configuration
let apiEndpoint: string = '';
let apiKey: string = '';
let isConfigured = false;

/**
 * Configure the assisted mode with an API endpoint and key.
 * Person A's settings UI calls this when the user opts in.
 */
export function configureAssistedMode(endpoint: string, key: string): void {
  apiEndpoint = endpoint;
  apiKey = key;
  isConfigured = true;
  console.log('[AssistedGenerator] Configured with endpoint:', endpoint);
}

/**
 * Build a non-identifying summary from check-in data.
 * This is the ONLY thing sent to the cloud. Never raw text.
 *
 * @param context - The user's check-in data
 * @returns A structured summary safe to send to a cloud API
 */
export function buildSafeSummary(context: CheckInData): string {
  // Strip all personal information — only structured categories
  return JSON.stringify({
    mood: context.mood,
    trigger_category: context.triggerCategory,
    // NOTE: context.note is NEVER sent to the cloud
    // Only the structured fields are transmitted
  });
}

/**
 * Show exactly what would be sent to the cloud.
 * The UI calls this BEFORE sending, so the user can review and consent.
 */
export function previewPayload(
  context: CheckInData,
  retrievedChunks: CorpusChunk[]
): {
  summary: string;
  contextPassages: string[];
  systemPrompt: string;
} {
  return {
    summary: buildSafeSummary(context),
    contextPassages: retrievedChunks.map((c) => c.text.slice(0, 100) + '...'),
    systemPrompt: SYSTEM_PROMPT,
  };
}

/**
 * Generate a response using the cloud LLM.
 *
 * @param context - The user's check-in data (note is NEVER sent)
 * @param retrievedChunks - Top-k corpus chunks from the retriever
 * @returns SupportResponse with citation
 */
export async function generateAssisted(
  context: CheckInData,
  retrievedChunks: CorpusChunk[]
): Promise<SupportResponse> {
  if (!isConfigured) {
    throw new Error(
      '[AssistedGenerator] Not configured. Call configureAssistedMode() first.'
    );
  }

  // Build the safe summary (never raw journal text)
  const safeSummary = buildSafeSummary(context);

  const contextPassages = retrievedChunks.map(
    (c) => `[Source: ${c.sourceTitle}] ${c.text}`
  );

  const userPrompt = buildUserPrompt(safeSummary, contextPassages);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective, capable enough for grounded generation
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloud API returned ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || '';

    // Parse the response
    const parsed = parseModelResponse(rawText, retrievedChunks);
    if (!parsed) {
      return createTemplateFallback(retrievedChunks);
    }

    // Post-generation guardrail check
    const guardrail = guardrailCheck(parsed.text);
    if (!guardrail.passes) {
      console.warn(`[AssistedGenerator] Guardrail violation: ${guardrail.violation}`);
      return createTemplateFallback(retrievedChunks);
    }

    return {
      text: parsed.text,
      source: parsed.source,
      excerpt: parsed.excerpt,
      crisis: false,
    };
  } catch (err) {
    console.error('[AssistedGenerator] Generation failed:', err);
    return createTemplateFallback(retrievedChunks);
  }
}

/**
 * Template-based fallback when cloud API fails
 */
function createTemplateFallback(chunks: CorpusChunk[]): SupportResponse {
  const topChunk = chunks[0];
  if (!topChunk) {
    return {
      text: "I'm here with you. For immediate support, contact the 988 Suicide & Crisis Lifeline or SAMHSA's helpline at 1-800-662-4357.",
      source: 'SAMHSA National Helpline Guide',
      excerpt: "SAMHSA's National Helpline is a free, confidential, 24/7 treatment referral service.",
      crisis: false,
    };
  }

  const technique = topChunk.techniqueName
    ? `Here's a technique that might help — ${topChunk.techniqueName}: `
    : '';
  const sentences = topChunk.text.split(/\.\s+/).filter(Boolean);
  const suggestion = sentences.slice(0, 3).join('. ') + '.';

  return {
    text: `${technique}${suggestion}`,
    source: topChunk.sourceTitle,
    excerpt: topChunk.text.slice(0, 200),
    crisis: false,
  };
}

/**
 * Check if assisted mode is configured and ready
 */
export function isAssistedReady(): boolean {
  return isConfigured;
}
