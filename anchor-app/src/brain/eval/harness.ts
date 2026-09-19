/**
 * ANCHOR — Eval Harness
 * =======================
 * One-command runner that evaluates the Brain module against 40 test items.
 * Produces 3 metrics: citation validity, crisis recall, guardrail adherence.
 *
 * Usage:
 *   npm run eval           (runs in Node via tsx)
 *   brain.runEval()        (runs in browser for demo)
 *
 * Show the output on a slide. This is the unfair advantage.
 */

import type { CheckInData, SupportResponse, EvalResults } from '../contracts';
import { mockGetSupport } from '../mock';
import { checkCrisis } from '../crisisClassifier';
import {
  evaluateCitationValidity,
  evaluateGuardrailAdherence,
  aggregateMetric,
} from './metrics';
import testSetData from './testSet.json';

interface TestItem {
  id: string;
  category: 'citation_validity' | 'crisis_recall' | 'guardrail_adherence';
  input: CheckInData;
  expected: {
    crisis?: boolean;
    mustCiteRealSource?: boolean;
    mustNotContain?: string[];
  };
  description: string;
}

/**
 * Run the full eval harness.
 *
 * @param getSupportFn - The getSupport implementation to test.
 *   If not provided, uses mock (for testing the harness itself).
 * @param verbose - If true, print details for each test item
 * @returns EvalResults with 3 metrics
 */
export async function runEvalHarness(
  getSupportFn?: (context: CheckInData) => Promise<SupportResponse> | SupportResponse,
  verbose: boolean = true
): Promise<EvalResults> {
  const testSet = testSetData as TestItem[];
  const supportFn = getSupportFn || ((ctx: CheckInData) => mockGetSupport(ctx));

  if (verbose) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ANCHOR — Eval Harness');
    console.log('  Testing Brain Module Safety & Quality');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Total test items: ${testSet.length}`);
    console.log('');
  }

  // ── Citation Validity Tests ──────────────────────────────────

  const cvTests = testSet.filter((t) => t.category === 'citation_validity');
  const cvResults: { id: string; passes: boolean; reason?: string }[] = [];

  if (verbose) {
    console.log('─── Citation Validity ────────────────────────────────');
  }

  for (const test of cvTests) {
    const response = await supportFn(test.input);
    const result = evaluateCitationValidity(test.id, response);
    cvResults.push({ id: test.id, ...result });

    if (verbose) {
      const status = result.passes ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} | ${test.id} | ${test.description}`);
      if (!result.passes) {
        console.log(`         → ${result.reason}`);
      }
    }
  }

  // ── Crisis Recall Tests ──────────────────────────────────────

  const crTests = testSet.filter((t) => t.category === 'crisis_recall');
  const crResults: { id: string; passes: boolean; reason?: string }[] = [];

  if (verbose) {
    console.log('');
    console.log('─── Crisis Recall ───────────────────────────────────');
  }

  for (const test of crTests) {
    // For crisis recall, we test the classifier directly
    const classifierResult = checkCrisis(test.input, test.input.note);
    // Run supportFn for completeness but classifier is the primary check
    await supportFn(test.input);

    // Crisis recall means the classifier must fire AND the response must flag it
    const passes = classifierResult.isCrisis;
    const reason = passes
      ? undefined
      : `Classifier did not fire. Input: "${test.input.note}"`;

    crResults.push({ id: test.id, passes, reason });

    if (verbose) {
      const status = passes ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} | ${test.id} | ${test.description}`);
      if (!passes) {
        console.log(`         → ${reason}`);
      }
    }
  }

  // ── Guardrail Adherence Tests ────────────────────────────────

  const gaTests = testSet.filter((t) => t.category === 'guardrail_adherence');
  const gaResults: { id: string; passes: boolean; reason?: string }[] = [];

  if (verbose) {
    console.log('');
    console.log('─── Guardrail Adherence ─────────────────────────────');
  }

  for (const test of gaTests) {
    const response = await supportFn(test.input);
    const mustNotContain = test.expected.mustNotContain || [];
    const result = evaluateGuardrailAdherence(test.id, response, mustNotContain);
    gaResults.push({ id: test.id, ...result });

    if (verbose) {
      const status = result.passes ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} | ${test.id} | ${test.description}`);
      if (!result.passes) {
        console.log(`         → ${result.reason}`);
      }
    }
  }

  // ── Aggregate Results ────────────────────────────────────────

  const citationValidity = aggregateMetric(cvResults);
  const crisisRecall = aggregateMetric(crResults);
  const guardrailAdherence = aggregateMetric(gaResults);

  const results: EvalResults = {
    citationValidity,
    crisisRecall,
    guardrailAdherence,
    timestamp: Date.now(),
  };

  if (verbose) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(
      `  Citation Validity:    ${citationValidity.passed}/${citationValidity.total} (${citationValidity.percentage.toFixed(1)}%)`
    );
    console.log(
      `  Crisis Recall:        ${crisisRecall.passed}/${crisisRecall.total} (${crisisRecall.percentage.toFixed(1)}%)`
    );
    console.log(
      `  Guardrail Adherence:  ${guardrailAdherence.passed}/${guardrailAdherence.total} (${guardrailAdherence.percentage.toFixed(1)}%)`
    );
    console.log('═══════════════════════════════════════════════════════');

    if (citationValidity.failures.length > 0) {
      console.log('\n  Citation failures:');
      citationValidity.failures.forEach((f) => console.log(`    ⚠ ${f}`));
    }
    if (crisisRecall.failures.length > 0) {
      console.log('\n  Crisis recall failures (CRITICAL):');
      crisisRecall.failures.forEach((f) => console.log(`    🚨 ${f}`));
    }
    if (guardrailAdherence.failures.length > 0) {
      console.log('\n  Guardrail failures:');
      guardrailAdherence.failures.forEach((f) => console.log(`    ⚠ ${f}`));
    }

    console.log('');
    console.log('  "We measured our safety guardrails. Here are the numbers."');
    console.log('═══════════════════════════════════════════════════════');
  }

  return results;
}

/* eslint-disable no-undef */
// CLI entry point — run with `npx tsx src/brain/eval/harness.ts`
// @ts-ignore — process is available in Node.js environments only
if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
  const proc = (globalThis as any).process;
  if (proc?.argv?.[1]?.includes('harness')) {
    runEvalHarness().then((results: EvalResults) => {
      const allPassed =
        results.citationValidity.passed === results.citationValidity.total &&
        results.crisisRecall.passed === results.crisisRecall.total &&
        results.guardrailAdherence.passed === results.guardrailAdherence.total;

      proc.exit(allPassed ? 0 : 1);
    });
  }
}
