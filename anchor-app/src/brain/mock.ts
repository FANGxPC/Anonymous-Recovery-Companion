/**
 * ANCHOR — Brain Module: Mock Responses
 * ======================================
 * Fixture data so Person A can build ALL UI before the real engine exists.
 * Ships by Hour 8. Covers all mood levels and common trigger categories.
 *
 * RULE: The mock returns the EXACT same SupportResponse shape as the real engine.
 */

import type { CheckInData, SupportResponse, Mood } from './contracts';

// ─── Fixture Responses ───────────────────────────────────────────

const MOCK_RESPONSES: Record<Mood, SupportResponse[]> = {
  great: [
    {
      text: "It's wonderful that you're feeling great today! This is a good time to reinforce the habits that got you here. Consider writing down what went well today — research shows that acknowledging positive moments strengthens your resilience for harder days ahead.",
      source: 'SAMHSA TIP 35: Enhancing Motivation for Change',
      excerpt:
        'Recognizing and reinforcing positive change experiences helps build self-efficacy and sustain motivation for continued recovery.',
      crisis: false,
    },
    {
      text: "What a great day to build on your progress! Try the 'Three Good Things' exercise: write down three specific things that contributed to this good feeling. This practice trains your brain to notice and hold onto the positive patterns in your recovery journey.",
      source: 'DBT Skills Training Manual — Emotion Regulation',
      excerpt:
        'Building positive experiences is a core emotion regulation skill. The accumulation of positive events, both short-term and long-term, creates a buffer against emotional vulnerability.',
      crisis: false,
    },
  ],

  good: [
    {
      text: "Glad you're having a good day. This is a great moment to practice the PLEASE skill — taking care of your PhysicaL health, Eating balanced meals, Avoiding mood-altering substances, getting Sleep, and Exercising. These basics are the foundation that keeps good days coming.",
      source: 'DBT Skills Training Manual — Emotion Regulation',
      excerpt:
        'PLEASE skills reduce vulnerability to negative emotions by addressing basic biological factors: PhysicaL illness, balanced Eating, Avoiding mood-altering drugs, balanced Sleep, and Exercise.',
      crisis: false,
    },
    {
      text: "It's encouraging to hear you're doing well. Consider using this moment to review your coping plan — when you're feeling good is actually the best time to prepare for challenges ahead. What strategies have been working for you lately?",
      source: 'SAMHSA TIP 35: Enhancing Motivation for Change',
      excerpt:
        'Developing a change plan during periods of stability helps prepare individuals for high-risk situations and strengthens commitment to recovery goals.',
      crisis: false,
    },
  ],

  okay: [
    {
      text: "'Okay' is still forward. When you're in this middle space, the 5-4-3-2-1 grounding technique can help you stay present: name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, and 1 you taste. It takes less than a minute and brings you back to now.",
      source: 'DBT Skills Training Manual — Distress Tolerance',
      excerpt:
        'The 5-4-3-2-1 technique is a grounding exercise that uses the five senses to bring attention to the present moment, reducing rumination and anxiety.',
      crisis: false,
    },
    {
      text: "Neutral days are part of recovery — they don't need to be good or bad. Try a brief body scan: close your eyes, breathe naturally, and notice sensations from your feet up to the top of your head. Just notice, without judging. This builds the mindfulness muscle for when you need it most.",
      source: 'DBT Skills Training Manual — Mindfulness',
      excerpt:
        'Observing and describing body sensations without judgment is a core mindfulness skill that enhances emotional awareness and reduces reactivity to distressing stimuli.',
      crisis: false,
    },
  ],

  low: [
    {
      text: "I hear that things are tough right now. That takes courage to acknowledge. When you're feeling low, the TIPP skill can help shift your body chemistry quickly: Temperature (splash cold water on your face), Intense exercise (even 5 minutes), Paced breathing (exhale longer than you inhale), and Progressive muscle relaxation.",
      source: 'DBT Skills Training Manual — Distress Tolerance',
      excerpt:
        'TIPP skills rapidly change body chemistry to reduce extreme emotional arousal: Temperature change, Intense exercise, Paced breathing, and Progressive muscle relaxation.',
      crisis: false,
    },
    {
      text: "Difficult moments don't erase your progress — they're part of the journey, not a detour from it. Try the 'Opposite Action' skill: if your emotion is urging you to isolate, take one small step toward connection instead. Even a brief walk outside or a text to someone safe can shift the pattern.",
      source: 'DBT Skills Training Manual — Emotion Regulation',
      excerpt:
        'Opposite Action involves identifying the action urge associated with an emotion and deliberately acting opposite to that urge when the emotion is not justified by the facts.',
      crisis: false,
    },
    {
      text: "You're having a hard day, and that's real. One thing that can help right now is the 4-7-8 breathing technique: breathe in for 4 seconds, hold for 7 seconds, breathe out slowly for 8 seconds. Repeat 3 times. This activates your parasympathetic nervous system and can reduce the intensity of what you're feeling.",
      source: 'SAMHSA TIP 63: Medications for Opioid Use Disorder',
      excerpt:
        'Relaxation techniques such as controlled breathing exercises can help manage stress and reduce physiological arousal during difficult moments in recovery.',
      crisis: false,
    },
  ],

  crisis: [
    {
      text: "I can see you're going through something really difficult right now. You don't have to face this alone. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or the SAMHSA National Helpline (1-800-662-4357). These are free, confidential, and available 24/7. While you're here, try to focus on your breathing — slow, deep breaths.",
      source: 'SAMHSA National Helpline Guide',
      excerpt:
        "SAMHSA's National Helpline (1-800-662-4357) is a free, confidential, 24/7, 365-day-a-year treatment referral and information service for individuals and families facing mental and/or substance use disorders.",
      crisis: true,
    },
    {
      text: "What you're feeling right now is intense, but it will pass. You are not alone. Right now, try to get to a safe place and reach out to your trusted contact or call 988. If you're in immediate danger, call 911. You reached out here — that shows incredible strength.",
      source: 'Crisis Text Line — Crisis De-escalation Guide',
      excerpt:
        'In a crisis, the immediate priority is safety. Help the person identify a safe location, a trusted contact, and professional crisis resources. Validate their courage in reaching out.',
      crisis: true,
    },
  ],
};

