# Civilizations

This library generates a **civilization** at the largest scale: population, technology level,
government and economy types, and a military. It also models **regions of control** — the unit of
territory a civilization holds, sized to its technology (a bronze-age city-state and a spacefaring
polity do not carve up space the same way).

It also carries the **star nation**: a spacefaring civilization, the territory it holds, and the
star system it calls home — what `/star-nation` generates, stores, edits and prints.

## Features

- **Types** — `Civilization`, `CivilizationGenerationConfig`, `GovernmentType`, `EconomyType`,
  `Military`, `RegionOfControl`, `RegionOfControlGenerationConfig`, and `RegionType`.
- **Generation** — `generateCivilization` with `getDefaultCivilizationGenerationConfig`, plus
  `generateMilitary` and `generateCivilizationName` for the pieces.
- **Description** — `getCivilizationDescription`, `describeMilitary`, and `getFriendlyPopulation`
  (which renders a raw population as something readable).
- **Regions of control** — `generateRegionOfControl` with
  `getDefaultRegionOfControlGenerationConfig`, and the lookups `getRegionTypes`,
  `getRegionTypeByName`, `getRegionTypeByScale`, and `getRegionTypesForTechnologyLevel`.

- **Star nation** — `StarNation` and the `star-nation` artifact kind, in the shape every
  Release-ready tool takes (docs/tool-readiness.md): `rollStarNation` and
  `readStarNationGeneratorConfig` (the one path from a seed), `toStarNationSnapshot` and
  `starNationFromSnapshot` (the codec), `validateStarNationSnapshot` and
  `starNationArtifactKind` (the registration), the `setStarNation*` editing functions, and
  `starNationToMarkdown`, `starNationToText` and `starNationToDocument` (the exports).

## Usage

```typescript
import { RNG } from '@ironarachne/rng';
import {
  generateCivilization,
  getCivilizationDescription,
  getDefaultCivilizationGenerationConfig,
} from '$lib/civilizations';

const config = getDefaultCivilizationGenerationConfig(new RNG('my-seed'));
const civilization = generateCivilization(config);

getCivilizationDescription(civilization);
```

The config carries the `RNG` it was handed along with the ranges the generator samples from
(`population_range`, `technology_level_range`, `military_strength_range`), so narrowing a range is
how you constrain a run. The RNG is a required argument rather than a clock-seeded default, so a
run is reproducible from whatever seed made it:

```typescript
const config = getDefaultCivilizationGenerationConfig(rng);
config.technology_level_range = [7, 9];

const spacefaring = generateCivilization(config);
```

Technology level also decides what kind of territory a civilization can hold:

```typescript
import { getRegionTypes, getRegionTypesForTechnologyLevel } from '$lib/civilizations';

const regionTypes = getRegionTypesForTechnologyLevel(
  civilization.technology_level,
  getRegionTypes(),
);
```

## Star nations

A star nation is rolled from a seed and, optionally, a planet count for the home system:

```typescript
import { rollStarNation, starNationToMarkdown } from '$lib/civilizations';

const nation = rollStarNation('my-seed', { planetCount: 5 });
nation.civilization.name; // 'Republic of Vesh'
nation.homeSystem.planets[nation.homePlanetIndex].name; // the homeworld
starNationToMarkdown(nation);
```

The same seed and config give the same nation, on the page and on a re-roll from a saved
artifact's provenance. The stored shape (`StarNationSnapshot`) is flat: the civilization's fields at
the top level, the regions of control beside them, and the home system embedded as the parameters
the preview renderer takes — never the image it draws. The home system is embedded rather than
referenced because no `star-system` artifact kind exists yet; when one does, the region of control
is where the reference goes.

The description is assembled from the figures when the nation is rolled, and editing a figure
does not rewrite it: `restoreStarNationDescription` rebuilds it on request, and nothing else does.
