# ⚓ ANCHOR — Anonymous Recovery Companion

> **Privacy-First Recovery Support with Verifiable Trust**  
> *ByteQuest Hackathon · Track A — Tech for Recovery · Problem 05*

---

## 🌟 Overview

**ANCHOR** is a privacy-first, backendless Progressive Web Application (PWA) designed to provide continuous support, crisis intervention, and grounded guidance for individuals in recovery.

In traditional recovery platforms, sensitive journals and health metrics are vulnerable to data breaches and server logging. ANCHOR redefines trust by enforcing a **zero-server, zero-account architecture**:
- **Private Core**: Your data is encrypted locally in your browser using **WebCrypto (AES-GCM)** and **Argon2id WASM** key derivation. It never touches a remote server.
- **Verifiable Ring**: Support helplines and resources are cryptographically authenticated via a **Solidity Smart Contract (`ResourceRegistry.sol`)**.
- **Emergency Surface**: Rapid offline crisis intervention triggered via an **ESP32 physical Anchor Button** over Web Bluetooth API, keyboard shortcuts (`Ctrl/Cmd + Shift + H`), or PWA home-screen shortcuts.

---

## 📸 Screenshots & App Walkthrough

| 1. Dashboard Overview | 2. On-Chain Verified Resources |
| :---: | :---: |
| ![Dashboard Overview](<ss/Screenshot from 2026-09-19 17-02-05.png>) | ![On-Chain Verified Resources](<ss/Screenshot from 2026-09-19 17-03-37.png>) |
| *Personalized reflection space with encrypted storage & daily check-in prompt.* | *On-chain verified helpline registry backed by Solidity smart contract.* |

| 3. Emergency Crisis Pathway | 4. Multilingual AI Companion |
| :---: | :---: |
| ![Emergency Crisis Pathway](<ss/Screenshot from 2026-09-19 17-04-45.png>) | ![Multilingual AI Companion](<ss/Screenshot from 2026-09-19 17-20-37.png>) |
| *One-action offline emergency pathway accessible via hardware button & shortcuts.* | *Grounded AI Companion offering multilingual distress support and local helplines.* |

| 5. Triggers & Coping Analytics |
| :---: |
| ![Triggers & Coping Analytics](<ss/Screenshot from 2026-09-19 17-17-24.png>) |
| *Pattern recognition tracking top distress triggers and effective coping strategies.* |

---

## 🏗️ Architecture & Key Features

```
                         +-----------------------------------+
                         |         ANCHOR FRONTEND           |
                         |  (React 19 + Vite PWA + Tailwind) |
                         +-----------------+-----------------+
                                           |
         +---------------------------------+---------------------------------+
         |                                 |                                 |
         v                                 v                                 v
+------------------+             +-------------------+             +-------------------+
|  PRIVATE CORE    |             |  VERIFIED RING    |             | EMERGENCY SURFACE |
| Encrypted Vault  |             |  Blockchain Read  |             | Hardware & RAG    |
| - IndexedDB      |             | - Solidity Smart  |             | - Web Bluetooth   |
| - AES-GCM        |             |   Contract        |             |   ESP32 Button    |
| - Argon2id WASM  |             | - Ethers.js v6    |             | - In-Browser RAG  |
| - Crypto-Shred   |             | - On-Chain Badges |             | - Local Classifier|
+------------------+             +-------------------+             +-------------------+
```

### 1. 🔒 Private Core (Backendless PWA)
- **Local Storage**: Journal entries, daily check-ins, recovery goals, and coping plans are stored strictly inside the browser via IndexedDB (`idb`).
- **Cryptographic Encryption**: Encrypted client-side using `WebCrypto` (AES-GCM) with key derivation powered by Argon2id (`hash-wasm`).
- **Crypto-Shred Deletion**: Instant and permanent removal of encryption keys and local databases on command.

