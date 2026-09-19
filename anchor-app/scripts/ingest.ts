/**
 * ANCHOR — Build-Time Corpus Ingest Script
 * ==========================================
 * Runs at build time (NOT in browser) to pre-compute corpus embeddings.
 *
 * Usage: npx tsx scripts/ingest.ts
 *
 * This script:
 * 1. Reads the chunked corpus from src/brain/corpus/chunks.json
 * 2. Computes embeddings for each chunk using all-MiniLM-L6-v2
 * 3. Saves the embeddings as a binary file for fast browser loading
 *
 * NOTE: For the hackathon, we compute embeddings at runtime in the browser
 * and cache to IndexedDB. This script is the production-ready approach.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = join(__dirname, '..', 'src', 'brain', 'corpus');
const CHUNKS_PATH = join(CORPUS_DIR, 'chunks.json');
const OUTPUT_PATH = join(CORPUS_DIR, 'embeddings.bin');

interface Chunk {
  id: string;
  text: string;
  sourceTitle: string;
  sourceRef: string;
  techniqueName: string | null;
  category: string;
}

async function ingest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANCHOR — Corpus Ingest Pipeline');
  console.log('═══════════════════════════════════════════════════════');

  // Step 1: Load chunks
  console.log('\n[1/3] Loading corpus chunks...');
  const chunks: Chunk[] = JSON.parse(readFileSync(CHUNKS_PATH, 'utf-8'));
  console.log(`  Loaded ${chunks.length} chunks`);

  // Step 2: Initialize the embedding pipeline
  console.log('\n[2/3] Loading embedding model (all-MiniLM-L6-v2)...');
  const { pipeline } = await import('@xenova/transformers');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('  Model loaded');

  // Step 3: Compute embeddings
  console.log('\n[3/3] Computing embeddings...');
  const embeddingDim = 384;
  const totalFloats = chunks.length * embeddingDim;
  const packed = new Float32Array(totalFloats);

  for (let i = 0; i < chunks.length; i++) {
    const output = await embedder(chunks[i].text, {
      pooling: 'mean',
      normalize: true,
    });

    const embedding = new Float32Array(output.data);
    packed.set(embedding, i * embeddingDim);

    if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
      console.log(`  Embedded ${i + 1}/${chunks.length} chunks`);
    }
  }

  // Step 4: Save binary file
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, Buffer.from(packed.buffer));

  const fileSizeKB = (packed.buffer.byteLength / 1024).toFixed(1);
  console.log(`\n  ✅ Saved ${OUTPUT_PATH}`);
  console.log(`  Dimensions: ${chunks.length} × ${embeddingDim} = ${totalFloats} floats`);
  console.log(`  File size: ${fileSizeKB} KB`);
  console.log('\n═══════════════════════════════════════════════════════');
}

ingest().catch((err) => {
  console.error('Ingest failed:', err);
  process.exit(1);
});
