# ANCHOR — Anonymous Recovery Companion (Web App)
### Privacy-First Recovery Support with Verifiable Trust — Backendless PWA
**ByteQuest Hackathon · Track A — Tech for Recovery · Problem 05**

> *"Your journey is yours alone — verified help, honest encouragement, and crisis support that works when you can't think clearly."*

---

## 0. What changed from the mobile-app version, and why

We pivoted from React Native mobile to a **web app** — and this is not a downgrade. It makes the privacy story *stronger*:

1. **Backendless architecture.** There is no server, no account, no sync. The database **is the browser** (IndexedDB, encrypted client-side via WebCrypto). When we say "your data never leaves your device," a web app can mean it literally: *there is no server to breach.* This turns the strongest pitch line from a claim into an architectural fact.
2. **Offline = PWA, not a platform feature.** Service worker + app manifest gives us install-to-homescreen, full offline mode, and a home-screen crisis shortcut — no app store, no review process, works on any OS with a browser.
3. **Hardware without an app.** The ESP32 Anchor Button connects to the browser natively via the **Web Bluetooth API** (with WebSerial as fallback). No companion app install, no pairing dances.
4. **Voice for free.** Web Speech API (SpeechRecognition + SpeechSynthesis) gives voice-first crisis mode with zero ML ops.

Everything below assumes a team of 3–5 and a hard 36 hours.

---

## 1. The one-sentence pitch

**ANCHOR is a recovery web app with no server and no account — the private parts are cryptographically private (they never leave your browser), the public parts are cryptographically verified (on-chain signed resources), and the crisis path works with no network, no login, and no fine motor control.**

Say it in the first 15 seconds of the demo and again in the last 15.

### The three-layer trust architecture

| Layer | The user's fear | Our answer |
| --- | --- | --- |
| **Private Core** | "Someone will read my journal" | Backendless PWA: data encrypted in-browser with WebCrypto, user-held key, crypto-shred delete |
| **Verified Ring** | "Is this helpline real? Is this advice made up?" | On-chain signed resource registry + RAG with mandatory citations |
| **Emergency Surface** | "In crisis I can't navigate an app" | Physical button (Web Bluetooth) + offline crisis path + voice mode + home-screen shortcut |

We turned the track's ethical guidelines — privacy by design, no diagnosis, verified sources — **into architecture instead of a disclaimer**. That is the line judges will remember.

---

## 2. Blockchain — verifiable trust, zero user data

**Rule we never break:** no journal content, no identity, no check-in on-chain.

### 2.1 Verified Resource Registry *(this is the real use — build it)*

An on-chain record per support resource:

```
resource_hash | verifying_org | license_ref | verified_at | revoked
```

- Support organisations sign with their wallet. Updates and **revocations** are public and attributable — *who changed it, when*.
- UI badge: ✅ *"On-chain verified · signed by [Org] · verified [date]"*, tappable to show the signature and block.
- **The killer sub-feature:** extend it to **counsellor credentials** (license hash + issuer signature). "Fake therapist" and "fake rehab centre" are real, documented scam vectors preying on people in recovery. This is a problem blockchain is actually *good* at, and almost no team will frame it this way.

### 2.2 Milestone proofs — privacy-preserving by design

- Milestones are hashed **with a user-held random salt** and accumulated into a **local Merkle tree** (in-browser).
- Only on explicit user action is a **single root** published — one transaction covering the whole history, revealing nothing about count or timing.
- To prove "I have 30 continuous days" to a sponsor, the user reveals a **Merkle path** for the specific leaves they choose. The sponsor verifies against the public root. Nothing else is exposed, and nothing can be backdated.
- Default is **off**. Onboarding never suggests it.

**Rehearsed Q&A answer:** *"We assume a hostile observer with the full chain history. Our design leaks nothing to them — not content, not timing, not count. One root, salted leaves, selective disclosure."*

### 2.3 Stack

