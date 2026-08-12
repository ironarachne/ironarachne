# Species: monsters

This library is the **data table of monsters**, grouped into subdirectories by kind: `demons/`,
`dragons/`, `elementals/`, `monstrosities/`, `oozes/`, and `undead/`. It holds no logic — each file
is one species, exported as a `Species`, and each group's index gathers its own.

The type and every operation on it live in [`$lib/species`](../species/README.md). This is one of
its three sources, alongside [`$lib/species_sentients`](../species_sentients/README.md) and
[`$lib/species_animals`](../species_animals/README.md).

## Usage

Prefer the helpers in `$lib/species`, which work over the combined table:

```typescript
import { byCreatureType, nonSentient } from '$lib/species';

const dragons = byCreatureType('dragon', nonSentient());
```

Import a group directly when you want that kind specifically:

```typescript
import * as Dragons from '$lib/species_monsters/dragons';
```

## Adding a monster

Add a file exporting a default `Species` in the right group, and register it in that group's index.
`baseThreatLevel` is what encounter building reads to keep a fight at the intended difficulty, and
`abilities` is where a monster's distinguishing powers go.

Dragons carry their own size and age ladders (`dragonTrueWyrmSizeMatrix` in
[`$lib/size`](../size/README.md), `dragonLifespanTrueWyrm` in [`$lib/age`](../age/README.md)),
because a wyrmling and a true wyrm differ by orders of magnitude rather than by a modifier.
