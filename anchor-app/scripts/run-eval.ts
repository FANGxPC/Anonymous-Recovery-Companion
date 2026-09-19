/**
 * ANCHOR — CLI Eval Runner
 * =========================
 * Standalone eval script that tests the crisis classifier and mock responses.
 * Can run without the full browser environment (no WebLLM needed).
 *
 * Usage: npx tsx scripts/run-eval.ts
 */

import { checkCrisis } from '../src/brain/crisisClassifier';
import { mockGetSupport } from '../src/brain/mock';
import { guardrailCheck } from '../src/brain/generator/prompts';
import testSetData from '../src/brain/eval/testSet.json';
import sourcesData from '../src/brain/corpus/sources.json';

interface TestItem {
  id: string;
  category: 'citation_validity' | 'crisis_recall' | 'guardrail_adherence';
  input: {
    mood: 'great' | 'good' | 'okay' | 'low' | 'crisis';
    triggerCategory: string;
    note?: string;
    timestamp: number;
  };
  expected: {
    crisis?: boolean;
    mustCiteRealSource?: boolean;
    mustNotContain?: string[];
  };
  description: string;
}

const VALID_SOURCES = new Set(sourcesData.map((s: any) => s.title));

async function runEval() {
  const testSet = testSetData as TestItem[];

  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANCHOR — Eval Harness (CLI Mode)');
  console.log('  Testing Crisis Classifier + Mock Responses');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Total test items: ${testSet.length}`);
  console.log('');

  let cvPassed = 0, cvTotal = 0, cvFails: string[] = [];
  let crPassed = 0, crTotal = 0, crFails: string[] = [];
  let gaPassed = 0, gaTotal = 0, gaFails: string[] = [];

  // ── Citation Validity ─────────────────────────────────────
  console.log('─── Citation Validity ────────────────────────────────');
  for (const test of testSet.filter(t => t.category === 'citation_validity')) {
    cvTotal++;
    const response = mockGetSupport(test.input as any);

    const sourceValid = Array.from(VALID_SOURCES).some(
      (vs) => response.source.toLowerCase().includes(vs.toLowerCase()) ||
              vs.toLowerCase().includes(response.source.toLowerCase())
    );

    const hasExcerpt = response.excerpt && response.excerpt.length >= 10;
    const hasText = response.text && response.text.length >= 10;
    const passes = sourceValid && hasExcerpt && hasText;

    if (passes) {
      cvPassed++;
      console.log(`  ✅ PASS | ${test.id} | ${test.description}`);
    } else {
      const reason = !sourceValid ? `Source "${response.source}" not in corpus` :
                     !hasExcerpt ? 'Excerpt too short' : 'Text too short';
      cvFails.push(`[${test.id}] ${reason}`);
      console.log(`  ❌ FAIL | ${test.id} | ${test.description}`);
      console.log(`         → ${reason}`);
    }
  }

  // ── Crisis Recall ─────────────────────────────────────────
  console.log('');
  console.log('─── Crisis Recall ───────────────────────────────────');
  for (const test of testSet.filter(t => t.category === 'crisis_recall')) {
    crTotal++;
    const result = checkCrisis(test.input as any, test.input.note);

    if (result.isCrisis) {
      crPassed++;
      console.log(`  ✅ PASS | ${test.id} | ${test.description}`);
      console.log(`         → Rule: ${result.rule}, Match: "${result.matchedTerm}"`);
    } else {
      crFails.push(`[${test.id}] Did not fire for: "${test.input.note}"`);
      console.log(`  ❌ FAIL | ${test.id} | ${test.description}`);
      console.log(`         → Classifier did not fire for: "${test.input.note}"`);
    }
  }

  // ── Guardrail Adherence ───────────────────────────────────
  console.log('');
  console.log('─── Guardrail Adherence ─────────────────────────────');
  for (const test of testSet.filter(t => t.category === 'guardrail_adherence')) {
    gaTotal++;
    const response = mockGetSupport(test.input as any);
    const mustNotContain = test.expected.mustNotContain || [];

    // Check guardrails
    const gCheck = guardrailCheck(response.text);
    let passes = gCheck.passes;
    let reason = gCheck.violation || '';

    // Check prohibited terms
    if (passes) {
      const lower = response.text.toLowerCase();
      for (const term of mustNotContain) {
        if (lower.includes(term.toLowerCase())) {
          passes = false;
          reason = `Contains prohibited term: "${term}"`;
          break;
        }
      }
    }

    if (passes) {
      gaPassed++;
      console.log(`  ✅ PASS | ${test.id} | ${test.description}`);
    } else {
      gaFails.push(`[${test.id}] ${reason}`);
      console.log(`  ❌ FAIL | ${test.id} | ${test.description}`);
      console.log(`         → ${reason}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Citation Validity:    ${cvPassed}/${cvTotal} (${((cvPassed/cvTotal)*100).toFixed(1)}%)`);
  console.log(`  Crisis Recall:        ${crPassed}/${crTotal} (${((crPassed/crTotal)*100).toFixed(1)}%)`);
  console.log(`  Guardrail Adherence:  ${gaPassed}/${gaTotal} (${((gaPassed/gaTotal)*100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════════════════');

  if (cvFails.length > 0) {
    console.log('\n  Citation failures:');
    cvFails.forEach(f => console.log(`    ⚠ ${f}`));
  }
  if (crFails.length > 0) {
    console.log('\n  🚨 Crisis recall failures (CRITICAL):');
    crFails.forEach(f => console.log(`    🚨 ${f}`));
  }
  if (gaFails.length > 0) {
    console.log('\n  Guardrail failures:');
    gaFails.forEach(f => console.log(`    ⚠ ${f}`));
  }

  console.log('');
  console.log('  "We measured our safety guardrails. Here are the numbers."');
  console.log('═══════════════════════════════════════════════════════');

  const allPassed = cvPassed === cvTotal && crPassed === crTotal && gaPassed === gaTotal;
  process.exit(allPassed ? 0 : 1);
}

runEval();
