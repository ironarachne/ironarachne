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
