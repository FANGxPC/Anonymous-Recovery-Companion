/**
 * ANCHOR — Retriever
 * ===================
 * Orchestrates query embedding → vector search → top-k retrieval.
 * Wraps the embedder and vector index into a single retrieval call.
 */

import type { CheckInData, SearchResult } from './contracts';
import { embed, buildQueryString, isEmbedderReady } from './embedder';
import { vectorIndex } from './vectorIndex';

/**
 * Retrieve the most relevant corpus chunks for a given check-in context.
 *
 * @param context - The user's check-in data
 * @param topK - Number of results to return (default: 5)
 * @returns Array of search results sorted by relevance
 */
export async function retrieve(
  context: CheckInData,
  topK: number = 5
): Promise<SearchResult[]> {
  // Build a natural language query from the structured check-in
  const queryString = buildQueryString(context);

  if (!isEmbedderReady()) {
    console.warn('[Retriever] Embedder not ready, returning empty results');
    return [];
  }

  if (!vectorIndex.ready()) {
    console.warn('[Retriever] Vector index not ready, returning empty results');
    return [];
  }

  // Embed the query
  const queryEmbedding = await embed(queryString);

  // Search the index
  const results = vectorIndex.search(queryEmbedding, topK);

  // Log retrieval for debugging
  console.log(
    `[Retriever] Query: "${queryString.slice(0, 80)}..." → ${results.length} results`
  );
  results.forEach((r, i) => {
    console.log(
      `  [${i + 1}] score=${r.score.toFixed(4)} | ${r.chunk.sourceTitle} | ${r.chunk.techniqueName || 'general'}`
    );
  });

  return results;
}

/**
 * Retrieve with category boost — returns results biased toward a specific category.
 * Useful for crisis situations (boost crisis_resources) or specific needs.
 */
export async function retrieveWithCategoryBoost(
  context: CheckInData,
  boostCategory: string,
  topK: number = 5,
  boostFactor: number = 0.15
): Promise<SearchResult[]> {
  const queryString = buildQueryString(context);

  if (!isEmbedderReady() || !vectorIndex.ready()) {
    return [];
  }

  const queryEmbedding = await embed(queryString);
  const allResults = vectorIndex.search(queryEmbedding, topK * 2);

  // Apply category boost
  const boosted = allResults.map((r) => ({
    ...r,
    score:
      r.chunk.category === boostCategory
        ? r.score + boostFactor
        : r.score,
  }));

  boosted.sort((a, b) => b.score - a.score);
  return boosted.slice(0, topK);
}

/**
 * Get crisis-specific resources directly (no embedding needed).
 * For the crisis path, we always include these regardless of similarity.
 */
export function getCrisisResources(): SearchResult[] {
  const allChunks = vectorIndex.getAllChunks();
  return allChunks
    .filter((chunk) => chunk.category === 'crisis_resources')
    .map((chunk) => ({ score: 1.0, chunk }));
}
