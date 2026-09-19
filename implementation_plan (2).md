# ANCHOR — Implementation Plan (3-Person Team · Web App)
### ByteQuest Hackathon · Track A — Tech for Recovery · Problem 05 · 36 Hours

> Core rule: **define the shared contracts in the first hour, then don't touch them.**
> Architecture: **backendless PWA** — no server, no account, no sync. The browser is the database.

---

## 0. Web-app-specific decisions to lock in Hour 1

1. **Browser: Chrome or Edge only.** Web Bluetooth, WebGPU (for WebLLM), and Web Speech API require it. The demo machine is decided Friday, tested Friday.
2. **Secure context from hour one:** deploy behind HTTPS (or develop on localhost). WebCrypto and Web Bluetooth refuse to run otherwise — discovering this on stage is fatal.
3. **Static hosting only.** No backend endpoint should ever appear in the Network tab — that silence *is* the pitch.
4. **React + Vite + TypeScript**, PWA via Workbox. No framework debates after hour one.

---

## 1. Roles

### 👤 Person A — "The Vault" (Web App & Privacy Core)
Everything the user touches and everything that stores data.

- React PWA: onboarding, check-in, journal, goals, trigger/coping log, "Seasons" milestones UI
- IndexedDB storage via `idb`, encrypted with AES-GCM (WebCrypto); key derived from user passphrase via Argon2id (hash-wasm)
- Export (JSON/PDF download) + crypto-shred delete (drop keys + wipe IndexedDB) — demoed live
- Service worker / Workbox: full offline shell, PWA install prompt, **home-screen "Crisis" shortcut** + `Ctrl/Cmd+Shift+H` keyboard shortcut
- Accessibility pass: large text, icon-driven check-ins, screen-reader labels, keyboard-navigable crisis path
- **Demo owner** — drives the app on stage

### 👤 Person B — "The Brain" (In-Browser RAG + Eval Harness)
All intelligence, built as a self-contained TS module A just imports.

- Corpus curation & ingest (DBT skills, SAMHSA/NIDA materials — cite real sources in README); offline chunking + embedding at build time
- transformers.js embeddings (all-MiniLM) running **in the browser**
- Small vector index persisted to IndexedDB (corpus is tiny — brute-force k-NN is fine, no native deps)
- Grounded generation: **WebLLM** (MLC, Phi-3-mini/Gemma-2B) for sealed mode; cloud LLM wrapper for assisted mode
- Citation rendering contract → returns `{suggestion_text, source_title, source_excerpt}`
- Crisis rule classifier (offline TS, recall-first) — fires a simple event A listens for
- **Eval harness**: 40 synthetic test items, one-command runner, three metrics (citation validity, crisis recall, guardrail adherence) — terminal output goes on a slide
- **Q&A lead** — owns the trust-boundary story, the Network-tab demo beat, and the numbers

### 👤 Person C — "The Chain & The Button" (Blockchain + Hardware)
All trust verification and the physical crisis layer.

