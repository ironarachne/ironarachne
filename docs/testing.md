# Testing Vastways

Run `npm run verify` before opening a PR. This is the required CI gate and includes types,
formatting, lint, unit tests, and per-library coverage. Run `npm run verify:all` before merging
any change touching routes, components, or rendering. It adds the full Playwright suite.
See [CONTRIBUTING.md](../CONTRIBUTING.md#testing) for the review workflow and
[package.json](../package.json) for the script definitions.

## Choose a test level

| What to check                                                                                                            | Where to check it                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Input validation, weighting and filtering, data invariants, deterministic generation, formatting, codecs, and migrations | Colocated Vitest tests under `src/lib/`.                                                                                                    |
| Composition across generators or the save, edit, and import services                                                     | Vitest through the public entry point with real collaborators. Use the existing IndexedDB test setup where storage is part of the behavior. |
| Route and workshop wiring, controls, save and reopen, downloads, or browser rendering                                    | Playwright specs under `e2e/` against a production build.                                                                                   |
| Coherence, readability, or overall visual quality                                                                        | Inspect representative results and include evidence in the PR.                                                                              |

### Run a subset

```bash
npm run test -- src/lib/potions
npm run coverage:check
npx playwright install chromium
npm run test:e2e:desktop -- potion.spec.ts
npm run test:e2e:mobile
```

Use `npm run test` for the full Vitest suite and `npm run test:e2e` for the full browser
suite on its own. Playwright builds and serves a preview on port 4173. The
[page manifest](../e2e/page_manifest.ts) drives route coverage, and the
[mobile specs](../e2e/pages.mobile.spec.ts) use pinned generation cases to check overflow and
off-screen controls at the configured widths.

The [coverage checker](../scripts/check_library_coverage.ts) enforces 80% line and function
coverage per library. Libraries already below the bar must maintain the recorded floor in the
[coverage baseline](../scripts/library_coverage_baseline.json). Remove a baseline entry when
the library clears the bar. Add tests for missing behavior instead of adding or lowering an
entry. The repository uses mutation testing as a targeted human-run check on individual library
files. See the [testing commands in AGENTS.md](../AGENTS.md#commands).

## Seeds and invariants

Hold both seed and effective settings fixed. Compare two independent rolls to detect dependence
on time or shared state. Assert a domain property separately so the test would fail if both
rolls produced the same invalid result. For example, this combines checks from the
[potion generation tests](../src/lib/potions/potion_generation.test.ts) and
[potion roll tests](../src/lib/potions/potion_roll.test.ts).

```ts
import { expect, it } from 'vitest';
import { generatePotion, getDefaultPotionConfig } from './potion_generation';
import { toPotionSnapshot } from './potion_snapshot';

it('reproduces a linked potion and container', () => {
  const config = { ...getDefaultPotionConfig(), allowedCatalogIds: ['healing'] };
  const first = generatePotion('link-test-seed', config);
  const second = generatePotion('link-test-seed', config);

  expect(toPotionSnapshot(second)).toEqual(toPotionSnapshot(first));
  expect(first.liquid.containerId).toBe(first.container.id);
  expect(first.container.contents).toContain(first.liquid.id);
});
```

Assert literal output when it carries a contract, such as the canonical name of a catalog potion
with variations disabled, an export heading, or a historical payload. For incidental generated
details, assert relationships, allowed values, bounds, or valid references. Different seeds can
legitimately yield the same result. Use a known contrasting pair to exercise variety.

Property-style tests can apply the same invariant across a fixed seed corpus with Vitest
`it.each`. The [region climate tests](../src/lib/regions/region_climate.test.ts) and
[coherence tests](../src/lib/regions/region_coherence.test.ts) use that approach. Choose seeds and
settings that exercise materially different paths, such as defaults, disabled options, rare
branches, edge sizes, and past failures. Keep the seed in the test name or failure message.
Use targeted inputs for rare branches that a seed sweep could miss. For composition, check what
the consumer can rely on, such as linked items and budget bounds in the
[treasure potion tests](../src/lib/treasure/potion_loot.test.ts).

## Review generated output

Inspect output when changing generation rules, prose, visuals, or a user-facing flow whose
quality cannot be reduced to assertions. Lock the seed and record the settings. Cover a common
case, a contrasting case, and any specific edge or failure the change addresses. For the
Potion Generator, use the default toggles and a separate case with Allow Variations. Exercise
reopening or export when the change affects what those surfaces show.

For visual generator PRs, embed representative images in the description. Use the same seeds
and settings for before and after images of existing output. Describe what you checked, such as
legible labels on a dense map or agreement between shown and exported facts. Use the
[renderer scripts](../scripts) or [screenshot capture workflow](visual-design.md) where useful.

## Visual regression tests

The [astronomical preview pixel tests](../e2e/preview_pixels.spec.ts) check structural image
properties. The [golden tests](../e2e/preview_goldens.spec.ts) compare committed images for
the [pinned preview cases](../e2e/preview_fixtures.ts). A missing baseline skips that case.
A layout change above a preview can move its screenshot boundary and affect the comparison.

To refresh an intentional change, dispatch the
[Golden baselines workflow](../.github/workflows/goldens.yaml) on the branch to capture. Review
the generated branch's images before committing the new baselines through a PR. CI uses
SwiftShader for these baselines. Follow the
[renderer instructions](../src/lib/renderers/README.md#regenerating-the-golden-baselines) and
use the CI output for baseline updates.

## Intentional output changes

1. Compare the same seeds and settings before and after the change. Identify which paths change
   and check representative unaffected paths if they should stay stable.
2. Update exact fixtures only for intended differences. Keep or strengthen invariant tests so
   they still catch invalid outputs. Review golden images before accepting replacements.
3. Check old saved snapshots if the tool supports persistence. Reopening should show the saved
   data. An explicit reroll uses the current generator and may differ from a historical roll.
   Test migration separately if the stored shape changes.
4. Give reviewers the seed, settings, expected differences, and relevant compatibility impact.
   Follow [CONTRIBUTING.md](../CONTRIBUTING.md#open-a-review-ready-pr) for the review checklist.
