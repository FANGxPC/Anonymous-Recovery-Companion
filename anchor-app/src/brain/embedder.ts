/**
 * ANCHOR — In-Browser Embedder
 * ==============================
 * Wraps transformers.js (all-MiniLM-L6-v2) for query-time embedding.
 * Corpus embeddings are pre-computed at build time (see scripts/ingest.ts).
 * This module handles only RUNTIME (query) embeddings in the browser.
 */

// We use dynamic import for transformers.js to support tree-shaking and lazy loading
let pipelineInstance: any = null;
let initPromise: Promise<void> | null = null;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

/**
 * Initialize the embedding model. Call once on app startup.
 * Subsequent calls are no-ops (returns the cached instance).
 */
export async function initEmbedder(): Promise<void> {
  if (pipelineInstance) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Dynamic import — transformers.js is only loaded when needed
      const { pipeline } = await import('@xenova/transformers');

      console.log('[Embedder] Loading model:', MODEL_NAME);
      pipelineInstance = await pipeline('feature-extraction', MODEL_NAME, {
        // Cache model in browser storage for faster subsequent loads
        cache_dir: 'anchor-models',
      } as any);
      console.log('[Embedder] Model loaded successfully');
    } catch (err) {
      console.error('[Embedder] Failed to load model:', err);
      // Reset state so it can be retried
      pipelineInstance = null;
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Embed a text string into a normalized Float32Array vector.
 *
 * @param text - The text to embed (check-in note, query, etc.)
 * @returns Float32Array of 384 dimensions (all-MiniLM-L6-v2 output)
 */
export async function embed(text: string): Promise<Float32Array> {
  if (!pipelineInstance) {
    throw new Error(
      '[Embedder] Not initialized. Call initEmbedder() first.'
    );
  }

  const output = await pipelineInstance(text, {
    pooling: 'mean',
    normalize: true,
  });

  // transformers.js returns a Tensor — extract the Float32Array data
  return new Float32Array(output.data);
}

/**
 * Embed multiple texts in batch for efficiency.
 *
 * @param texts - Array of texts to embed
 * @returns Array of Float32Array embeddings
 */
export async function embedBatch(texts: string[]): Promise<Float32Array[]> {
  // Process one at a time for now — batch support depends on model/device
  const results: Float32Array[] = [];
  for (const text of texts) {
    results.push(await embed(text));
  }
  return results;
}

/**
 * Get the embedding dimension (384 for all-MiniLM-L6-v2)
 */
export function getEmbeddingDimension(): number {
  return 384;
}

/**
 * Check if the embedder is ready
 */
export function isEmbedderReady(): boolean {
  return pipelineInstance !== null;
}

/**
 * Build a query string from check-in data for embedding.
 * Combines mood, trigger, and note into a searchable string.
 */
export function buildQueryString(context: {
  mood: string;
  triggerCategory: string;
  note?: string;
}): string {
  const parts: string[] = [];

  // Map mood to descriptive text for better retrieval
  const moodDescriptions: Record<string, string> = {
    great: 'I am feeling great and positive today',
    good: 'I am having a good day and feeling stable',
    okay: 'I am feeling okay, neither good nor bad',
    low: 'I am feeling low, sad, or struggling today',
    crisis: 'I am in crisis and need immediate help',
  };

  parts.push(moodDescriptions[context.mood] || `I am feeling ${context.mood}`);

  // Add trigger context
  if (context.triggerCategory && context.triggerCategory !== 'other') {
    const triggerDescriptions: Record<string, string> = {
      social: 'I am dealing with a social situation trigger',
      stress: 'I am experiencing stress-related challenges',
      craving: 'I am having cravings or urges to use',
      emotional: 'I am dealing with intense emotions',
      environmental: 'My environment is triggering me',
      physical: 'I have physical discomfort or health concerns',
      financial: 'I am stressed about financial issues',
      relationship: 'I am having relationship difficulties',
      boredom: 'I am feeling bored and restless',
    };
    parts.push(
      triggerDescriptions[context.triggerCategory] ||
        `My trigger is related to ${context.triggerCategory}`
    );
  }

  // Add the user's own note if provided
  if (context.note && context.note.trim()) {
    parts.push(context.note.trim());
  }

  return parts.join('. ');
}
