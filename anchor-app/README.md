# ⚓ ANCHOR App — Frontend PWA

This directory contains the React 19 + TypeScript + Vite Progressive Web App for **ANCHOR** (Anonymous Recovery Companion).

## 🚀 Key Modules

- `src/vault/`: Local WebCrypto (AES-GCM) + Argon2id WASM key derivation + IndexedDB local storage engine.
- `src/brain/`: Local RAG retriever, `@xenova/transformers` vector index, crisis classifier, and evaluation interface.
- `src/hardware/`: Web Bluetooth API manager for pairing with the ESP32 physical Anchor Button.
- `src/blockchain/`: Ethers.js integration for reading on-chain resource verification status from `ResourceRegistry.sol`.
- `src/pages/`: React UI components (Dashboard, CheckIn, Crisis, Journal, Goals, Triggers, Resources, Settings, Breathe).

## 🛠️ Scripts

- `npm run dev`: Start Vite development server.
- `npm run build`: Type-check and build production PWA bundle.
- `npm run eval`: Run safety guardrail, crisis recall, and citation evaluation harness.
- `npm run ingest`: Process and embed RAG corpus into vector store.

For complete documentation on the ANCHOR project, please see the [Root README.md](../README.md).
