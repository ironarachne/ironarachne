# Encounters library

Procedural **encounter** definitions: reusable **group templates** (how to roll mobs) and **encounter templates** (named compositions plus tags for filtering).

## Public API

Re-exported from [`index.ts`](./index.ts):

| Export                                                                                         | Role                                                                 |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `getAllFantasyEncounterTemplates()`                                                            | All fantasy encounter templates for UI, dungeons, or custom configs  |
| `allTemplates()`, `getGroupTemplateByName(name)`                                               | Registry of group templates                                          |
| `generateEncounter(seed, config)`                                                              | Builds an [`Encounter`](./encounter_types.ts) from a chosen template |
| Types: `Encounter`, `EncounterTemplate`, `EncounterGroupTemplate`, `EncounterGenerationConfig` | Shape of data and config                                             |

## Data model

### `EncounterGroupTemplate`

A single mob **band**: archetype constraints, species constraints, counts, sentience, optional species mutators (undead templates, etc.). Defined in [`encounter_group_templates.ts`](./encounter_group_templates.ts).

- **`isSentient: true`**: each mob is a **character**; archetypes come from [`getFantasyCombatArchetypes()`](../archetypes/fantasy_archetypes.ts), species from [`sentient()`](../species/common.ts) filtered by `speciesTagFilter`.
- **`isSentient: false`**: each mob is a **creature**; species come from [`nonSentient()`](../species/common.ts) filtered by `speciesTagFilter` (empty filter = any non-sentient species).

**Species filters use `species.tags` only**, not `creatureTypes`. For example many beasts have `creatureTypes: ['beast']` but no `'beast'` entry in `tags`; a filter like `{ includeSomeTags: ['beast'] }` would match nothing unless species data adds that tag.

### `EncounterTemplate`

A **named encounter**: ordered list of group templates (each sub-encounter group) and a **`tags`** array used by consumers such as the dungeon generator. Defined in [`encounter_templates.ts`](./encounter_templates.ts).

### `Encounter` (output)

[`generateEncounter`](./encounter_generation.ts) picks one `EncounterTemplate` from `config.possibleTemplates`, instantiates each group into a [`MobGroup`](../mobs), and returns `{ name, description, difficulty, groups }`. `description` and `difficulty` are still placeholders (TODO in code).

## Dungeon theme filtering

[`buildTheme`](../dungeon/theme/theme.ts) sets `encounterTags` from blueprint tags plus the biome name. The dungeon [`generator`](../dungeon/generator/generator.ts) filters `getAllFantasyEncounterTemplates()` with [`applyTagFilter`](../tags/tags.ts) so that **at least one** encounter template tag overlaps the theme. If nothing matches, it falls back to **all** templates.

When adding encounters, give them tags that appear in [`BLUEPRINTS`](../dungeon/theme/theme.ts) (`undead`, `humanoid`, `military`, `magic`, `beast`, `monstrosity`, `cave`, etc.) so themed runs stay varied.

## `EncounterGenerationConfig`

- **`possibleTemplates`**: pool to draw from (often filtered externally).
- **`speciesOverride`**: force a single species for every **sentient** group (species filter replaced with that species name).
- **`forceUniformSpecies`**: if `true` (e.g. fantasy encounter page), the generator intersects compatible species across **all** groups using **`sentient()` only** for that intersection step.

Because of that, **do not mix sentient and non-sentient groups** in one encounter template. Uniform-species mode can fail or behave badly for those mixed compositions. Creature-only encounters (ghouls, wolves, spiders, …) are fine on their own.

## Extending the library

1. **New combat role**: add an archetype under [`getFantasyCombatArchetypes()`](../archetypes/fantasy_archetypes.ts), then reference its tags in `archetypeTagFilter`.
2. **New humanoid “monster” type** (zombie-like): add a [`species` mutator](../species/mutators.ts) if needed, then a group template with `speciesMutators` and appropriate filters (see existing zombie / skeleton / vampire patterns).
3. **New creature packs**: confirm target species expose the tags you use in `speciesTagFilter`, or leave the filter empty for generic non-sentient pulls.

## File map

| File                                                             | Purpose                                        |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| [`encounter_types.ts`](./encounter_types.ts)                     | Type definitions                               |
| [`encounter_group_templates.ts`](./encounter_group_templates.ts) | Group template registry                        |
| [`encounter_templates.ts`](./encounter_templates.ts)             | Fantasy encounter compositions                 |
| [`encounter_generation.ts`](./encounter_generation.ts)           | `generateEncounter` / `generateEncounterGroup` |
| [`encounter_templates.test.ts`](./encounter_templates.test.ts)   | Smoke tests for template graph and generation  |

## Saving an encounter

The generator is Release-ready (issue #54), which means a rolled encounter can be kept:

- `encounter_snapshot.ts` — the stored form. **The payload holds the resolved groups, never the
  template that produced them**: an `EncounterGroupTemplate` is three arrays of mutator functions
  and two tag filters, and what they produced is in the creatures. Each mob is stored as a
  `StoredCharacter` (from `$lib/characters`) or a `StoredCreature` (from `$lib/creatures`), with a
  `mobKind` saying which; species and archetypes travel as names.
- `encounter_rehydrate.ts` — the stored form back into an `Encounter`. Nothing is recomputed; a
  species or archetype this build no longer has becomes an inert placeholder rather than a refusal.
- `encounter_artifact_kind.ts` — the `encounter` kind. Validation of each mob is delegated to the
  vocabulary type's own validator rather than copied.
- `encounter_roll.ts` — the single path from a seed and the page's two controls (template, uniform
  species) to an encounter, and the provenance record a re-roll reads back.
- `encounter_editing.ts` — one function per field, each returning a new snapshot: the encounter's
  name, a group's name, a combatant's name, and removing either. Species and archetype are not
  edited; changing them is what a re-roll is for.
- `encounter_presentation.ts` — the encounter as a document, and the Markdown and PDF exports
  written from it. The generator's empty description and zero difficulty are dropped rather than
  printed as a blank paragraph and "Difficulty: 0".

The environment reference the design describes (5.1) waits on the `environment` kind (#60); until
it lands no input of this tool has an artifact kind, and the tool works with nothing supplied (5.3).

This tool implements no game system, so there is no edition to name: the templates, archetypes and
species are this site's own.