Solidity + Foundry on a local Anvil testnet; the web app reads it directly via **ethers.js v6** with a JSON-RPC provider (no wallet extension needed for reads; the admin/override demo key lives in an env file). Two contracts, `ResourceRegistry` and `MilestoneAnchor`. Do not deploy to a real testnet — faucets die and RPCs rate-limit mid-demo.

---

## 3. RAG — grounded, non-diagnostic support *(the technical centrepiece)*

### 3.1 The trust boundary — state it explicitly

This is the slide that wins the Q&A. Draw it:

| Data | Where it lives | Leaves the browser? |
| --- | --- | --- |
| Journal text, check-ins, goals, triggers | IndexedDB, AES-GCM encrypted, key from user passphrase (Argon2id) | **Never** |
| Embeddings of user entries | In-browser vector index | **Never** |
| Coping-strategy corpus | Bundled with the app + cached by service worker | N/A (ships offline) |
| Generation | See below | Depends on mode — user's choice, shown in UI |

**Two generation modes, user-selectable, with a persistent indicator in the header:**

- **Sealed mode (default):** a small local LLM runs **in the browser** via WebLLM (MLC) — Phi-3-mini / Gemma-2B-class, WebGPU or WASM. Zero network calls. **The crisis path always uses this mode.**
- **Assisted mode (opt-in):** a cloud LLM generates, but the prompt is assembled from **retrieved corpus passages plus a structured, non-identifying summary** (`{mood: low, trigger_category: social, days_since_slip: 3}`) — never raw journal text. The UI shows exactly what would be sent, before it is sent.

Being able to say *"here are the two modes, here is the exact payload, here is the toggle"* is worth more than any feature.

### 3.2 The pipeline

```
check-in → in-browser embed (transformers.js, all-MiniLM) → retrieve top-k
→ grounded generation → citation render → crisis check
```

- **Corpus:** DBT distress-tolerance and grounding skills, breathing protocols, relapse-prevention literature (SAMHSA/NIDA public materials), verified resource docs. Chunked and embedded offline at build time; shipped with the app. **Cite the actual sources in your README** — judges check.
- **Constraint:** the model may only assert what appears in retrieved passages. Every suggestion renders with a tappable citation. Non-diagnostic, non-judgmental, no medical claims — enforced in the system prompt *and* verified by the eval harness.
- **Reflection mode:** grounded in the user's own past entries — *"Last time this feeling came up, the 5-4-3-2-1 exercise helped. Want to try it again?"*

### 3.3 The eval harness — your unfair advantage

**Build this. Almost no hackathon team does.**

A 40-item synthetic test set with a one-command runner producing three numbers:

| Metric | What it proves | Target |
| --- | --- | --- |
| **Citation validity** | Every claim traces to a retrieved passage | 100% |
| **Crisis recall** | Crisis-indicating inputs correctly escalate | 100% — false negatives are the only unacceptable error |
| **Guardrail adherence** | Zero diagnoses, zero medical claims, zero shame language | 100% |

Show the terminal output on a slide. *"We measured our safety guardrails, here are the numbers, here are the two cases we still fail"* is more credible than any claim of perfection. **Naming your remaining failure cases is a strength signal.**

---

## 4. Crisis layer — hardware and the emergency pathway

### 4.1 The Anchor Button (~₹1,200 / ~$15 — ESP32 + tactile button + vibration motor)

- Connects to the web app via the **Web Bluetooth API** — browser-native, no app install, no OS pairing. (Fallback: **WebSerial** over USB, wired and tested.)
- **Long-press = silent crisis signal.** The PWA opens the emergency pathway, the trusted contact receives the pre-agreed message, the nearest verified helpline appears.
- **Why physical, not a gimmick:** acute distress degrades fine motor control and executive function. Unlocking a phone, finding an app, and navigating a menu is a chain of failures at exactly the wrong moment. One button is one action. Say this out loud in the demo.
- **Second job:** the vibration motor is a **haptic breathing coach** (4-7-8 pattern), so the device earns its place daily.
- **Key demo line:** *"Bluetooth isn't the internet. Even with Wi-Fi off, the button works."* — the airplane-mode crisis segment just got undeniable.

