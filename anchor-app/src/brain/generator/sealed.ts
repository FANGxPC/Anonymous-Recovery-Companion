/**
 * ANCHOR — Sealed Mode Generator (WebLLM)
 * =========================================
 * Runs a small LLM entirely in the browser via WebLLM (MLC).
 * ZERO network calls. Privacy-preserving by construction.
 * The crisis path ALWAYS uses this mode.
 */

import type { CorpusChunk, SupportResponse } from '../contracts';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseModelResponse,
  guardrailCheck,
} from './prompts';

// WebLLM engine instance
let engine: any = null;
let initPromise: Promise<void> | null = null;

// Model to use — Phi-3 mini is small enough for in-browser use
const MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC';

/**
 * Initialize the WebLLM engine. Downloads the model on first use,
 * then caches it in the browser.
 */
export async function initSealedGenerator(
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<void> {
  if (engine) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      console.log('[SealedGenerator] Initializing WebLLM with model:', MODEL_ID);

      engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: any) => {
          console.log(`[SealedGenerator] ${report.text}`);
          if (onProgress) {
            onProgress({
              text: report.text,
              progress: report.progress || 0,
            });
          }
        },
      });

      console.log('[SealedGenerator] Model loaded successfully');
    } catch (err) {
      console.error('[SealedGenerator] Failed to initialize:', err);
      engine = null;
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Generate a grounded, cited response using the local LLM.
 *
 * @param queryDescription - Natural language description of the user's situation
 * @param retrievedChunks - Top-k corpus chunks from the retriever
 * @returns SupportResponse with citation
 */
export async function generateSealed(
  queryDescription: string,
  retrievedChunks: CorpusChunk[]
): Promise<SupportResponse> {
  if (!engine) {
    throw new Error('[SealedGenerator] Not initialized. Call initSealedGenerator() first.');
  }

  const contextPassages = retrievedChunks.map(
    (c) => `[Source: ${c.sourceTitle}] ${c.text}`
  );

  const userPrompt = buildUserPrompt(queryDescription, contextPassages);

  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Low temp for factual, grounded responses
      max_tokens: 300,
    });

    const rawText = response.choices[0]?.message?.content || '';

    // Parse the JSON response
    const parsed = parseModelResponse(rawText, retrievedChunks);
    if (!parsed) {
      // Fallback: use the first retrieved chunk directly
      return createFallbackResponse(retrievedChunks);
    }

    // Post-generation guardrail check
    const guardrail = guardrailCheck(parsed.text);
    if (!guardrail.passes) {
      console.warn(`[SealedGenerator] Guardrail violation: ${guardrail.violation}`);
      // Fall back to template-based response
      return createFallbackResponse(retrievedChunks);
    }

    return {
      text: parsed.text,
      source: parsed.source,
      excerpt: parsed.excerpt,
      crisis: false, // Crisis detection is done by the classifier, not the generator
    };
  } catch (err) {
    console.error('[SealedGenerator] Generation failed:', err);
    // Graceful degradation — return template-based response
    return createFallbackResponse(retrievedChunks);
  }
}

/**
 * Create a fallback response from retrieved chunks when LLM fails or violates guardrails.
 */
function createFallbackResponse(chunks: CorpusChunk[]): SupportResponse {
  const topChunk = chunks[0];
  if (!topChunk) {
    return {
      text: "I'm here with you. If you need immediate support, please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or SAMHSA's helpline at 1-800-662-4357.",
      source: 'SAMHSA National Helpline Guide',
      excerpt: "SAMHSA's National Helpline is a free, confidential, 24/7 treatment referral service.",
      crisis: false,
    };
  }

  // Extract a useful suggestion from the chunk
  const technique = topChunk.techniqueName
    ? `Try the ${topChunk.techniqueName} technique: `
    : '';

  // Take the first 2-3 sentences of the chunk as the suggestion
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
 * Check if the sealed generator is ready
 */
export function isSealedReady(): boolean {
  return engine !== null;
}

/**
 * Reset the engine (for testing)
 */
export async function resetSealedGenerator(): Promise<void> {
  if (engine) {
    try {
      await engine.unload();
    } catch {
      // Ignore
    }
    engine = null;
    initPromise = null;
  }
}