// ─── Trigger-specific augmentations ──────────────────────────────

const TRIGGER_AUGMENTS: Record<string, string> = {
  social:
    'Social situations can be challenging in recovery. Remember, you can always set boundaries — leaving early or declining an invitation is a valid coping strategy.',
  stress:
    'Stress is one of the most common triggers. Even a 2-minute breathing exercise can lower cortisol and create space between the trigger and your response.',
  craving:
    'Cravings are like waves — they build, peak, and always pass. Try "urge surfing": observe the craving without acting on it, notice where you feel it in your body, and ride it out. Most cravings peak within 15-20 minutes.',
  emotional:
    'Strong emotions are signals, not commands. Try naming what you feel with specificity — "I feel frustrated because..." — this engages your prefrontal cortex and reduces the intensity.',
  environmental:
    "Your environment matters. If possible, change your physical space right now — even moving to a different room can interrupt the trigger pattern.",
  physical:
    'Physical discomfort can amplify emotional distress. Check the basics: have you eaten, had water, slept? Addressing physical needs is not avoiding the emotional work — it\'s supporting it.',
  financial:
    'Financial stress is real and valid. Focus on what you can control right now, in this moment. One small action — making a list, setting one boundary — can reduce the overwhelm.',
  relationship:
    'Relationship challenges are deeply personal. Remember that healthy boundaries protect your recovery. You can care about someone and still prioritize your wellbeing.',
  boredom:
    'Boredom can be a sneaky trigger. Try engaging your hands and mind together — drawing, cooking, a puzzle, a walk with a podcast. Structure is a recovery tool.',
  other:
    'Whatever brought you here, you showed up for yourself today. That matters.',
};

// ─── Mock getSupport Implementation ──────────────────────────────

/**
 * Mock implementation of getSupport — returns fixture responses
 * matching the exact SupportResponse contract.
 *
 * Selection logic:
 * 1. Pick a response pool based on mood
 * 2. Randomly select from the pool
 * 3. Augment with trigger-specific context if available
 */
export function mockGetSupport(context: CheckInData): SupportResponse {
  const pool = MOCK_RESPONSES[context.mood] || MOCK_RESPONSES.okay;
  const base = pool[Math.floor(Math.random() * pool.length)];

  // Augment with trigger-specific advice if not a crisis response
  if (!base.crisis && context.triggerCategory) {
    const augment = TRIGGER_AUGMENTS[context.triggerCategory];
    if (augment) {
      return {
        ...base,
        text: `${base.text}\n\n${augment}`,
      };
    }
  }

  return { ...base };
}

/**
 * Mock crisis check — returns true for crisis mood or crisis keywords in note
 */
export function mockCheckCrisis(context: CheckInData): boolean {
  if (context.mood === 'crisis') return true;

  if (context.note) {
    const lower = context.note.toLowerCase();
    const crisisTerms = [
      'kill myself',
      'end it all',
      'want to die',
      'suicide',
      'overdose',
      'self-harm',
    ];
    return crisisTerms.some((term) => lower.includes(term));
  }

  return false;
}
