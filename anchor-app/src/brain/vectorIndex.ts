/**
 * ANCHOR — Vector Index
 * ======================
 * Brute-force k-NN cosine similarity search over the corpus embeddings.
 * The corpus is small (~40 chunks, 384 dimensions) so brute-force is fine.
 * No native deps, no server, no external vector DB.
 *
 * Supports:
 * - Loading pre-computed embeddings from bundled data
 * - Persisting to IndexedDB for faster subsequent loads
 * - Runtime cosine similarity search
 */

import type { CorpusChunk, SearchResult } from './contracts';
import chunksData from './corpus/chunks.json';

// ─── Cosine Similarity ──────────────────────────────────────────

/**
 * Compute cosine similarity between two normalized vectors.
 * Since vectors are normalized (L2 norm = 1), cosine similarity = dot product.
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

// ─── IDB Persistence ────────────────────────────────────────────

const IDB_NAME = 'anchor-vector-index';
const IDB_VERSION = 1;
const IDB_STORE = 'embeddings';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIDB(
  key: string,
  data: ArrayBuffer
): Promise<void> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadFromIDB(key: string): Promise<ArrayBuffer | null> {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const store = tx.objectStore(IDB_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// ─── Vector Index Class ──────────────────────────────────────────

export class VectorIndex {
  private chunks: CorpusChunk[] = [];
  private embeddings: Float32Array[] = [];
  private isLoaded = false;
  private embeddingDim = 384; // all-MiniLM-L6-v2

  /**
   * Initialize the index by loading chunks and their pre-computed embeddings.
   *
   * Strategy:
   * 1. Try loading from IndexedDB cache (fastest)
   * 2. If not cached, compute embeddings at runtime (slower first load)
   * 3. Cache to IndexedDB for future loads
   */
  async init(embedFn?: (text: string) => Promise<Float32Array>): Promise<void> {
    if (this.isLoaded) return;

    console.log('[VectorIndex] Loading corpus chunks...');

    // Load chunks from bundled JSON
    this.chunks = chunksData as CorpusChunk[];
    console.log(`[VectorIndex] Loaded ${this.chunks.length} chunks`);

    // Try loading pre-computed embeddings from IndexedDB
    const cached = await loadFromIDB('corpus-embeddings-v1');
    if (cached) {
      console.log('[VectorIndex] Loading embeddings from IndexedDB cache');
      this.deserializeEmbeddings(cached);
      this.isLoaded = true;
      return;
    }

    // No cache — compute embeddings at runtime if embedFn is provided
    if (embedFn) {
      console.log('[VectorIndex] Computing embeddings at runtime...');
      for (const chunk of this.chunks) {
        const embedding = await embedFn(chunk.text);
        this.embeddings.push(embedding);
      }

      // Cache for future loads
      const serialized = this.serializeEmbeddings();
      await saveToIDB('corpus-embeddings-v1', serialized);
      console.log('[VectorIndex] Embeddings cached to IndexedDB');
    } else {
      console.warn(
        '[VectorIndex] No cached embeddings and no embed function provided. Search will not work.'
      );
    }

    this.isLoaded = true;
  }

  /**
   * Search for the top-k most similar chunks to a query embedding.
   *
   * @param queryEmbedding - The embedded query vector
   * @param topK - Number of results to return (default: 5)
   * @returns Sorted array of SearchResult (highest similarity first)
   */
  search(queryEmbedding: Float32Array, topK: number = 5): SearchResult[] {
    if (!this.isLoaded || this.embeddings.length === 0) {
      console.warn('[VectorIndex] Index not loaded or empty');
      return [];
    }

    // Brute-force cosine similarity against all embeddings
    const scored: SearchResult[] = this.embeddings.map((emb, i) => ({
      score: cosineSimilarity(queryEmbedding, emb),
      chunk: this.chunks[i],
    }));

    // Sort by score descending, take top-k
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Search by category filter + similarity
   */
  searchByCategory(
    queryEmbedding: Float32Array,
    category: string,
    topK: number = 3
  ): SearchResult[] {
    if (!this.isLoaded || this.embeddings.length === 0) return [];

    const scored: SearchResult[] = this.embeddings
      .map((emb, i) => ({
        score: cosineSimilarity(queryEmbedding, emb),
        chunk: this.chunks[i],
      }))
      .filter((r) => r.chunk.category === category);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Get all chunks (for eval harness / debugging)
   */
  getAllChunks(): CorpusChunk[] {
    return [...this.chunks];
  }

  /**
   * Check if the index is ready
   */
  ready(): boolean {
    return this.isLoaded && this.embeddings.length > 0;
  }

  /**
   * Get stats about the index
   */
  stats(): { chunkCount: number; embeddingDim: number; ready: boolean } {
    return {
      chunkCount: this.chunks.length,
      embeddingDim: this.embeddingDim,
      ready: this.ready(),
    };
  }

  // ─── Serialization ──────────────────────────────────────────

  private serializeEmbeddings(): ArrayBuffer {
    // Pack all embeddings into a single Float32Array
    const totalFloats = this.embeddings.length * this.embeddingDim;
    const packed = new Float32Array(totalFloats);
    for (let i = 0; i < this.embeddings.length; i++) {
      packed.set(this.embeddings[i], i * this.embeddingDim);
    }
    return packed.buffer;
  }

  private deserializeEmbeddings(buffer: ArrayBuffer): void {
    const packed = new Float32Array(buffer);
    const count = packed.length / this.embeddingDim;
    this.embeddings = [];
    for (let i = 0; i < count; i++) {
      const start = i * this.embeddingDim;
      this.embeddings.push(packed.slice(start, start + this.embeddingDim));
    }
    console.log(
      `[VectorIndex] Deserialized ${this.embeddings.length} embeddings`
    );
  }
}

// ─── Singleton Export ────────────────────────────────────────────

export const vectorIndex = new VectorIndex();
