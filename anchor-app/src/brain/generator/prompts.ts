/**
 * ANCHOR — Generator System Prompts & Guardrails
 * =================================================
 * These prompts enforce the non-diagnostic, citation-based constraints.
 * EVERY response must cite a real source from the retrieved passages.
 * NEVER diagnose, assess, score, label, or make medical claims.
 */

/**
 * System prompt for the recovery companion — used by both sealed and assisted modes.
 * Enforces all guardrails at the prompt level.
 */
export const SYSTEM_PROMPT = `You are ANCHOR, a supportive recovery companion. You help people in recovery from substance use by sharing evidence-based coping techniques.

STRICT RULES — VIOLATION OF ANY RULE IS UNACCEPTABLE:

1. GROUNDING: You may ONLY reference techniques, facts, and information that appear in the provided CONTEXT passages below. If the context doesn't cover something, say so honestly — do NOT make things up.

2. NO DIAGNOSIS: NEVER diagnose, assess, score, label, or categorize the user's condition. Never say "you have," "you are," "you seem to have," or "this sounds like [condition]."

3. NO MEDICAL ADVICE: NEVER recommend medication, dosages, medical treatments, or changes to prescribed treatment. Never say "you should take," "try this medication," or "stop taking."

4. NO SHAME: NEVER use shame language. Never say "you should have," "you failed," "that was wrong," "you're weak," or "how could you." Slips are DATA, not failure. Be curious, never corrective.

5. CITATION: Every suggestion MUST cite its source. Name the specific source from the context passages.

6. SEASONS NOT STREAKS: Frame milestones as "seasons" or "chapters," never as streaks or counts. A slip starts "a new chapter" — progress is never erased.

7. CRISIS ROUTING: If someone expresses suicidal thoughts, self-harm, overdose, or immediate danger, ALWAYS provide crisis helpline numbers (988, SAMHSA 1-800-662-4357, Crisis Text Line 741741) and emphasize that help is available NOW.

8. EMPATHY FIRST: Acknowledge the person's feelings before offering any technique. Lead with validation, not advice.

9. BREVITY: Keep responses concise (2-4 sentences for the suggestion, 1 sentence for the citation). People in distress need clarity, not walls of text.

FORMAT: You must respond in valid JSON with this exact structure:
{
  "text": "Your supportive response with the coping technique suggestion",
  "source": "Exact title of the source from the context",
  "excerpt": "The specific passage from the context that supports your suggestion"
}

Respond ONLY with the JSON object. No preamble, no explanation outside the JSON.`;

/**
 * Build the user message with retrieved context.
 */
export function buildUserPrompt(
  queryDescription: string,
  contextPassages: string[]
): string {
  const context = contextPassages
    .map((p, i) => `[Passage ${i + 1}]: ${p}`)
    .join('\n\n');

  return `CONTEXT (you may ONLY reference information from these passages):
${context}

USER SITUATION: ${queryDescription}

Respond with a supportive, cited suggestion in JSON format.`;
}

/**
 * Parse a raw model response into the expected format.
 * Handles various edge cases in LLM output.
 */
export function parseModelResponse(
  rawResponse: string,
  retrievedChunks: { sourceTitle: string; text: string }[]
): { text: string; source: string; excerpt: string } | null {
  try {
    // Try to extract JSON from the response (models sometimes add text around it)
    const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.warn('[Generator] No JSON found in response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.text || !parsed.source || !parsed.excerpt) {
      console.warn('[Generator] Missing required fields in response');
      return null;
    }

    // Validate that the cited source actually exists in our corpus
    const sourceExists = retrievedChunks.some(
      (chunk) =>
        chunk.sourceTitle.toLowerCase().includes(parsed.source.toLowerCase()) ||
        parsed.source.toLowerCase().includes(chunk.sourceTitle.toLowerCase())
    );

    if (!sourceExists) {
      console.warn(
        `[Generator] Cited source "${parsed.source}" not found in retrieved chunks. Using first chunk's source.`
      );
      // Fall back to the first retrieved chunk's source
      parsed.source = retrievedChunks[0]?.sourceTitle || parsed.source;
      parsed.excerpt = retrievedChunks[0]?.text.slice(0, 200) || parsed.excerpt;
    }

    return {
      text: String(parsed.text),
      source: String(parsed.source),
      excerpt: String(parsed.excerpt),
    };
  } catch (err) {
    console.error('[Generator] Failed to parse response:', err);
    return null;
  }
}

/**
 * Post-process guardrail check — validate the response doesn't contain prohibited content.
 * Returns the response if it passes, or null with a reason if it fails.
 */
export function guardrailCheck(
  response: string
): { passes: boolean; violation?: string } {
  const lower = response.toLowerCase();

  // Check for diagnostic language
  const diagnosticTerms = [
    'you have depression',
    'you have anxiety',
    'you are depressed',
    'you are addicted',
    'you\'re an addict',
    'you are an addict',
    'you have ptsd',
    'you have adhd',
    'you have bipolar',
    'you have a disorder',
    'you are suffering from',
    'i diagnose',
    'my diagnosis',
    'your condition is',
    'you appear to have',
    'symptoms suggest',
    'clinically',
    'diagnostic criteria',
  ];

  for (const term of diagnosticTerms) {
    if (lower.includes(term)) {
      return { passes: false, violation: `Diagnostic language detected: "${term}"` };
    }
  }

  // Check for medical advice
  const medicalTerms = [
    'you should take',
    'take this medication',
    'stop taking your',
    'change your dosage',
    'prescription',
    'prescribe',
    'mg daily',
    'milligrams',
    'antidepressant',
    'benzodiazepine',
    'methadone',
    'suboxone',
    'naltrexone',
    'consult your doctor about starting',
  ];

  for (const term of medicalTerms) {
    if (lower.includes(term)) {
      return { passes: false, violation: `Medical advice detected: "${term}"` };
    }
  }

  // Check for shame language
  const shameTerms = [
    'you should have',
    'you failed',
    'that was wrong',
    'you\'re weak',
    'you are weak',
    'how could you',
    'you let everyone down',
    'you disappointed',
    'shame on',
    'you\'re a failure',
    'you are a failure',
    'you\'re pathetic',
    'what\'s wrong with you',
    'you did this to yourself',
  ];

  for (const term of shameTerms) {
    if (lower.includes(term)) {
      return { passes: false, violation: `Shame language detected: "${term}"` };
    }
  }

  return { passes: true };
}
