# Names

This library wraps `@ironarachne/made-up-names` in the shape the rest of the codebase wants: a
**`NameGeneratorSet`**, which bundles the six generators a setting needs — culture, country, family,
female, male, and town — so one object names everything that belongs to the same people.

Passing a set around is what keeps a region, its towns, its families, and its people sounding like
they come from the same place. Most generators take a `NameGeneratorSet` rather than individual
generators for exactly that reason.

## Features

- **`NameGeneratorSet`** — a `name` plus the `culture`, `country`, `family`, `female`, `male`, and
  `town` generators.
- **`getFantasyNameGeneratorSet(setName, rng)`** — one set by name (e.g. `'dwarf'`, `'elf'`,
  `'tiefling'`), built from the classic-race pattern sets. It throws, listing the available sets,
  when the name is not one of them.
- **`getAllFantasyNameGeneratorSets(rng)`** — every supported set, for populating a picker.
- **Pattern round-tripping** — `nameGeneratorSetToStoredPatternSet`,
  `nameGeneratorSetFromPatternSources`, and `patternSourceFromNameGenerator` in
  `name_generator_patterns`.

- **`generateLandscapeName(input, context, rng)`** — compounds, epithets, geographic metaphors,
  pronounceable place roots, of-phrases, eligible directions, and occasional cultural names.
  Caller-selected nouns ground literal terrain; exact vocabulary mappings supply compatible
  synonyms. Optional `scope` defaults to `zone`; `region` permits bare roots and broader imagery.
  Immutable batch context tracks exact used names, the last three styles and the last eight
  motif/root identities. Similar roots and repeated imagery are discouraged; exhausted pools
  use a fresh pronounceable root instead of numbered qualifiers. Cultural generators use the
  caller's RNG without consuming live culture generators. Saved results retain their existing
  strings; fresh generation with an old seed uses the new repertoire. See the
  [approved evolution](../../../docs/landscape-name-evolution.md) and
  [review sample](../../../docs/landscape-name-samples.md).

## Usage

```typescript
import { getFantasyNameGeneratorSet } from '$lib/names';

const nameSet = getFantasyNameGeneratorSet('dwarf', rng);

const [personName] = nameSet.male.generate(1);
const [townName] = nameSet.town.generate(1);
const [familyName] = nameSet.family.generate(1);
```

## Persistence

A `NameGenerator` is a live object holding an `RNG`, so it cannot be serialized. To save something
that owns a name set, store its **patterns** instead and rebuild the generators on load:

```typescript
import { nameGeneratorSetFromPatternSources, nameGeneratorSetToStoredPatternSet } from '$lib/names';

const stored = nameGeneratorSetToStoredPatternSet(nameSet);
const restored = nameGeneratorSetFromPatternSources(stored, rng);
```

This is what [`$lib/culture`](../culture/README.md)'s snapshot layer does, and it is why saved
cultures survive a reload with their naming intact.
