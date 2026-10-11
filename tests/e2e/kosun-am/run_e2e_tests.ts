/**
 * Master E2E Test Suite Runner for KOSUN AM ("קושאן מייל אוטומטי")
 * 
 * Executes all 4 tiers sequentially and provides a comprehensive executive summary:
 * - Tier 1: Feature Coverage (45 tests)
 * - Tier 2: Boundary & Corner Cases (45 tests)
 * - Tier 3: Cross-Feature Combinations (10 tests)
 * - Tier 4: Real-World Application Scenarios (5 tests)
 */

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

interface SuiteResult {
  file: string;
  name: string;
  tier: string;
  passed: number;
  failed: number;
  durationMs: number;
  success: boolean;
  output: string;
}

const TEST_FILES = [
  {
    tier: 'Tier 1',
    name: 'Feature Coverage (Happy Path Isolation)',
    file: 'tier1_feature_coverage.test.ts',
  },
  {
    tier: 'Tier 2',
    name: 'Boundary & Corner Cases (Domain Extremes)',
    file: 'tier2_boundary_corner.test.ts',
  },
  {
    tier: 'Tier 3',
    name: 'Cross-Feature Combinations (Pairwise)',
    file: 'tier3_cross_feature.test.ts',
  },
  {
    tier: 'Tier 4',
    name: 'Real-World Application Scenarios',
    file: 'tier4_real_world_scenarios.test.ts',
  },
];

async function runTestFile(fileConfig: typeof TEST_FILES[0]): Promise<SuiteResult> {
  const testPath = resolve('tests/e2e/kosun-am', fileConfig.file);
  const startTime = Date.now();

  return new Promise((resolveResult) => {
    const child = spawn(
      process.execPath,
      ['--test', '--experimental-strip-types', testPath],
      {
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '1' },
      }
    );

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      const combined = stdout + stderr;

      // Extract pass/fail counts from node:test output
      const passMatch = combined.match(/ℹ pass (\d+)/);
      const failMatch = combined.match(/ℹ fail (\d+)/);

      const passed = passMatch ? parseInt(passMatch[1], 10) : (code === 0 ? 1 : 0);
      const failed = failMatch ? parseInt(failMatch[1], 10) : (code !== 0 ? 1 : 0);

      resolveResult({
        file: fileConfig.file,
        name: fileConfig.name,
        tier: fileConfig.tier,
        passed,
        failed,
        durationMs,
        success: code === 0 && failed === 0,
        output: combined,
      });
    });
  });
}

async function main() {
  console.log('\n================================================================');
  console.log('   KOSUN AM ("קושאן מייל אוטומטי") - E2E DUAL TRACK TEST SUITE');
  console.log('================================================================');
  console.log(`Node Runtime: ${process.version}`);
  console.log(`Execution Timestamp: ${new Date().toISOString()}\n`);

  const results: SuiteResult[] = [];

  for (const cfg of TEST_FILES) {
    process.stdout.write(`Running [${cfg.tier}] ${cfg.name}... `);
    const res = await runTestFile(cfg);
    if (res.success) {
      console.log(`\x1b[32mPASSED\x1b[0m (${res.passed} tests, ${res.durationMs}ms)`);
    } else {
      console.log(`\x1b[31mFAILED\x1b[0m (${res.failed} failures, ${res.durationMs}ms)`);
    }
    results.push(res);
  }

  console.log('\n================================================================');
  console.log('                    EXECUTIVE SUMMARY BREAKDOWN');
  console.log('================================================================');
  console.log('Tier    | Suite Description                      | Pass | Fail | Status');
  console.log('--------|----------------------------------------|------|------|--------');

  let totalPass = 0;
  let totalFail = 0;
  let allSuccess = true;

  for (const r of results) {
    totalPass += r.passed;
    totalFail += r.failed;
    if (!r.success) allSuccess = false;

    const tierPadded = r.tier.padEnd(7);
    const namePadded = r.name.padEnd(38);
    const passPadded = String(r.passed).padStart(4);
    const failPadded = String(r.failed).padStart(4);
    const statusStr = r.success ? '\x1b[32mPASS\x1b[0m  ' : '\x1b[31mFAIL\x1b[0m  ';

    console.log(`${tierPadded} | ${namePadded} | ${passPadded} | ${failPadded} | ${statusStr}`);
  }

  console.log('--------|----------------------------------------|------|------|--------');
  console.log(`TOTAL   | 4 Test Suites, 105 Test Cases          | ${String(totalPass).padStart(4)} | ${String(totalFail).padStart(4)} | ${allSuccess ? '\x1b[32m100% PASS\x1b[0m' : '\x1b[31mFAILED\x1b[0m'}`);
  console.log('================================================================\n');

  if (!allSuccess) {
    console.error('Detailed Failures:');
    for (const r of results) {
      if (!r.success) {
        console.error(`\n--- Failure in [${r.tier}] ${r.file} ---`);
        console.error(r.output);
      }
    }
    process.exit(1);
  } else {
    console.log('\x1b[32m✔ All 105 tests across Tiers 1-4 completed successfully.\x1b[0m');
    console.log('Ready for Milestone 5 E2E Verification & Sign-off.\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
