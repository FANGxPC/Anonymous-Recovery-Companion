/**
 * ANCHOR — Brain Module (Public API)
 * ====================================
 * This is the single entry point that Person A imports.
 *
 * Usage:
 *   import { brain } from './brain';
 *
 *   await brain.init();
 *   brain.onCrisis((source) => showEmergencyScreen(source));
 *   const response = await brain.getSupport(checkInData);
 *
 * The module is self-contained. Person A doesn't need to know about
 * embeddings, vector indices, or LLMs. They just call getSupport().
 */

import type {
  BrainModule,
  CheckInData,
  SupportResponse,
  EvalResults,
  GenerationMode,
} from './contracts';

// Re-export contracts for Person A
export type {
  CheckInData,
  SupportResponse,
  EvalResults,
  GenerationMode,
  BrainModule,
} from './contracts';

export type { CrisisCallback, CrisisSource } from './contracts';

import { mockGetSupport } from './mock';
import {
  checkCrisis,
  onCrisis,
  offCrisis,
  fireCrisisEvent,
} from './crisisClassifier';
import { initEmbedder, embed, buildQueryString } from './embedder';
import { vectorIndex } from './vectorIndex';
import { retrieve, getCrisisResources } from './retriever';
import {
  initGenerator,
  generate,
  setGenerationMode,
} from './generator';
import { runEvalHarness } from './eval/harness';

// ─── Module State ────────────────────────────────────────────────

let initialized = false;
let useMock = true; // Start with mock, switch to real when initialized
let currentMode: GenerationMode = 'template';

// ─── Brain Module Implementation ─────────────────────────────────

/**
 * Initialize the brain module.
 * Loads embeddings model, vector index, and optionally the LLM.
 *
 * @param mode - Generation mode: 'sealed' (WebLLM), 'assisted' (cloud), or 'template' (fallback)
 */
async function init(mode: GenerationMode = 'template'): Promise<void> {
  if (initialized) return;

  console.log('[Brain] Initializing...');
  currentMode = mode;

  try {
    // Step 1: Initialize the embedder (transformers.js)
    console.log('[Brain] Step 1/3: Loading embedding model...');
    await initEmbedder();

    // Step 2: Initialize the vector index (load corpus + compute/load embeddings)
    console.log('[Brain] Step 2/3: Building vector index...');
    await vectorIndex.init(embed);

    // Step 3: Initialize the generator (mode-dependent)
    console.log('[Brain] Step 3/3: Initializing generator...');
    await initGenerator(mode);

    useMock = false;
    initialized = true;
    currentMode = mode;

    console.log('[Brain] Initialized successfully');
    console.log(`[Brain] Mode: ${mode}`);
    console.log(`[Brain] Index stats:`, vectorIndex.stats());
  } catch (err) {
    console.error('[Brain] Initialization failed, using mock mode:', err);
    // Graceful degradation — mock mode always works
    useMock = true;
    initialized = true;
    currentMode = 'template';
  }
}

/**
 * Get a grounded, cited support response for a check-in.
 * This is the main function Person A calls.
 */
async function getSupport(context: CheckInData): Promise<SupportResponse> {
  // Step 1: Crisis check ALWAYS runs first (offline, fast, no LLM)
  const crisisResult = checkCrisis(context, context.note);

  if (crisisResult.isCrisis) {
    // Fire crisis event to all subscribers
    fireCrisisEvent('classifier');

    // For crisis situations, return crisis resources directly
    if (useMock) {
      const mockResponse = mockGetSupport({ ...context, mood: 'crisis' });
      return { ...mockResponse, crisis: true };
    }

    // Get crisis-specific resources
    const crisisResources = getCrisisResources();
    if (crisisResources.length > 0) {
      const response = await generate(
        context,
        buildQueryString(context),
        crisisResources.map((r) => r.chunk)
      );
      return { ...response, crisis: true };
    }
  }

  // Step 2: If using mock mode (before init or if init failed)
  if (useMock) {
    return mockGetSupport(context);
  }

  // Step 3: Full RAG pipeline — embed → retrieve → generate
  try {
    const queryString = buildQueryString(context);
    const results = await retrieve(context);

    if (results.length === 0) {
      console.warn('[Brain] No retrieval results, using mock');
      return mockGetSupport(context);
    }

    const chunks = results.map((r) => r.chunk);
    const response = await generate(context, queryString, chunks);

    return {
      ...response,
      crisis: crisisResult.isCrisis,
    };
  } catch (err) {
    console.error('[Brain] getSupport failed, falling back to mock:', err);
    return mockGetSupport(context);
  }
}

/**
 * Run the eval harness. Returns 3 metrics for the slide.
 */
async function runEval(): Promise<EvalResults> {
  return runEvalHarness(
    (ctx) => getSupport(ctx),
    typeof window === 'undefined' // Verbose in CLI, quiet in browser
  );
}

/**
 * Check if the module is initialized
 */
function isReady(): boolean {
  return initialized;
}

/**
 * Get current generation mode
 */
function getMode(): GenerationMode {
  return currentMode;
}

/**
 * Switch generation mode at runtime
 */
async function setMode(mode: GenerationMode): Promise<void> {
  await setGenerationMode(mode);
  currentMode = mode;
}

// ─── The Brain Module Singleton ──────────────────────────────────

export const brain: BrainModule = {
  init,
  getSupport,
  onCrisis,
  offCrisis,
  runEval,
  isReady,
  getMode,
  setMode,
};

// Default export for convenience
export default brain;

// Named exports for direct access (Person A can use either pattern)
export { onCrisis, offCrisis, fireCrisisEvent, checkCrisis } from './crisisClassifier';
export { buildQueryString } from './embedder';
export { configureAssistedMode, previewPayload } from './generator/assisted';
