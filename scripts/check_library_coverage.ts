/**
 * Per-library coverage gate.
 *
 * The project-wide 80% threshold could not catch an untested library. Two reasons:
 * v8 only reported files a test had loaded, so a library nothing imported was absent
 * from the report rather than counted as zero; and even once visible, a few thousand
 * uncovered lines disappear into a large enough denominator. A whole library could be
 * added with no tests at all and the number would barely move.
 *
 * This gate reads coverage per library instead. Every library under `src/lib` must
 * reach THRESHOLD, unless it is listed in the baseline — a record of the debt that
 * existed when the gate was introduced. A baselined library may not get worse, and a
 * library absent from the baseline has nowhere to hide, which is the point: new work
 * is held to the standard while old work is paid down deliberately.
 *
 * Usage: run after `vitest run --coverage`, which writes coverage/coverage-summary.json.
 */

import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const THRESHOLD = 80;
const SUMMARY_PATH = resolve('coverage/coverage-summary.json');
const BASELINE_PATH = resolve('scripts/library_coverage_baseline.json');

type CoverageMetric = { total: number; covered: number; pct: number };
type CoverageSummary = Record<string, { lines: CoverageMetric; functions: CoverageMetric }>;
type Baseline = {
  threshold: number;
  libraries: Record<string, { lines: number; functions: number }>;
};

type LibraryCoverage = {
  name: string;
  lines: number;
  functions: number;
  totalLines: number;
};

function percentage(covered: number, total: number): number {
  return total === 0 ? 100 : (covered / total) * 100;
}

/** Rounded down, so ordinary run-to-run drift below a point does not trip the ratchet. */
function floorPct(value: number): number {
  return Math.floor(value);
}

export function libraryCoverageFrom(summary: CoverageSummary, root: string): LibraryCoverage[] {
  const totals = new Map<string, { cl: number; tl: number; cf: number; tf: number }>();

  for (const [filePath, metrics] of Object.entries(summary)) {
    if (filePath === 'total') continue;

    const rel = relative(root, filePath);
    const segments = rel.split('/');
    if (segments[0] !== 'src' || segments[1] !== 'lib' || segments.length < 3) continue;

    const name = segments[2];
    const current = totals.get(name) ?? { cl: 0, tl: 0, cf: 0, tf: 0 };
    current.cl += metrics.lines.covered;
    current.tl += metrics.lines.total;
    current.cf += metrics.functions.covered;
    current.tf += metrics.functions.total;
    totals.set(name, current);
  }

  return [...totals.entries()]
    .map(([name, t]) => ({
      name,
      lines: percentage(t.cl, t.tl),
      functions: percentage(t.cf, t.tf),
      totalLines: t.tl,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

type Failure = { library: string; reason: string };

export function evaluate(libraries: LibraryCoverage[], baseline: Baseline) {
  const failures: Failure[] = [];
  const graduated: string[] = [];

  for (const lib of libraries) {
    const floor = baseline.libraries[lib.name];

    if (!floor) {
      if (floorPct(lib.lines) < THRESHOLD) {
        failures.push({
          library: lib.name,
          reason: `${lib.lines.toFixed(2)}% lines, below the ${THRESHOLD}% required of any library not in the baseline`,
        });
      } else if (floorPct(lib.functions) < THRESHOLD) {
        failures.push({
          library: lib.name,
          reason: `${lib.functions.toFixed(2)}% functions, below the ${THRESHOLD}% required of any library not in the baseline`,
        });
      }
      continue;
    }

    // A baselined library is allowed to be below threshold, but not to get worse.
    if (floorPct(lib.lines) < floor.lines) {
      failures.push({
        library: lib.name,
        reason: `line coverage fell to ${lib.lines.toFixed(2)}% from a recorded floor of ${floor.lines}%`,
      });
    } else if (floorPct(lib.functions) < floor.functions) {
      failures.push({
        library: lib.name,
        reason: `function coverage fell to ${lib.functions.toFixed(2)}% from a recorded floor of ${floor.functions}%`,
      });
    } else if (floorPct(lib.lines) >= THRESHOLD && floorPct(lib.functions) >= THRESHOLD) {
      graduated.push(lib.name);
    }
  }

  const missing = Object.keys(baseline.libraries).filter(
    (name) => !libraries.some((lib) => lib.name === name),
  );

  return { failures, graduated, missing };
}

function main(): void {
  if (!existsSync(SUMMARY_PATH)) {
    console.error(
      `No coverage summary at ${SUMMARY_PATH}.\nRun \`npm run test:coverage\` first — this gate reads what that writes.`,
    );
    process.exit(1);
  }

  const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf8')) as CoverageSummary;
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
  const libraries = libraryCoverageFrom(summary, process.cwd());

  if (libraries.length === 0) {
    console.error(
      'The coverage summary contains no files under src/lib.\nCheck that vite.config.js still sets coverage.include to src/lib/**/*.ts.',
    );
    process.exit(1);
  }

  const { failures, graduated, missing } = evaluate(libraries, baseline);

  if (graduated.length > 0) {
    console.log(
      `These libraries now meet ${THRESHOLD}% and should be removed from scripts/library_coverage_baseline.json:\n` +
        graduated.map((name) => `  - ${name}`).join('\n') +
        '\nThe baseline is a debt register. Leaving a paid-off entry in it lets the library slip back unnoticed.\n',
    );
  }

  if (missing.length > 0) {
    console.log(
      `These libraries are in the baseline but no longer exist; drop them:\n` +
        missing.map((name) => `  - ${name}`).join('\n') +
        '\n',
    );
  }

  if (failures.length > 0) {
    console.error(
      `Coverage gate failed for ${failures.length} librar${failures.length === 1 ? 'y' : 'ies'}:\n`,
    );
    for (const { library, reason } of failures) {
      console.error(`  ${library}: ${reason}`);
    }
    console.error(
      `\nThe fix is tests. A library outside the baseline must reach ${THRESHOLD}% line and function\n` +
        `coverage; a library inside it must not fall below the figure recorded there.\n\n` +
        `Do not edit scripts/library_coverage_baseline.json to make this pass. That file records the\n` +
        `debt that existed when the gate was added, and it is meant only to shrink — adding an entry\n` +
        `or lowering one turns the gate off for that library, which is the one thing it exists to prevent.`,
    );
    process.exit(1);
  }

  const held = libraries.length - Object.keys(baseline.libraries).length;
  console.log(
    `Coverage gate passed: ${libraries.length} libraries checked, ${held} at or above ${THRESHOLD}%, ` +
      `${Object.keys(baseline.libraries).length} carrying baselined debt.`,
  );
}

// Only run when invoked directly, so the functions above stay importable for testing.
if (process.argv[1] && resolve(process.argv[1]).endsWith('check_library_coverage.ts')) {
  main();
}
