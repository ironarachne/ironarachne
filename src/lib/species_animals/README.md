# Species: animals

This library is the **data table of animals** — bears, bison, blink dogs, capybaras, and a few
hundred others. It holds no logic: each file is one species, exported as a `Species`, and the index
gathers them.

The type and every operation on it live in [`$lib/species`](../species/README.md). This is one of
its three sources, alongside [`$lib/species_sentients`](../species_sentients/README.md) and
[`$lib/species_monsters`](../species_monsters/README.md).

## Usage

Prefer the helpers in `$lib/species`, which work over the combined table:

```typescript
import { byEnvironment, nonSentient } from '$lib/species';

const tundraLife = byEnvironment('tundra', nonSentient());
```

Import from here directly when you want animals specifically — a wilderness encounter that should
not roll up a hobgoblin, for instance.

## Adding an animal

Add a file exporting a default `Species`, and register it in `index.ts`. Beyond the usual fields,
two matter especially for animals:

- **`environments`** is what wilderness and encounter generators filter on, so an animal in the
  wrong environment list will turn up in the wrong places.
- **`carcassBodyPlan`** and **`resourceProductNames`** decide what butchering one yields in
  [`$lib/resources`](../resources/README.md). Set them when the guess from physical traits would be
  wrong.
