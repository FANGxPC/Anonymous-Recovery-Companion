/**
 * ANCHOR — Brain Module Contracts
 * ================================
 * These types are FROZEN after Hour 1. Do not modify.
 * Person A, B, and C all depend on these exact shapes.
 */

// ─── Contract 1: A → B (Check-in data) ──────────────────────────

/** Mood levels — ordered from best to worst */
export type Mood = 'great' | 'good' | 'okay' | 'low' | 'crisis';

/** Trigger categories for context */
export type TriggerCategory =
  | 'social'
  | 'stress'
  | 'craving'
  | 'emotional'
  | 'environmental'
  | 'physical'
  | 'financial'
  | 'relationship'
  | 'boredom'
  | 'other';

/** Data shape for a user check-in — Person A produces, Person B consumes */
export interface CheckInData {
  /** Current mood level */
  mood: Mood;
  /** Category of the trigger, if any */
  triggerCategory: TriggerCategory;
  /** Optional free-text note from the user */
  note?: string;
  /** Timestamp of the check-in (Date.now()) */
  timestamp: number;
}

// ─── Contract 2: B → A (Support response) ───────────────────────

/** The response shape returned by getSupport — Person B produces, Person A renders */
export interface SupportResponse {
  /** The supportive suggestion / coping strategy text */
  text: string;
  /** Source title the suggestion is grounded in (e.g., "DBT Distress Tolerance Manual") */
  source: string;
  /** Exact passage from the source that the suggestion is based on */
  excerpt: string;
  /** If true, Person A MUST show the emergency screen immediately */
  crisis: boolean;
}

// ─── Contract 3: B/C → A (Crisis event) ─────────────────────────

/** Where the crisis signal originated */
export type CrisisSource = 'classifier' | 'button' | 'voice' | 'manual';

/** Callback signature for crisis events — Person A subscribes, Person B/C fires */
export type CrisisCallback = (source: CrisisSource) => void;

// ─── Contract 4: C → A (Resource verification) ──────────────────

/** Verification result for an on-chain resource — Person C produces, Person A renders */
export interface ResourceVerification {
  /** The badge label (e.g., "Verified Helpline") */
  badge: string;
  /** The signing organization's identifier */
  signer: string;
  /** When the resource was verified (ISO date string) */
  date: string;
  /** Whether this resource has been revoked */
  revoked: boolean;
}

// ─── Corpus & Internal Types ─────────────────────────────────────

/** A single chunk from the curated corpus */
export interface CorpusChunk {
  /** Unique chunk identifier */
  id: string;
  /** The text content of the chunk */
  text: string;
  /** Title of the source material */
  sourceTitle: string;
  /** URL or reference for the source */
  sourceRef: string;
  /** Name of the specific technique described, if applicable */
  techniqueName?: string;
  /** Category for retrieval filtering */
  category: ChunkCategory;
}

/** Categories for corpus chunks */
export type ChunkCategory =
  | 'distress_tolerance'
  | 'grounding'
  | 'breathing'
  | 'relapse_prevention'
  | 'crisis_resources'
  | 'mindfulness'
  | 'emotion_regulation'
  | 'interpersonal'
  | 'self_care';

/** A search result from the vector index */
export interface SearchResult {
  /** Cosine similarity score (0–1) */
  score: number;
  /** The matched corpus chunk */
  chunk: CorpusChunk;
}

/** Eval harness results */
export interface EvalResults {
  citationValidity: {
    passed: number;
    total: number;
    failures: string[];
  };
  crisisRecall: {
    passed: number;
    total: number;
    failures: string[];
  };
  guardrailAdherence: {
    passed: number;
    total: number;
    failures: string[];
  };
  timestamp: number;
}

/** Generation mode — user-selectable */
export type GenerationMode = 'sealed' | 'assisted' | 'template';

// ─── Brain Module Public API ─────────────────────────────────────

/** The public interface that Person A imports and calls */
export interface BrainModule {
  /** Initialize models, load index, warm up. Call once on app start. */
  init(mode?: GenerationMode): Promise<void>;

  /** Get a grounded, cited support response for a check-in context */
  getSupport(context: CheckInData): Promise<SupportResponse>;

  /** Subscribe to crisis events */
  onCrisis(callback: CrisisCallback): void;

  /** Unsubscribe from crisis events */
  offCrisis(callback: CrisisCallback): void;

  /** Run the eval harness (dev/demo only) */
  runEval(): Promise<EvalResults>;

  /** Check if the module is initialized and ready */
  isReady(): boolean;

  /** Get the current generation mode */
  getMode(): GenerationMode;

  /** Switch generation mode at runtime */
  setMode(mode: GenerationMode): Promise<void>;
}
