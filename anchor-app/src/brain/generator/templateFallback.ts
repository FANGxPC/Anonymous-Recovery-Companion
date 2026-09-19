/**
 * ANCHOR — Template Fallback Generator
 * ======================================
 * Rule-based response assembly using retrieved corpus chunks.
 * No LLM needed. Same citation contract as sealed/assisted modes.
 *
 * This is the INSURANCE POLICY:
 * - If WebLLM is too slow on the demo machine → use this
 * - If the LLM violates guardrails → fall back to this
 * - If the model fails to load → this always works
 *
 * The citation contract is UNCHANGED — responses still cite real sources.
 */

import type { CheckInData, CorpusChunk, SupportResponse, Mood } from '../contracts';

// ─── Response Templates ──────────────────────────────────────────

/**
 * Opening phrases mapped to mood — empathy first, always.
 */
const MOOD_OPENINGS: Record<Mood, string[]> = {
  great: [
    "It's wonderful that you're feeling strong today.",
    "What a great moment to acknowledge how far you've come.",
    "Your positive energy today is worth celebrating.",
  ],
  good: [
    "Glad to hear you're having a good day.",
    "A steady day is real progress — well done.",
    "It's encouraging to see you doing well.",
  ],
  okay: [
    "'Okay' is still moving forward — that counts.",
    "Neutral days are part of the journey, not a detour.",
    "You showed up today, and that matters.",
  ],
  low: [
    "I hear that things are tough right now. That takes courage to share.",
    "Difficult moments don't erase your progress.",
    "What you're feeling is real, and it's valid.",
  ],
  crisis: [
    "I can see you're going through something really difficult right now.",
    "You don't have to face this alone — help is available right now.",
    "What you're feeling is intense, but you reached out, and that shows incredible strength.",
  ],
};

/**
 * Transition phrases to connect opening to the technique
 */
const TRANSITIONS: string[] = [
  'One technique that might help right now is',
  'Here\'s something you can try',
  'Consider trying this',
  'A practice that may support you in this moment is',
];

/**
 * Generate a response using templates + retrieved chunks.
 * No LLM involved — pure rule-based assembly.
 */
export function generateTemplate(
  context: CheckInData,
  retrievedChunks: CorpusChunk[]
): SupportResponse {
  if (retrievedChunks.length === 0) {
    return getDefaultCrisisResponse();
  }

  const topChunk = retrievedChunks[0];

  // 1. Select an opening based on mood
  const openings = MOOD_OPENINGS[context.mood] || MOOD_OPENINGS.okay;
  const opening = openings[Math.floor(Math.random() * openings.length)];

  // 2. Select a transition
  const transition =
    TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)];

  // 3. Extract the technique description from the chunk
  const techniqueName = topChunk.techniqueName || 'this approach';
  const techniqueDescription = extractTechniqueDescription(topChunk);

  // 4. Assemble the response
  let text: string;

  if (context.mood === 'crisis') {
    // Crisis responses always include helpline numbers
    text = `${opening} Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or SAMHSA's helpline at 1-800-662-4357 — they're free, confidential, and available right now. While you're here, ${techniqueDescription}`;
  } else {
    text = `${opening} ${transition} ${techniqueName}: ${techniqueDescription}`;
  }

  // 5. Add trigger-specific context if available
  const triggerAdvice = getTriggerAdvice(context.triggerCategory);
  if (triggerAdvice && context.mood !== 'crisis') {
    text += ` ${triggerAdvice}`;
  }

  return {
    text,
    source: topChunk.sourceTitle,
    excerpt: topChunk.text.slice(0, 200),
    crisis: context.mood === 'crisis',
  };
}

/**
 * Extract a concise technique description from a chunk.
 * Takes the most actionable 2-3 sentences.
 */
function extractTechniqueDescription(chunk: CorpusChunk): string {
  const sentences = chunk.text
    .split(/\.\s+/)
    .filter((s) => s.length > 20);

  // Skip the first sentence if it's definitional ("X is a technique that...")
  // and take the actionable steps
  const startIdx = sentences[0]?.match(/\b(is a|is an|refers to|describes|involves)\b/)
    ? 1
    : 0;

  const actionable = sentences.slice(startIdx, startIdx + 2);
  return actionable.join('. ').trim() + '.';
}

/**
 * Get trigger-specific advice
 */
function getTriggerAdvice(trigger: string): string | null {
  const advice: Record<string, string> = {
    social:
      'Remember, setting boundaries in social situations is a valid coping strategy.',
    stress:
      'Even a 2-minute breathing pause can create space between the trigger and your response.',
    craving:
      'Cravings are like waves — they always pass. Most peak within 15-20 minutes.',
    emotional:
      'Naming your emotions with specificity can reduce their intensity.',
    environmental:
      'If possible, changing your physical space can interrupt the trigger pattern.',
    physical:
      'Check the basics: have you eaten, had water, and rested? Physical needs support emotional resilience.',
    financial:
      'Focus on one small, controllable action right now to reduce the overwhelm.',
    relationship:
      'Healthy boundaries protect your recovery. You can care and still prioritize your wellbeing.',
    boredom:
      'Engaging your hands and mind together — cooking, puzzles, a walk — can redirect restless energy.',
  };

  return advice[trigger] || null;
}

/**
 * Default crisis response when no chunks are available
 */
function getDefaultCrisisResponse(): SupportResponse {
  return {
    text: "You don't have to face this alone. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988), SAMHSA's helpline at 1-800-662-4357, or text HOME to 741741 for the Crisis Text Line. These services are free, confidential, and available 24/7.",
    source: 'SAMHSA National Helpline Guide',
    excerpt:
      "SAMHSA's National Helpline is a free, confidential, 24/7 treatment referral and information service.",
    crisis: true,
  };
}
