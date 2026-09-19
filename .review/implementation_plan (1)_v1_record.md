# 批阅记录

- **源文件**：implementation_plan (1).md
- **源文件路径**：/home/fang/Downloads/Bytequest-hackathon/implementation_plan (1).md
- **源文件版本**：未知
- **批阅时间**：20260919_1311
- **批阅版本**：v1
- **批注数量**：0
  - 评论：0
  - 删除：0
  - 后插：0
  - 前插：0

---

## 操作指令

> 指令已按**从后往前**排列（倒序），请严格按照顺序从上到下逐条执行。
> 每条指令提供了「文本锚点」用于精确定位，请优先通过锚点文本匹配来确认目标位置，blockIndex 仅作辅助参考。

---

## 原始数据（JSON）

> 如需精确操作，可使用以下 JSON 数据。其中 `blockIndex` 是基于空行分割的块索引（从0开始），`startOffset` 是目标文本在块内的字符偏移量（从0开始），可用于区分同一块内的重复文本。

```json
{
  "fileName": "implementation_plan (1).md",
  "docVersion": "未知",
  "reviewVersion": 1,
  "annotationCount": 0,
  "rawMarkdown": "# ANCHOR — Implementation Plan (3-Person Team)\n### ByteQuest Hackathon · Track A — Tech for Recovery · Problem 05 · 36 Hours\n\n> Core rule: **define the shared contracts in the first hour, then don't touch them.**\n> The goal is clean interfaces so nobody blocks anybody else.\n\n---\n\n## 1. Roles\n\n### 👤 Person A — \"The Vault\" (App & Privacy Core)\nEverything the user touches and everything that stores data.\n\n- React Native app (Expo dev build): onboarding, check-in, journal, goals, trigger/coping log\n- SQLCipher encrypted storage + passphrase key derivation (Argon2id)\n- Export (JSON/PDF) + crypto-shred delete (demoed live)\n- \"Seasons, not streaks\" milestones UI\n- Accessibility pass: large text, icon-driven check-ins, screen-reader labels\n- **Demo owner** — drives the app on stage\n\n### 👤 Person B — \"The Brain\" (RAG Engine + Eval Harness)\nAll intelligence, built as a self-contained module A just imports.\n\n- Corpus curation & ingest (DBT skills, SAMHSA/NIDA materials — cite real sources in README)\n- On-device embeddings (all-MiniLM) + local vector index\n- Grounded generation pipeline: local small model (sealed mode, default) + cloud LLM (assisted, opt-in)\n- Citation rendering contract → returns `{suggestion_text, source_title, source_excerpt}`\n- Crisis rule classifier (offline, recall-first) — fires a simple event A listens for\n- **Eval harness**: 40 synthetic test items, one-command runner, three metrics (citation validity, crisis recall, guardrail adherence) — terminal output goes on a slide\n- **Q&A lead** — owns the trust-boundary story and the numbers\n\n### 👤 Person C — \"The Chain & The Button\" (Blockchain + Hardware)\nAll trust verification and the physical crisis layer.\n\n- `ResourceRegistry` + `MilestoneAnchor` (stub) contracts — Solidity via Foundry/Anvil\n- Verification badge component + revocation view (2 UI components defined with A in hour 1)\n- Anchor Button firmware (ESP32 + BLE), pairing, panic-tile software fallback\n- Voice mode in the crisis screen (consumes B's classifier output)\n- Backup demo video recording (Saturday night)\n- **Pitch lead** — deck, roadmap slide, closing line\n\n---\n\n## 2. The 4 Contracts (Hour 1 freeze — non-negotiable)\n\n| # | Interface | Producer → Consumer | Contract |\n|---|---|---|---|\n| 1 | `checkIn(mood, triggerCat, note?)` | A → B | JSON schema, 1 page — B consumes for RAG context |\n| 2 | `getSupport(context)` → `{text, source, excerpt, crisis: bool}` | B → A | Return shape fixed in hour 1; A renders with citation |\n| 3 | `crisisEvent(source)` → emergency screen | B/C → A | Simple event bus / callback; pathway always 2 taps max |\n| 4 | `verifyResource(id)` → `{badge, signer, date, revoked}` | C → A | Read from local Anvil via RPC; A renders badge |\n\n**Mock mode:** B ships `getSupport` with fixture responses by hour 8 so A can build all UI against it before the real engine exists. C's contract likewise has a mock RPC mode.\n\n---\n\n## 3. Parallel Timeline (36 Hours)\n\n| Hours | A — Vault | B — Brain | C — Chain & Button |\n|---|---|---|---|\n| 0–1 | **Contract freeze meeting** (all 3): lock schemas, repo structure, naming | — | — |\n| 1–8 | Onboarding, encrypted check-in, journal, trigger log | Corpus ingest, embeddings, local vector index, mock `getSupport` | `ResourceRegistry` contract + Foundry tests |\n| 8–16 | Goals, Seasons milestones, export/delete | Grounded generation + citation renderer + eval harness | Badge component, revocation view, Anvil RPC integration |\n| 16–21 | Integrate B's `getSupport` (citations render) | Integrate crisis classifier into check-in flow | ESP32 firmware + BLE pairing |\n| 21–26 | Crisis screen + 2-tap pathway + trusted contact | Red-team own guardrails (try to force diagnoses — fix breaks) | Voice mode + panic tile fallback |\n| 26–30 | Accessibility + polish | Final eval-harness run → numbers for slide | Full hardware run-through, record backup video |\n| 30–32 | **Feature freeze** — bug fixes only, all three | | |\n| 32–34 | Deck together: A demos, C presents, B handles Q&A | | |\n| 34–36 | 5 timed rehearsals (target ±10s), role split final | | |\n\n**Integration syncs:** two hard merge windows only — hour 16 and hour 26. Between them: talk freely, don't refactor each other's code.\n\n---\n\n## 4. The 3 Anti-Failure Rules\n\n1. **Hour-1 contract freeze.** The moment someone says \"I'll just change the return shape,\" you've lost 3 hours.\n2. **B never blocks A.** Mock fixtures exist by hour 8; real engine swaps in behind the same interface.\n3. **Integration windows, not constant merging.** Two hard syncs (hour 16, hour 26). Async chat otherwise.\n\n**Contingency:** if hardware slips past hour 28, C drops the ESP32, keeps the panic tile + voice mode, and moves to help A polish. Tier 0 survives without the button; the backup video covers the hardware demo moment.\n\n---\n\n## 5. Tier Reminder (from solution doc)\n\n- **Tier 0 (must work):** deliverables 1–10 core, RAG citations, on-chain registry badges, eval harness, offline crisis path, export/delete.\n- **Tier 1 (if Tier 0 green by hour 26):** Anchor Button, voice mode, Privacy Receipts.\n- **Tier 2 (roadmap slide only):** Merkle milestone proofs, Relapse Radar, Decoy PIN, Dead Man's Switch, Sponsor-in-the-loop.\n\n**At hour 30, freeze.** Hours 30–36 are polish, seed data, and rehearsal. Sleep beats one more feature.\n\n---\n\n## 6. Definition of Done (per person, hour 26 check)\n\n| Person | Done means |\n|---|---|\n| A | Full Tier-0 flows work end-to-end on a real phone, offline-capable, accessibility pass complete |\n| B | `getSupport` returns cited, guardrailed responses; eval harness prints 3 metrics; crisis recall = 100% on test set |\n| C | Registry deploys to Anvil in one command; badges + revocation render; button fires crisis event (or fallback verified) |\n\n---\n\n*Clear Mind. Clean Code.*\n",
  "annotations": []
}
```