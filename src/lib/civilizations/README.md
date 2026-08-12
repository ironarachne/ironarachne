# Civilizations

This library generates a **civilization** at the largest scale: population, technology level,
government and economy types, and a military. It also models **regions of control** — the unit of
territory a civilization holds, sized to its technology (a bronze-age city-state and a spacefaring
polity do not carve up space the same way).

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

## Usage

```typescript
import {
  generateCivilization,
  getCivilizationDescription,
  getDefaultCivilizationGenerationConfig,
} from '$lib/civilizations';

const config = getDefaultCivilizationGenerationConfig();
const civilization = generateCivilization(config);

getCivilizationDescription(civilization);
```

The config carries its own `RNG` along with the ranges the generator samples from
(`population_range`, `technology_level_range`, `military_strength_range`), so narrowing a range is
how you constrain a run:

```typescript
const config = getDefaultCivilizationGenerationConfig();
config.rng = rng;
config.technology_level_range = [7, 9];

const spacefaring = generateCivilization(config);
```

Technology level also decides what kind of territory a civilization can hold:

```typescript
import { getRegionTypesForTechnologyLevel } from '$lib/civilizations';

const regionTypes = getRegionTypesForTechnologyLevel(civilization.technology_level);
```