### 2. 🛡️ Verifiable Ring (On-Chain Resource Registry)
- **Solidity Smart Contract**: [ResourceRegistry.sol](file:///home/fang/Downloads/Bytequest-hackathon/anchor-contracts/contracts/ResourceRegistry.sol) maintains an on-chain registry of verified helpline organization hashes and URLs.
- **Verification Badges**: Live cryptographic badges inside the UI prove resource authenticity, protecting users from scam helplines and fake recovery services.

### 3. 🚨 Emergency Surface & Physical Anchor Button
- **Hardware Integration**: Connects natively to an ESP32 micro-controller via the **Web Bluetooth API** (`@types/web-bluetooth`) without requiring an app store download or companion software.
- **Zero-Latency Escalation**: Long-pressing the physical button or invoking `Ctrl/Cmd + Shift + H` opens the crisis pathway immediately.
- **Haptic Breathing Coach**: Built-in 4-7-8 tactile breathing exercises on the hardware device.

### 4. 🧠 Grounded Local RAG Engine & Evaluation Harness
- **In-Browser Vector Search**: Embeds and indexes DBT distress-tolerance guidelines and SAMHSA/NIDA recovery literature locally using `@xenova/transformers` (`all-MiniLM`).
- **Grounded AI Guardrails**: Strict citation enforcement ensures non-diagnostic, non-medical advice with mandatory source attribution.
- **Eval Harness**: Built-in test harness ([run-eval.ts](file:///home/fang/Downloads/Bytequest-hackathon/anchor-app/scripts/run-eval.ts)) measuring citation validity, 100% crisis recall, and zero-shame safety compliance.

### 5. 🌿 Seasons, Not Streaks
- Recovery is tracked through **narrative seasons** ("The Grounding Season", "Reflection Season") rather than brittle day counts. Slips reset the narrative, not your personal data, mitigating shame-driven relapse triggers.

---

## 📂 Project Structure

```
Bytequest-hackathon/
├── anchor-app/                 # Frontend Web Application (React 19 + Vite PWA)
│   ├── src/
│   │   ├── brain/              # Local RAG, Vector Index, Crisis Classifier & Contracts
│   │   ├── vault/              # In-browser WebCrypto AES-GCM + IndexedDB Database
│   │   ├── hardware/           # Web Bluetooth API driver for ESP32 Anchor Button
│   │   ├── pages/              # UI Pages (Dashboard, CheckIn, Crisis, Journal, etc.)
│   │   └── context/            # VaultContext authentication state provider
│   ├── scripts/
│   │   ├── ingest.ts           # RAG Corpus chunk ingestion script
│   │   └── run-eval.ts         # Safety & Recall Evaluation Harness runner
│   ├── package.json
│   └── vite.config.ts
│
├── anchor-contracts/           # Ethereum / Hardhat Smart Contracts
│   ├── contracts/
│   │   └── ResourceRegistry.sol # On-chain helpline verification registry
│   ├── scripts/
│   │   └── deploy.js           # Hardhat deployment script
│   └── hardhat.config.js
│
├── hardware_button/            # ESP32 Hardware Firmware Configuration
│   ├── platformio.ini          # PlatformIO config (NimBLE-Arduino BLE library)
│   └── include/
│
└── Anchor_Recovery_Companion_Solution (2).md # Comprehensive Architectural Proposal
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **yarn** / **pnpm**
- **Browser**: Chrome / Edge (required for Web Bluetooth API testing)

---

### 1. 📱 Running the Web Application (`anchor-app`)

```bash
# Navigate to the app directory
cd anchor-app

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Running the Safety & RAG Eval Harness:
```bash
# Execute synthetic eval runner for guardrails and crisis recall
npm run eval
```

---

### 2. 📜 Smart Contracts (`anchor-contracts`)

```bash
# Navigate to contracts directory
cd anchor-contracts

# Install Hardhat dependencies
npm install

# Compile Solidity smart contracts
npx hardhat compile

# Run local Hardhat node (optional)
npx hardhat node

# Deploy contract to local node
npx hardhat run scripts/deploy.js --network localhost
```

---

### 3. 🔌 Hardware Button (`hardware_button`)

The physical Anchor Button operates on an **ESP32** microcontroller using **PlatformIO**:

1. Open `hardware_button` in VS Code with the **PlatformIO** extension.
2. Connect your ESP32 board via USB.
3. Build & Flash the firmware:
   ```bash
   platformio run --target upload
   ```
4. Pair via the Web App's **Settings** or **Crisis** screen using Web Bluetooth.

---

## 🧪 Safety & Evaluation Metrics

Our local RAG pipeline is continuously evaluated via `npm run eval`:

| Metric | Target | Description |
| :--- | :---: | :--- |
| **Crisis Recall** | `100%` | Ensures all distress inputs escalate to crisis pathways immediately. |
| **Citation Validity** | `100%` | Verifies assertions trace back to retrieved SAMHSA/DBT literature. |
| **Guardrail Adherence** | `100%` | Guarantees zero medical diagnosis, zero prescription claims, and zero shame language. |

---

## 📄 License

This project was built for the **ByteQuest Hackathon**. Distributed under the MIT License.
