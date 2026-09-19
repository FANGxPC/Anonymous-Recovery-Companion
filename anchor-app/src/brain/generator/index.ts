/**
 * ANCHOR — Generator Module Index
 * =================================
 * Unified interface for all generation modes.
 * Switches between sealed (WebLLM), assisted (cloud), and template (fallback).
 */

import type { CheckInData, CorpusChunk, SupportResponse, GenerationMode } from '../contracts';
import { initSealedGenerator, generateSealed, isSealedReady } from './sealed';
import { generateAssisted, isAssistedReady } from './assisted';
import { generateTemplate } from './templateFallback';

let currentMode: GenerationMode = 'template'; // Default to template until WebLLM loads

/**
 * Initialize the generator with the specified mode.
 */
export async function initGenerator(
  mode: GenerationMode = 'sealed',
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<void> {
  currentMode = mode;

  if (mode === 'sealed') {
    try {
      await initSealedGenerator(onProgress);
      console.log('[Generator] Sealed mode (WebLLM) initialized');
    } catch (err) {
      console.warn('[Generator] WebLLM init failed, falling back to template mode:', err);
      currentMode = 'template';
    }
  } else if (mode === 'assisted') {
    // Assisted mode is configured separately via configureAssistedMode()
    if (!isAssistedReady()) {
      console.warn('[Generator] Assisted mode not configured, falling back to template');
      currentMode = 'template';
    }
  }
  // Template mode needs no initialization
}

/**
 * Generate a grounded, cited response using the current mode.
 */
export async function generate(
  context: CheckInData,
  queryDescription: string,
  retrievedChunks: CorpusChunk[]
): Promise<SupportResponse> {
  try {
    switch (currentMode) {
      case 'sealed':
        if (isSealedReady()) {
          return await generateSealed(queryDescription, retrievedChunks);
        }
        // Fall through to template if sealed not ready
        console.warn('[Generator] Sealed mode not ready, using template');
        return generateTemplate(context, retrievedChunks);

      case 'assisted':
        if (isAssistedReady()) {
          return await generateAssisted(context, retrievedChunks);
        }
        console.warn('[Generator] Assisted mode not ready, using template');
        return generateTemplate(context, retrievedChunks);

      case 'template':
      default:
        return generateTemplate(context, retrievedChunks);
    }
  } catch (err) {
    console.error(`[Generator] ${currentMode} mode failed, using template fallback:`, err);
    return generateTemplate(context, retrievedChunks);
  }
}

/**
 * Get the current generation mode
 */
export function getGenerationMode(): GenerationMode {
  return currentMode;
}

/**
 * Switch generation mode at runtime
 */
export async function setGenerationMode(
  mode: GenerationMode,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<void> {
  if (mode === currentMode) return;

  if (mode === 'sealed' && !isSealedReady()) {
    await initSealedGenerator(onProgress);
  }

  currentMode = mode;
  console.log(`[Generator] Switched to ${mode} mode`);
}
