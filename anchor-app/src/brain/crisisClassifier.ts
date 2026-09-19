/**
 * ANCHOR — Crisis Classifier
 * ============================
 * Offline, rule-based crisis detection. Runs in plain TypeScript.
 * NO LLM dependency. NO network dependency.
 *
 * Design principle: HIGH RECALL over precision.
 * - A false alarm costs a gentle "are you okay?"
 * - A false negative costs everything.
 * - The LLM NEVER gates escalation. This classifier fires FIRST.
 */

import type { CheckInData, CrisisSource, CrisisCallback } from './contracts';

// ─── Crisis Keywords (ordered by severity) ───────────────────────

/** Direct, explicit expressions of crisis */
const DIRECT_CRISIS_TERMS: string[] = [
  'kill myself',
  'killing myself',
  'end my life',
  'end it all',
  'want to die',
  'wanna die',
  'want to be dead',
  'wish i was dead',
  'wish i were dead',
  'better off dead',
  'suicide',
  'suicidal',
  'suicidal thoughts',
  'suicidal ideation',
  'self-harm',
  'self harm',
  'selfharm',
  'hurt myself',
  'hurting myself',
  'cut myself',
  'cutting myself',
  'overdose',
  'overdosed',
  'od\'d',
  'took too many',
  'took too much',
  'took all the pills',
  'swallowed pills',
  'slit my wrists',
  'jump off',
  'hang myself',
  'hanging myself',
  'shoot myself',
];

/** Indirect / coded expressions that strongly suggest crisis */
const INDIRECT_CRISIS_TERMS: string[] = [
  'no point in living',
  'no reason to live',
  'no point anymore',
  'can\'t go on',
  'cant go on',
  'can\'t do this anymore',
  'cant do this anymore',
  'can\'t take it anymore',
  'cant take it anymore',
  'better off without me',
  'everyone would be better',
  'nobody would miss me',
  'no one would care',
  'final goodbye',
  'saying goodbye',
  'giving away my things',
  'giving everything away',
  'writing letters',
  'last letter',
  'making arrangements',
  'won\'t be here',
  'wont be here',
  'won\'t be around',
  'not gonna make it',
  'i give up',
  'there\'s no hope',
  'theres no hope',
  'completely hopeless',
  'nothing left',
  'i\'m done',
  'im done',
  'no way out',
  'trapped',
  'can\'t escape',
  'ending it',
  'going to end it',
];

/** Substance-specific crisis indicators */
const SUBSTANCE_CRISIS_TERMS: string[] = [
  'relapsed',
  'i relapsed',
  'using again',
  'started using again',
  'can\'t stop using',
  'cant stop using',
  'can\'t stop drinking',
  'cant stop drinking',
  'withdrawal',
  'withdrawing',
  'going through withdrawal',
  'took pills',
  'drank again',
  'drinking again',
  'shooting up',
  'shot up',
  'used today',
  'i used',
  'slipped',
  'had a slip',
  'fell off the wagon',
  'broke my sobriety',
  'binge',
  'bingeing',
  'blacked out',
  'passed out',
  'can\'t remember last night',
];

// ─── Farewell / Finality Patterns ────────────────────────────────

/**
 * Normalize smart/curly quotes to straight quotes for consistent matching
 */
function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"');  // smart double quotes
}

/**
 * Detect farewell-like patterns that suggest crisis
 * (e.g., "goodbye everyone", "thank you for everything, I love you all")
 */
function detectFarewellPattern(text: string): boolean {
  const lower = normalizeQuotes(text.toLowerCase());

  const farewellPhrases = [
    'goodbye everyone',
    'goodbye to everyone',
    'farewell',
    'this is goodbye',
    'my final',
    'one last time',
    'for the last time',
    'thank you for everything',
    'tell my family i love them',
    'tell everyone i love them',
    'tell my kids',
    'tell my mom',
    'tell my dad',
    'i love you all',
    'forgive me',
    'i\'m sorry for everything',
    'im sorry for everything',
    'please forgive me',
    'please don\'t blame yourself',
    'please dont blame yourself',
    'it\'s not your fault',
    'its not your fault',
    'giving away my things',
    'giving away all my',
    'giving everything away',
  ];

  return farewellPhrases.some((phrase) => lower.includes(phrase));
}

/**
 * Detect intensity amplifiers combined with negative emotion
 */
function detectIntensityPattern(text: string): boolean {
  const lower = text.toLowerCase();

  // Look for combinations of intensity + negative emotion
  const intensifiers = ['can\'t', 'cant', 'cannot', 'never', 'always', 'completely', 'absolutely', 'totally', 'utterly'];
  const negativeStates = ['alone', 'hopeless', 'worthless', 'helpless', 'pointless', 'empty', 'broken', 'destroyed', 'ruined', 'lost'];

  const hasIntensifier = intensifiers.some((i) => lower.includes(i));
  const hasNegative = negativeStates.some((n) => lower.includes(n));

  // Only flag if BOTH are present and the text is emotionally charged
  return hasIntensifier && hasNegative && lower.length > 20;
}

