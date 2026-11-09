# Generator development

A generator turns a seed and typed settings into structured worldbuilding content. The same roll
can serve a route, a workshop panel, another generator, or an artifact reroll. The
[architecture guide](architecture.md) maps those entry points. The
[design principles](design-principles.md) explain how to choose what the generator produces.

## Lifecycle

1. **Collect and resolve inputs.** The tool component owns controls, default UI settings, and
   seed selection. Its roll adapter converts the options a user can set into library config. For
   example, [`potion_roll.ts`](../src/lib/potions/potion_roll.ts) turns two booleans into the
   config used by [the potion library](../src/lib/potions/potion_generator_config.ts). The full
   config also lets callers restrict the catalog and choose container rules. Validate inputs
   at the boundary and define how impossible combinations are handled.
2. **Roll structured facts.** [`generatePotion`](../src/lib/potions/potion_generation.ts) creates
   an `RNG(seed)`, filters the catalog, chooses an effect and eligible variants, derives sensory
   details, and links the liquid to its container. The potion uses the same RNG for internal
   choices and gives the equipment generator a stable child seed, `${seed}-container`.
3. **Keep models reusable.** [`potion_types.ts`](../src/lib/potions/potion_types.ts) describes
   the liquid, effect, sensory fields, and container. [Treasure hoards](../src/lib/treasure/potion_loot.ts)
   call the public potion API and pack the resulting items using the equipment API. They have no
   dependency on the potion component or its rendered text.
4. **Project the result.** The potion tool converts the roll into a
   [snapshot](../src/lib/potions/potion_snapshot.ts). Its
   [presentation adapter](../src/lib/potions/potion_presentation.ts) builds the document used by
   the screen and exports. Formatting a result should read its facts. If prose is generated,
   compose it during generation and carry the finished text through the snapshot and exports.
5. **Keep the result and provenance together.** Savable tools record the seed and settings from
   the successful roll. Later control edits describe the next roll. The stored payload is what
   the vault reopens and the editor edits. An explicit reroll invokes the same roll path with
   recorded settings, using a config reader that handles older records.

## Place code where it belongs

- Keep generator-specific tables and authored entries in the owning library, such as
  [`potion_catalog.ts`](../src/lib/potions/potion_catalog.ts). Keep types, data, and selection
  logic easy to find. Stable IDs let callers select entries without relying on display names.
- Use shared libraries for domain concepts with their own callers, such as dice, equipment,
  names, ruleset mechanics, and narrative. Share inputs and structured results through public
  APIs. Leave route controls and Svelte state out of the generation interface.
- Keep the browser wiring in the tool component, with a thin route wrapper. For a saved result,
  keep validation, conversions, and any payload migration in the library that owns the kind.
  See [code conventions](code-conventions.md).

## Add a generator

1. Define the user-facing purpose, supported inputs, and model invariants. Follow the repository's
   [design approval process](../AGENTS.md#design-process) if the change qualifies.
2. In the owning library, define the model and config, implement the seeded roll, and expose the
   entry points through `index.ts`. Add focused tests and a library README describing the public
   API. Use an existing generator such as [potions](../src/lib/potions/README.md) as a reference.
3. Add a tool component under `src/components/<domain>/` and a thin route under `src/routes/`.
   Use [`GeneratorPage`](../src/components/layout/GeneratorPage.svelte) and
   [`SeedControls`](../src/components/common/SeedControls.svelte) where appropriate. Make the seed
   visible and let the user lock it. Keep the roll independent of the route or workshop surface.
4. Add a matching `defineTool` entry to [the catalog](../src/lib/tools/tool_catalog.ts) and a
   literal lazy import in [`TOOL_PANELS`](../src/lib/workshop/tool_panels.ts). Use the same path
   in both places and in `GeneratorPage`. Start at `experimental` unless the tool meets a
   higher [readiness level](workshop.md#maturity-levels). The catalog supplies discovery in All
   Tools and the workshop.
5. For a tool that saves, define the snapshot and kind in its owning library and register it in
   the [workshop kind catalog](../src/lib/workshop/artifact_kind_catalog.ts). Use
   [`SaveArtifactButton`](../src/components/common/SaveArtifactButton.svelte). Wire any editor
   and optional roller through [`ARTIFACT_EDITORS`](../src/lib/workshop/artifact_editors.ts).
   Follow the [workshop integration guide](../src/lib/workshop/README.md) for validation and
   storage contracts.
6. Register the route and, where applicable, its generation interaction in
   [`e2e/page_manifest.ts`](../e2e/page_manifest.ts). Verify standalone and workshop use,
   deterministic generation, exports and save/reopen where supported, and mobile controls.
   Follow the [testing guide](testing.md). The [worked example](contributor-guide.md#extend-the-generator)
   takes an existing generator through a small behavior change.

## Extend a seeded generator

For a given implementation and data version, the same seed and effective settings should yield
the same result. Preserve the order and number of draws on existing paths when they should
produce identical results. A changed branch, reordered table, changed weights, or extra draw
can change results even when the seed and settings stay fixed. Keep child seeds stable and
derive new ones from stable inputs when a new independent stage is warranted.

For an optional feature, default older settings to the previous behavior and avoid any new draws
on the disabled path. Compare representative old and new rolls before changing a table or
algorithm. When output is intended to change, document which cases change, test the new contract,
and check that previously saved payloads still open as stored. See
[intentional output changes](testing.md#intentional-output-changes) and
[seed conventions](code-conventions.md#seeded-randomness).
