# A contributor's tour of Vastways

Start with the [local setup](../README.md#run-locally) and keep the dev server open. This tour
follows the Potion Generator through the code and then extends how it chooses a scent. Use a
scratch branch for the exercises.

## Find your way around

Tools have a catalog path, a standalone route, and a panel on the workshop bench. The route and
panel both mount a Svelte component. The component gathers inputs and shows results. A TypeScript
library does the roll, and a project can keep the result as a local artifact.

| Open                                   | Look for                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------- |
| [`src/routes/`](../src/routes)         | The wrapper for a URL and the shared app shell.                           |
| [`src/components/`](../src/components) | A tool's controls, views, and editors.                                    |
| [`src/lib/`](../src/lib)               | The tool catalog, domain libraries, workshop integration, and unit tests. |
| [`e2e/`](../e2e)                       | Browser flows, including save and reopen, downloads, and mobile layouts.  |
| [`docs/`](.)                           | Designs, contributor guides, and decision records.                        |

## Follow the Potion Generator

Open **All Tools**, choose **Potion Generator**, and generate with **Allow Homebrew** and
**Allow Variations** off. Enter a seed, turn on **Lock Seed**, and generate twice. The result
should repeat. Try the same seed and toggles from the workshop.

1. The [catalog](../src/lib/tools/tool_catalog.ts) lists `/fantasy/potion-generator`. Follow it to
   the [route](../src/routes/fantasy/potion-generator/+page.svelte) or look up the path in
   [`TOOL_PANELS`](../src/lib/workshop/tool_panels.ts). Both mount
   [`PotionGenerator.svelte`](../src/components/objects/PotionGenerator.svelte).
2. In the component, follow `generate()`. It uses the locked seed or draws a new one,
   records both toggles, and calls [`rollPotion`](../src/lib/potions/potion_roll.ts).
3. [`generatePotion`](../src/lib/potions/potion_generation.ts) uses the seed to choose a
   catalog entry and work out its effect, sensory details, and value. It calls the equipment
   library for a container using a child seed. Inspect the returned
   [`Potion`](../src/lib/potions/potion_types.ts). The liquid and container are separate
   records linked by IDs, which the [treasure library](../src/lib/treasure/potion_loot.ts)
   can consume.
4. The component calls [`toPotionSnapshot`](../src/lib/potions/potion_snapshot.ts) and derives
   [`potionToDocument`](../src/lib/potions/potion_presentation.ts) for the result panel.
   Markdown and PDF use the same presentation logic. If you save the potion, the snapshot and
   its roll settings travel together. Reopening it reads the saved data, and the
   [workshop editor registry](../src/lib/workshop/artifact_editors.ts) supplies an explicit reroll.

## Make your first change

Download the Markdown from your locked roll so you have a baseline. In
[`PotionGenerator.svelte`](../src/components/objects/PotionGenerator.svelte), edit the
`description` snippet to say “Generate magical potions, oils, and ointments with sensory details
and SRD-based effects. Lock the seed to repeat a roll.” Reload the standalone tool and check that
the new copy appears. Open the tool on the workshop bench and check it there as well.

Use the same locked seed and toggles you used before. The potion's effect, sensory details, and
exported Markdown should still match. The description is part of the tool UI, so it sits outside
the seeded roll. Run the focused browser spec if Chromium is installed.

```bash
npm run test:e2e:desktop -- potion.spec.ts
```

## Extend the generator

Give air-aspected potions a small scent pool when their catalog entries supply no scent hints.
The Potion of Flying is a convenient example because it has the `air` element and its catalog
entry has color and appearance hints. Explicit scent hints should still use the existing
hint-plus-default pool. Other potions should use the same fallback as before.

1. In [`potion_sensory.ts`](../src/lib/potions/potion_sensory.ts), add a two-entry
   `AIR_SCENTS` constant next to `SCENTS` with `cool mountain air` and `windblown heather`.
2. Change `pickScent` to take `elements: Element[] | undefined` between `rng` and `hints`.
   Replace its pool selection with the following. Keep its existing scent and modifier draws.

   ```ts
   const fallback = elements?.includes('air') ? AIR_SCENTS : SCENTS;
   const pool = hints?.scents?.length ? [...hints.scents, ...SCENTS] : fallback;
   ```

3. In `generateSensoryProfile`, call `pickScent(rng, effect.elements, hints)`.
   The existing effect now guides the scent, just as it guides flavor. The change keeps the
   same number of RNG draws and uses the existing model, save format, and result rendering.
4. Add this inside the existing `describe('generatePotion', ...)` in
   [`potion_generation.test.ts`](../src/lib/potions/potion_generation.test.ts). The catalog
   restriction exercises the intended path on every run.

   ```ts
   it('uses an air scent when an air potion has no scent hints', () => {
     const config = { ...getDefaultPotionConfig(), allowedCatalogIds: ['flying'] };
     const first = generatePotion('flying-scent', config);
     const second = generatePotion('flying-scent', config);

     expect(first.sensory.scent).toMatch(/ (cool mountain air|windblown heather)$/);
     expect(second.sensory).toEqual(first.sensory);
   });
   ```

5. Run `npm run test -- src/lib/potions`. On the Potion Generator page, lock seed
   `potion-tour-3` with both toggles off and regenerate. Check that the scent comes
   from the air pool on screen and in the Markdown download. Compare a Potion of Water
   Breathing with both toggles off and locked seed `potion-tour-33`. It also has the
   `air` element, but its catalog scent hints should keep it on the existing path.

For a real PR, describe the seed and settings for both cases and the intended output change.
An existing saved potion still displays its stored scent. An explicit reroll of a qualifying
potion can now produce a new scent. See [testing](testing.md#intentional-output-changes) for
before and after review, and [CONTRIBUTING.md](../CONTRIBUTING.md#testing) for the full checks.

## Continue contributing

Read the [architecture guide](architecture.md), [generator development guide](generator-development.md),
[design principles](design-principles.md), [code conventions](code-conventions.md), and
[decision records](decisions/README.md) as you work. The
[issue tracker](https://github.com/ironarachne/vastways/issues) is the starting point for finding
a contribution to make.