// ─── Event System ────────────────────────────────────────────────

/** Registered crisis event callbacks */
const crisisCallbacks: Set<CrisisCallback> = new Set();

/** Subscribe to crisis events */
export function onCrisis(callback: CrisisCallback): void {
  crisisCallbacks.add(callback);
}

/** Unsubscribe from crisis events */
export function offCrisis(callback: CrisisCallback): void {
  crisisCallbacks.delete(callback);
}

/** Fire a crisis event to all subscribers */
export function fireCrisisEvent(source: CrisisSource): void {
  crisisCallbacks.forEach((cb) => {
    try {
      cb(source);
    } catch (err) {
      console.error('[CrisisClassifier] Error in crisis callback:', err);
    }
  });
}

// ─── Main Classifier ─────────────────────────────────────────────

export interface CrisisCheckResult {
  /** Whether a crisis was detected */
  isCrisis: boolean;
  /** Which detection rule fired (for debugging / eval) */
  rule: string | null;
  /** Confidence level */
  confidence: 'high' | 'medium' | 'low' | null;
  /** The matched term, if any */
  matchedTerm: string | null;
}

/**
 * Check if a check-in context indicates a crisis.
 *
 * DESIGN: Fires on ANY match. False positives are acceptable.
 * False negatives are the ONLY unacceptable error.
 *
 * @param context - The check-in data from Person A
 * @param note - Optional additional text (journal entry, free-text)
 * @returns CrisisCheckResult with detection details
 */
export function checkCrisis(
  context: CheckInData,
  note?: string
): CrisisCheckResult {
  // Rule 1: User explicitly selected "crisis" mood → ALWAYS trigger
  if (context.mood === 'crisis') {
    return {
      isCrisis: true,
      rule: 'mood_crisis',
      confidence: 'high',
      matchedTerm: 'crisis mood selected',
    };
  }

  const textToCheck = normalizeQuotes((note || context.note || '').toLowerCase());

  if (!textToCheck || textToCheck.trim().length === 0) {
    return { isCrisis: false, rule: null, confidence: null, matchedTerm: null };
  }

  // Rule 2: Direct crisis terms → HIGH confidence
  for (const term of DIRECT_CRISIS_TERMS) {
    if (textToCheck.includes(term)) {
      return {
        isCrisis: true,
        rule: 'direct_crisis_term',
        confidence: 'high',
        matchedTerm: term,
      };
    }
  }

  // Rule 3: Indirect crisis terms → HIGH confidence
  for (const term of INDIRECT_CRISIS_TERMS) {
    if (textToCheck.includes(term)) {
      return {
        isCrisis: true,
        rule: 'indirect_crisis_term',
        confidence: 'high',
        matchedTerm: term,
      };
    }
  }

  // Rule 4: Substance-specific crisis terms → MEDIUM confidence
  for (const term of SUBSTANCE_CRISIS_TERMS) {
    if (textToCheck.includes(term)) {
      return {
        isCrisis: true,
        rule: 'substance_crisis_term',
        confidence: 'medium',
        matchedTerm: term,
      };
    }
  }

  // Rule 5: Farewell pattern → HIGH confidence
  if (detectFarewellPattern(textToCheck)) {
    return {
      isCrisis: true,
      rule: 'farewell_pattern',
      confidence: 'high',
      matchedTerm: 'farewell pattern detected',
    };
  }

  // Rule 6: Intensity + negative emotion pattern → MEDIUM confidence
  if (detectIntensityPattern(textToCheck)) {
    return {
      isCrisis: true,
      rule: 'intensity_pattern',
      confidence: 'medium',
      matchedTerm: 'intensity + negative emotion pattern',
    };
  }

  // Rule 7: Low mood + substance trigger category → LOW confidence (soft alert)
  if (context.mood === 'low' && context.triggerCategory === 'craving') {
    return {
      isCrisis: true,
      rule: 'low_mood_craving',
      confidence: 'low',
      matchedTerm: 'low mood + craving trigger',
    };
  }

  return { isCrisis: false, rule: null, confidence: null, matchedTerm: null };
}

/**
 * Convenience function — returns just the boolean, fires the event if crisis detected.
 */
export function classifyAndAlert(context: CheckInData, note?: string): boolean {
  const result = checkCrisis(context, note);
  if (result.isCrisis) {
    fireCrisisEvent('classifier');
  }
  return result.isCrisis;
}
