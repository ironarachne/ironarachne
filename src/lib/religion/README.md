# Religion

This library generates a **religion**: its category and name, its pantheon and the deities in it,
the divine realms they inhabit, the cosmology of lesser beings between gods and mortals, and — for
traditions that have no gods at all — the spirit ecology and duties that stand in their place.

Its organizing idea is **comparative dimensions**, after Ninian Smart's dimensions of religion:
rather than a bag of unrelated details, a generated religion is described along axes (ritual,
narrative, doctrine, ethics, social, experiential, material) that a reader can compare between
faiths. A religion's category biases those dimensions, so a shamanic tradition and a monotheistic
one come out different in kind, not just in wording.

## Features

- **Types** — `Religion` (name, description, `dimensions`, `cosmology`, `nonTheisticDetail`,
  `realms`, and `pantheon`), `ReligionCategory`, `ReligionGenerationConfig`, plus the dimension and
  complexity types.
- **Generation** — `generateReligion(seed, config)` with `getDefaultReligionGenerationConfig`.
- **Dimensions** — `generateReligionDimensions` and `activeReligionDimensionIdsForConfig`.
- **Cosmology** — `generateReligionCosmology` for the orders of beings around the high gods.
- **Non-theistic traditions** — `generateNonTheisticReligionDetail`, and the helpers
  `isPolytheisticCategory` and `resolvePolytheisticStanding` for deciding how a category treats its
  many-or-one gods.
- **Narrative** — `composeReligionDescription`, `composeReligionOverviewDescription`,
  `composePantheonDescriptionLine`, and `summaryTextForReligionDimension`.
- **Flavour** — `randomGatheringPlace` and `randomGatheringTimes`.
- **Saved religions** — `toReligionSnapshot`/`religionFromSnapshot`, and the storage layer
  (`loadSavedReligionSnapshots`, `saveReligionSnapshots`, `appendSavedReligion`,
  `deleteSavedReligionBySeed`, `readReligionSavePayload`, `writeReligionSavePayload`).

## Sub-directories

`categories/`, `deities/`, `domains/`, `pantheons/`, and `realms/` each own one part of the model —
the category table, deity and pantheon generation, domain sets, and the divine realms. They are
consumed by `religion_generation.ts` rather than exported wholesale, so the index stays a
curated surface rather than everything the library contains.

## Usage

```typescript
import { generateReligion, getDefaultReligionGenerationConfig } from '$lib/religion';

const religion = generateReligion('some seed', getDefaultReligionGenerationConfig());

religion.name;
religion.pantheon?.members.length;
religion.dimensions;
```

Constrain the run through the config — the categories it may pick from, the species its deities may
resemble, the name generators, and `dimensionGeneration` for hard constraints on the dimensions
(where a category's `dimensionHints` only bias them):

```typescript
import * as Categories from '$lib/religion/categories';

const config = getDefaultReligionGenerationConfig();
config.categories = Categories.all().filter((category) => category.hasDeities);
```

Saved religions are keyed by **seed** — `deleteSavedReligionBySeed` — because a religion is
reproducible from its seed and config, and the seed is what a deep link carries.
