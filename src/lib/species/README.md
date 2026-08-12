# Species

This library defines what a **species** is and provides the operations on species that other
generators need: filtering a list down to what fits a place or a role, breeding two species into a
hybrid, and applying mutators that turn a species into a variant of itself (a skeleton, a zombie, a
vampire).

A species carries everything a creature generator needs to build one of its members: age
categories, a size matrix indexed by gender and age, physical trait configs, abilities, genders, a
threat level, and tags.

## Features

- **`Species`** — `name`/`pluralName`/`adjective`, `breedType`, `environments`, `creatureTypes`,
  `physicalTraitGeneratorConfigs`, `ageCategories`, `sizeGeneratorConfigMatrix`, `abilities`,
  `baseThreatLevel`, `genders`, `commonality`, `tags`, and the optional `carcassBodyPlan` and
  `resourceProductNames` used when butchering one into resources.
- **Selection** — `randomWeighted` (by commonality), `byName`, `byCreatureType`, `byEnvironment`,
  `byAllTags`, `byAnyTag`, and `applySpeciesFilter` for a whole `SpeciesFilter` at once.
- **Breeding** — `breedable`, `breed`, and the averaging helpers behind it
  (`averageAgeCategories`, `averageSizes`, `getCommonEnvironments`, `generateCompositeName`).
- **Variants** — `getSkeletonVariants`, `getZombieVariants`, `getVampireVariants`, and
  `getModifiedVariants` for all of them; the underlying `allMutators` and `getMutatorByName` come
  from [`$lib/mutator`](../mutator/README.md)'s generic machinery.
- **The full list** — `sentient()` and `nonSentient()` return the whole species table already split;
  the raw array is `src/lib/species/all.ts`, which gathers
  [`$lib/species_sentients`](../species_sentients/README.md),
  [`$lib/species_animals`](../species_animals/README.md), and
  [`$lib/species_monsters`](../species_monsters/README.md).

## Usage

```typescript
import { byEnvironment, nonSentient, randomWeighted, sentient } from '$lib/species';

const forestDwellers = byEnvironment('forest', nonSentient());
const species = randomWeighted(forestDwellers, rng);

const peoples = sentient();
```

Filter on several criteria at once with a `SpeciesFilter`:

```typescript
import { applySpeciesFilter, nonSentient } from '$lib/species';

const candidates = applySpeciesFilter(
  {
    withAllTags: [],
    withAnyTag: [],
    withNoTags: ['undead'],
    withCreatureType: 'beast',
    withEnvironment: 'mountain',
  },
  nonSentient(),
);
```

Breeding produces a hybrid species that averages its parents, and refuses pairs that cannot
interbreed:

```typescript
import { breed, breedable } from '$lib/species';

if (breedable(a, b)) {
  const hybrid = breed(a, b);
}
```

The undead variants are generated rather than written out, so adding a species automatically gives
you its skeleton and zombie forms.
