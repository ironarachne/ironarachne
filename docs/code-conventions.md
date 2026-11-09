# Code and generator conventions

[CODE_STYLE.md](../CODE_STYLE.md) covers implementation style. Use the repository's formatter
and linter for formatting and syntax rules. The conventions here concern ownership and behavior.

## Modules and public interfaces

- Put one concept in each library directory. Use `snake_case` for directories and TypeScript
  filenames, `camelCase` for functions, and PascalCase for types and Svelte component filenames.
  Keep substantial domain types alongside the implementation in a types module.
- Cross a library boundary through its `index.ts`. For example, treasure imports
  `generatePotion` from `$lib/potions`. Within potions, use relative imports for sibling
  modules. [The import contract](../CODE_STYLE.md#importing-a-library) describes exceptions
  for assets and code splitting. The [import tests](../src/lib/library_imports.test.ts) enforce it.
- Give public functions typed inputs, stable identifiers where callers need identity, and explicit
  result shapes. Use a discriminated union for genuinely different cases. For example,
  [`PotionEffectParameters`](../src/lib/potions/potion_types.ts) uses `kind` to separate healing
  dice, resistance damage types, and spell parameters.
- Model user settings separately from internal generator configuration and persisted payloads.
  Keep the adapter and compatibility policy with the owning library. Read boundary data as
  unknown and validate it before use. [Artifact kinds](../src/lib/artifact_kinds/README.md)
  describe how stored versions are validated, decoded, and migrated.

## Error handling

Choose an error shape that fits the caller. An ordinary absence can be optional, as when an
artifact disappears before the editor opens. Expected, actionable failures should carry a
reason the caller can handle, as in the workshop's
[artifact save result](../src/lib/workshop/artifact_saving.ts). An impossible request to a
generator can fail explicitly. For example, [potion generation](../src/lib/potions/potion_generation.ts)
throws when filters match no catalog entries and homebrew is disabled. Test the failure as well
as the valid path.

At the UI boundary, surface failures where the user can act on them. In a stored config reader,
default missing or invalid settings deliberately and document the behavior. See
[`readPotionGeneratorConfig`](../src/lib/potions/potion_roll.ts) for an example that accepts
actual booleans and defaults older or malformed values.

## Seeded randomness

- Use `@ironarachne/rng` for every random draw. Seed a public generator from its explicit
  `seed: string` and pass its `RNG` to internal helpers. A helper that is always part of the
  caller's roll can take `rng: RNG` directly.
- For a public child generator that owns its own RNG, derive the child seed from the caller's
  seed or RNG. [Potion generation](../src/lib/potions/potion_generation.ts) uses a stable
  container suffix. The [treasure generator's potion helper](../src/lib/treasure/potion_loot.ts)
  draws one child seed for each attempt. Preserve those derivations if existing rolls should
  stay stable.
- Keep clocks, ambient randomness, mutable global state, and UI events out of the seeded path.
  A component can seed a separate RNG to offer fresh seeds. With a locked seed, the roll uses
  the entered seed. Defaults and presentation should be stable for the same inputs.
- Keep eligible tables in a deliberate order. Extra draws, changed weights, reordered choices,
  and changed filters can affect downstream results. Treat them as changes to output and follow
  the [testing guide](testing.md#intentional-output-changes).

## Data, generation, and presentation

Keep tables and authored reference data close to the owning model. Put filtering, weighted
selection, constraints, and dependent choices in the generation layer. Derive related fields
from the same facts. In potions, the effect helps determine the sensory profile, and the container records the liquid's ID and the liquid records the container's ID.

Compose through public models and APIs. Pass only the context a child generator needs. Use
[the narrative composer](narrative-prose.md) for new or revised generated prose. Render and
export from the generated facts or saved snapshot. Formatting, component rendering, and
exports should neither reroll content nor infer new facts.

## Components and tests

Import Svelte components through `$components` and keep the domain directories one level deep.
Put shared controls in `common/`. Use accessible labels and shared controls for seed handling.
Keep results in a serializable shape before passing them to the save framework. For example,
[`PotionGenerator.svelte`](../src/components/objects/PotionGenerator.svelte) holds the snapshot
in `$state.raw`, so IndexedDB receives ordinary data. The component records roll settings
separately from the live controls.

Put Vitest specs beside the owning source as `*.test.ts`, usually using the module's basename.
Name tests for the behavior or invariant they protect. Use Playwright specs in `e2e/` for browser
behavior and real user flows, with descriptive names such as `potion.spec.ts`. See
[testing](testing.md) for the seed, coverage, and output-review practices.
