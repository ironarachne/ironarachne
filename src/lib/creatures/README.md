# Creatures

This library generates a **creature**: a species, gender, and age, a body sized to match, physical
traits, abilities, behaviors, carried items, and relationships. It is the base layer under
[`$lib/characters`](../characters/README.md) — a `Character` is a `Creature` with a name, an
archetype, and titles — and it is what monster and animal generation produces on its own.

A `Creature` is both a `Mob` (so it can be fielded in a group) and a `TaggedItem` (so lists of them
filter with `applyTagFilter`).

## Features

- **`Creature`** — `name`, `description`/`shortDescription`, `species`, `gender`, `age` and
  `ageCategory`, `height`/`weight`/`length`, `abilities`, `behaviors`, `physicalTraits`,
  `creatureTypes`, `carried` items, and `relationships`.
- **`CreatureGenerationConfig`** — the species, age categories, and genders a run may draw from.
- **`generate`** — seeded generation; **`getDefaultCreatureGenerationConfig`** supplies a config that
  allows everything.

## Usage

```typescript
import { generate, getDefaultCreatureGenerationConfig } from '$lib/creatures';

const config = getDefaultCreatureGenerationConfig();
const creature = generate('some seed', config);

creature.species.name;
creature.ageCategory.name;
```

Narrow the run by restricting the config's lists:

```typescript
const config = getDefaultCreatureGenerationConfig();
config.speciesOptions = config.speciesOptions.filter((species) => species.name === 'wolf');
config.ageCategoryNames = ['adult'];

const wolf = generate(seed, config);
```

Size comes from the species' size matrix rather than from this library, so a generated creature's
dimensions stay plausible for what it is.

## Storing a creature

`StoredCreature` (`creature_snapshot.ts`) is a creature with its species written as a name — the
character treatment applied one type up the hierarchy, because a `Creature` embeds a whole
`Species` exactly as a `Character` does and a species is a set of generator tables, not content.
`toStoredCreature` writes one and `validateStoredCreature` checks one; `creature_rehydrate.ts`
reads one back, resolving the name across every species this build has and falling back to
`placeholderSpecies` for one it does not. `placeholderSpecies` moved here from `$lib/characters`
with #54, since a placeholder species is a creature-level concept; `$lib/characters` re-exports it.

The encounter payload (`$lib/encounters`) composes `StoredCreature`; the dungeon (#59) will.

## Optional regional habitat context

The standalone generator keeps its existing seed and settings contract. A caller can opt into
saved habitat support through the regions adapter without creatures importing regions or storage:

```typescript
import { generateWithHabitatContext, getDefaultCreatureGenerationConfig } from '$lib/creatures';
import { buildRegionCreatureContext, describeRegionCreatureContext } from '$lib/regions';
import { nonSentient } from '$lib/species';

const config = { ...getDefaultCreatureGenerationConfig(), speciesOptions: nonSentient() };
const projected = buildRegionCreatureContext(snapshot, habitatId, config.speciesOptions, regionId);
if (projected.ok) {
  const result = generateWithHabitatContext(seed, config, projected.context);
  if (result.ok) {
    const individual = result.creature;
    const context = describeRegionCreatureContext(snapshot, result.assignment);
    // result.reference links the saved region by ID; unsaved regions return no reference.
  }
}
```

Candidates are intersected with configured canonical species, deduplicated and sorted before
weighted selection. Age/gender incompatibility and missing support return explicit failures.
Assignments and presentation are transient; a future saving consumer needs its own approved
codec. This integration adds no standalone creature artifact kind. The broader creatures-library
refactor is separate work. See the [approved design](../../../docs/region-creature-context.md).