### 4.2 Software crisis entry points (web equivalents of lock-screen access)

- **PWA home-screen shortcut:** installing the app creates a "Crisis" shortcut that opens the pathway directly.
- **Keyboard shortcut:** `Ctrl/Cmd + Shift + H` from anywhere in the app.
- The emergency pathway is **always reachable in one action from any screen**, regardless of detection.

### 4.3 Crisis detection — designed for the right failure

- A **local keyword + rule classifier** runs offline, first, always (plain TS, in-browser). Tuned deliberately for **high recall over precision** — a false alarm costs a gentle "are you okay?", a false negative costs everything.
- The LLM **never gates escalation**. It can only *add* context after the rule fires.

### 4.4 Demo-day survival plan

- Web Bluetooth requires **Chrome/Edge** and a **secure context (HTTPS or localhost)** — the demo machine is decided on Friday, not on stage.
- Pre-pair and pre-authorize before you present; never pair on stage.
- **WebSerial fallback** wired and tested.
- **Software fallback:** the home-screen shortcut / keyboard shortcut does the identical thing. Practice switching without commenting on it.
- Record a **backup video** of the full hardware moment on Saturday night.

---

## 5. Scope triage — the actual build plan

### Tier 0 — must work, no exceptions *(this alone wins or places)*

1. Encrypted local check-in, journal, goal setup, trigger/coping log *(deliverables 1–5)* — IndexedDB + WebCrypto, works fully offline via service worker
2. RAG support engine with visible citations *(deliverable 8)*
3. `ResourceRegistry` + verification badges in UI *(deliverable 6)*
4. Emergency pathway: one-action access, offline, trusted contact *(deliverables 7, 9)*
5. Export (JSON/PDF download) + crypto-shred delete, demoed live *(deliverable 10)*
6. Seasons-based milestones *(deliverable 3)*
7. The eval harness

### Tier 1 — build if Tier 0 is done by hour 26

8. Anchor Button over Web Bluetooth + haptic breathing
9. Voice-first crisis mode (Web Speech API — eyes-closed, hands-free; strong accessibility story)
10. Privacy Receipts (in-app transparency log: every data type, where it lives, what has never left the browser)

### Tier 2 — mention on a "what's next" slide, do not build

Merkle milestone proofs (describe the design, ship the contract stub), Relapse Radar, Decoy PIN, Dead Man's Switch, Sponsor-in-the-loop, multilingual packs.

**Discipline rule:** a feature described crisply on a roadmap slide scores nearly as well as one that is half-built and broken — and infinitely better than one that crashes on stage. **At hour 30, freeze. Hours 30–36 are polish, seed data, and rehearsal.**

**Framing notes for Tier 2 items:**

- **Relapse Radar** — never call it prediction: *"it reflects the user's own patterns back to them; it never scores, labels, or diagnoses."*
- **Decoy PIN** — frame around the real scenario: a controlling partner or unsafe household.
- **Dead Man's Switch** — call it "Silent Check-In," always opt-in, always revocable.

---

## 6. Design principles that differentiate the product

- **Seasons, not streaks.** Milestones are chapters ("The Grounding Season"), never ranked, never compared. A slip resets the *narrative, not the data*: *"Day 1 of a new chapter — your history is still yours."* Streak counters manufacture shame, and shame drives relapse. A deliberate clinical choice — **say that.**
- **Slips are data, not failure.** Every message after a reported slip must be curious rather than corrective.
- **Offline-first everything.** Service worker caches the entire app; check-ins, journal, retrieval over the bundled corpus, breathing coach, crisis resources all work in airplane mode. Resource packs ship offline with their on-chain verification hashes.
- **No account. No server.** This is the headline: *"We couldn't sell your data if we wanted to — we never see it."*
- **Accessibility as a first-class feature.** Large text, icon-driven check-ins, simplified-language mode, full screen-reader labels, keyboard-navigable crisis path. Two hours of work, explicitly rewarded by the guidelines.

---

## 7. Deliverable map