- `ResourceRegistry` + `MilestoneAnchor` (stub) contracts — Solidity via Foundry/Anvil
- Badge component + revocation view (2 UI components defined with A in hour 1)
- In-browser reads via **ethers.js v6** JSON-RPC provider to local Anvil (no wallet extension needed for reads)
- **Anchor Button firmware** (ESP32) → **Web Bluetooth API** in-browser connection (WebSerial USB fallback); haptic breathing coach via vibration motor
- Voice-first crisis mode via **Web Speech API** (consumes B's classifier output)
- Backup demo video recording (Saturday night)
- **Pitch lead** — deck, roadmap slide, closing line

---

## 2. The 4 Contracts (Hour 1 freeze — non-negotiable)

| # | Interface | Producer → Consumer | Contract |
|---|---|---|---|
| 1 | `checkIn(mood, triggerCat, note?)` | A → B | JSON schema, 1 page — B consumes for RAG context |
| 2 | `getSupport(context)` → `{text, source, excerpt, crisis: bool}` | B → A | Return shape fixed in hour 1; A renders with citation |
| 3 | `crisisEvent(source)` → emergency screen | B/C → A | Simple event bus / callback; pathway always one action from any screen |
| 4 | `verifyResource(id)` → `{badge, signer, date, revoked}` | C → A | ethers.js read from local Anvil; A renders badge |

**Mock mode:** B ships `getSupport` with fixture responses by hour 8 so A can build all UI against it before the real engine exists. C's contract has a mock provider mode too.

---

## 3. Parallel Timeline (36 Hours)

| Hours | A — Vault | B — Brain | C — Chain & Button |
|---|---|---|---|
| 0–1 | **Contract freeze meeting** (all 3): lock schemas, repo structure, browser choice, HTTPS deployment target | — | — |
| 1–8 | Onboarding, IndexedDB + WebCrypto encrypted store, check-in, journal, trigger log; service worker offline shell | Corpus ingest + offline embeddings; mock `getSupport` | `ResourceRegistry` contract + Foundry tests |
| 8–16 | Goals, Seasons milestones, export/crypto-shred | In-browser retrieval + WebLLM generation + citation renderer + eval harness | Badge component, revocation view, ethers.js → Anvil integration |
| 16–21 | Integrate B's `getSupport` (citations render); PWA install + crisis shortcut | Integrate crisis classifier into check-in flow | ESP32 firmware + Web Bluetooth connection in-browser |
| 21–26 | Crisis screen + one-action pathway + trusted contact | Red-team own guardrails (try to force diagnoses — fix breaks); final harness run | Voice mode (Web Speech) + WebSerial/software fallback |
| 26–30 | Accessibility + polish | Keep harness green | Full hardware run-through, record backup video |
| 30–32 | **Feature freeze** — bug fixes only, all three | | |
| 32–34 | Deck together: A demos, C presents, B handles Q&A | | |
| 34–36 | 5 timed rehearsals (target ±10s), role split final | | |

**Integration syncs:** two hard merge windows only — hour 16 and hour 26. Between them: talk freely, don't refactor each other's code.

---

## 4. The 3 Anti-Failure Rules

1. **Hour-1 contract freeze.** The moment someone says "I'll just change the return shape," you've lost 3 hours.
2. **B never blocks A.** Mock fixtures exist by hour 8; real engine swaps in behind the same interface.
3. **Integration windows, not constant merging.** Two hard syncs (hour 16, hour 26). Async chat otherwise.

**Web-specific contingency:** if Web Bluetooth misbehaves at hour 28, C falls back to WebSerial (wired) or the software crisis shortcut, and moves to help A polish. Tier 0 survives without the button; the backup video covers the hardware moment. If WebLLM is too slow on the demo machine, sealed-mode suggestions use a curated rule + template layer over the retrieval results (still cited, still offline) — the citation contract doesn't change.

---

## 5. Tier Reminder

- **Tier 0 (must work):** deliverables 1–10 core, RAG citations, on-chain registry badges, eval harness, offline crisis path, export/delete.
- **Tier 1 (if Tier 0 green by hour 26):** Anchor Button, voice mode, Privacy Receipts.
- **Tier 2 (roadmap slide only):** Merkle milestone proofs, Relapse Radar, Decoy PIN, Dead Man's Switch, Sponsor-in-the-loop.

**At hour 30, freeze.** Hours 30–36 are polish, seed data, and rehearsal. Sleep beats one more feature.

---

## 6. Definition of Done (per person, hour 26 check)

| Person | Done means |
|---|---|
| A | Full Tier-0 flows work end-to-end in Chrome, offline (airplane mode), installable PWA, accessibility pass complete |
| B | `getSupport` returns cited, guardrailed responses; eval harness prints 3 metrics; crisis recall = 100% on test set |
| C | Registry deploys to Anvil in one command; badges + revocation render; button fires crisis event over Web Bluetooth (or fallback verified) |

---

## 7. Demo machine checklist (Friday night, owner: C)

- [ ] Chrome/Edge installed, all other tabs closed
- [ ] App deployed on HTTPS (or localhost build ready)
- [ ] Web Bluetooth permission pre-granted; button pre-paired
- [ ] WebSerial fallback cable ready
- [ ] Airplane-mode segment rehearsed (Wi-Fi toggle)
- [ ] Backup video recorded and playable offline
- [ ] Seed data loaded; DevTools Network tab open on a hotkey

---

*Clear Mind. Clean Code.*
