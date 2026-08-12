# Species: sentients

This library is the **data table of playable and peopled species** — dwarves, elves, goblins,
tieflings, aarakocra, and the rest. It holds no logic: each file is one species, exported as a
`Species`, and the index gathers them.

The type and every operation on it live in [`$lib/species`](../species/README.md). This is one of
its three sources, alongside [`$lib/species_animals`](../species_animals/README.md) and
[`$lib/species_monsters`](../species_monsters/README.md).

## Usage

Prefer the helpers in `$lib/species`, which work over the combined table:

```typescript
import { byName, sentient } from '$lib/species';

const elf = byName('elf', sentient());
```

Import from here directly when you want this table specifically — a character generator offering
only peopled species, for instance.

## Adding a species

Add a file exporting a default `Species`, and register it in `index.ts`. Fill in every field:
`ageCategories` and `sizeGeneratorConfigMatrix` decide how members are aged and sized,
`physicalTraitGeneratorConfigs` decide what they look like, and `commonality` decides how often the
species is picked at random. A species with a `tags` list also becomes filterable everywhere tags
are used.

Skeleton, zombie, and vampire variants are derived automatically from the mutators in `$lib/species`
— do not write them out by hand.