| # | Deliverable | Implementation | Tier |
| --- | --- | --- | --- |
| 1 | Private goal setup | Local-first onboarding in-browser; key derived from user passphrase (Argon2id via WASM) | 0 |
| 2 | Daily check-in | 30-second flow, non-diagnostic labels, feeds RAG context | 0 |
| 3 | Milestone tracker | Seasons; optional Merkle proof (design only) | 0 / 2 |
| 4 | Trigger & coping log | Structured; triggers become retrieval keys | 0 |
| 5 | Coping-plan builder | Assembled from cited techniques; editable, exportable | 0 |
| 6 | Verified shortcuts | On-chain registry read via ethers.js; badges, verification dates | 0 |
| 7 | Trusted contact / support plan | Opt-in; message templates drafted *with* the user (prefilled `mailto:`/SMS links) | 0 |
| 8 | Relapse-sensitive messaging | Grounded generation + tone guardrails + citations | 0 |
| 9 | Emergency pathway | Offline rule classifier + one-action access + button (Web BT) + voice (Web Speech) | 0 / 1 |
| 10 | Privacy settings, export, delete | JSON/PDF download; one-tap crypto-shred (drop keys + wipe IndexedDB) | 0 |

---

## 8. Stack (Web)

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + Vite, PWA (Workbox service worker) | Fast iteration; installable; full offline; any OS |
| Storage | IndexedDB (via idb), AES-GCM via WebCrypto, Argon2id via hash-wasm | Encrypted in-browser; key never leaves the device; crypto-shred = drop key + wipe DB |
| Embeddings | transformers.js (all-MiniLM), in-browser | Never leaves the device; WebGPU/WASM |
| Vector store | Small custom index persisted to IndexedDB (corpus is small — brute-force k-NN is fine) | No server, no native deps |
| Generation | WebLLM (MLC, Phi-3-mini/Gemma-2B) sealed mode · cloud LLM assisted mode (opt-in) | Explicit trust boundary; crisis never depends on network |
| Blockchain | Solidity + Foundry + local Anvil; ethers.js v6 in-browser | Deterministic demo; direct JSON-RPC reads, no wallet extension needed |
| Hardware | ESP32 + button + vibration motor → Web Bluetooth (WebSerial fallback) | ~$15; no companion app install |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) | Browser-native, offline-capable synthesis |
| Crisis | Offline TS rule classifier; LLM never gates escalation | No network on life-safety paths |
| Hosting | Static file hosting only | **No backend exists to breach** |

**Pick the browser on Friday.** The demo machine runs Chrome or Edge (Web Bluetooth + WebGPU), verified end-to-end. Do not discover a Safari limitation on stage.

**Secure context note:** WebCrypto and Web Bluetooth require HTTPS or localhost. Deploy behind HTTPS from hour one; develop on localhost.

---

## 9. The demo — 3 minutes, scripted, rehearsed five times

| Time | Beat | Line to land |
| --- | --- | --- |
| 0:00–0:15 | **The sentence** (Section 1) + the one-line problem | — |
| 0:15–0:45 | Onboarding + a check-in | *"No account. No server. Nothing you just saw touched a network — the database is your browser."* |
| 0:45–1:15 | Open DevTools → Network tab → do a full journal flow → **zero requests** | *"Watch the network tab. That silence is the architecture."* ← web-app superpower |
| 1:15–1:45 | Grounded suggestion with **visible citation**; open a helpline → **on-chain badge** + show a **revoked** resource greyed out | *"Every suggestion cites a real source. Resources are signed and revocable — scams can't fake this."* |
| 1:45–2:25 | **Airplane mode ON**, press the Anchor Button → pathway opens, trusted-contact message fires, voice mode activates | *"No Wi-Fi. No login. One button."* ← **emotional peak** |
| 2:25–2:40 | One-tap delete; reload the app to show it truly gone | *"Privacy isn't a setting. It's the architecture."* |
| 2:40–3:00 | Eval-harness numbers on screen + close | — |

**Closing line:** *"We didn't build a medical tool. We built trust infrastructure for the hardest journey someone takes — and there isn't even a server between you and your own data."*

**Demo rules:** seed realistic data beforehand; airplane mode stays on for the whole crisis segment; one person talks, one drives; backup video ready; rehearse with a timer until ±10 seconds.

---

## 10. Judge Q&A — rehearse these verbatim

**"Isn't the blockchain just a database?"** For the registry, no: the value is *multi-party attribution without a trusted host*. No single org can silently alter or un-revoke another org's verification, and the audit trail survives the issuer going offline. For milestone proofs, it's a public timestamp we can't forge or backdate — which is the whole point of a proof.

**"You say data never leaves the device — prove it."** *(The web app makes this the easiest question of the day.)* Open DevTools → Network tab → use the entire app. Zero requests in sealed mode. There is no API endpoint to intercept — there is no server.

**"What if I clear my browser or switch devices?"** Honest answer: data lives in one browser on one device, by design. Cross-device sync would require a server, which would break the core promise. Export exists for intentional portability. Name this trade-off before they do — it reads as conviction.

**"Is this medical advice?"** No. Non-diagnostic by construction: the model may only surface techniques present in a curated corpus of published coping materials, each shown with its source. No assessment, no scoring, no labels. Crisis paths route to human helplines, never to us.

**"What if the crisis classifier misses someone?"** It's not a gatekeeper. Emergency access is always one action from any screen, and we tuned for recall over precision. Here are our recall numbers and the case we still miss.

**"Who did you talk to?"** Have an answer. **Spend one hour on Friday** messaging a recovery counsellor, a peer-support worker, or someone with lived experience. One real quote in your deck — *"a counsellor told us the streak counter is the first thing she asks clients to turn off"* — outperforms any feature.

**"What would you not build?"** Answer immediately: no social feed, no leaderboards, no engagement notifications, no ad model, no data sale, no account, no backend. Knowing what you refuse to build is a maturity signal.

**"Why a web app instead of native?"** Because the privacy claim is verifiable in a web app: no server, no account, inspectable network tab. A native app asks users to trust binaries; a backendless PWA lets them watch the network and see nothing.

---

## 11. Timeline (team view — see implementation_plan.md for per-person breakdown)

| Hours | Focus |
| --- | --- |
| 0–1 | Lock the stack, browser choice (Chrome/Edge), and the 4 contracts. Assign owners: app / RAG / chain+hardware. No debates after hour one. |
| 1–8 | Encrypted store, onboarding, check-in, journal, trigger log *(1–5)*; service worker offline shell |
| 8–16 | RAG engine, corpus ingest, citation rendering *(8)* + **eval harness** |
| 16–21 | `ResourceRegistry`, badges, revocation view *(6)* |
| 21–26 | Crisis mode, emergency pathway, trusted contact, export/delete *(7, 9, 10)* |
| 26–30 | **Tier 1 only if Tier 0 is green:** Anchor Button (Web BT), voice mode, Privacy Receipts |
| 30–32 | **Feature freeze.** Bug fixes, accessibility pass, seed data |
| 32–34 | Deck, roadmap slide, record backup video |
| 34–36 | Rehearse five times with a timer. Sleep beats one more feature. |

---

## 12. Risk notes for the judges' Q&A

- The model is advisory-only, grounded, and source-cited; every crisis path works offline without it.
- The chain holds hashes and signatures only. Milestone proofs are salted and selectively disclosed — even timing and count stay private.
- Hardware is an accessibility choice for acute distress, not a medical sensor. No physiological claims.
- Web Bluetooth is Chrome/Edge-only; the demo machine is locked Friday, with WebSerial and software-shortcut fallbacks tested.
- Data is device-local by design (per-browser). We name this trade-off ourselves — it is the price of having no server.
- Synthetic data throughout the hackathon per the guidelines; a production registry would be seeded by partner organisations under a signed-attestation process.
- Known limitations we name before you do: the crisis classifier is English-only today; sealed-mode generation quality trails assisted mode; the registry's trust bottoms out in whether the signing organisation is honest — we verify the signature, not the institution.

---

*Clear Mind. Clean Code.*
