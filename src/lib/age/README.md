# Age

This library models **age categories** — the life stages a creature passes through — as ranges with
a name, a noun to call someone in that stage, and a commonality weight. It is used wherever a
generator needs to pick a plausible age for a character or creature, or to say what to call one.

## Features

- **`AgeCategory`** — `name`, `noun`, `genderedNoun`, `minAge`/`maxAge`, and `commonality` (the
  relative weight used when picking a stage at random).
- **Standard ladders** — `humanStandard()` for people, and `getVariant`/`getHumanVariant` to scale a
  ladder by a species' age modifier so an elf's "young adult" spans more years than a human's.
- **Non-human life stages** — `beastLifespanCat`, `beastLifespanFourStage`,
  `beastLifespanHatchlingAdultFromTwo`, `beastLifespanHatchlingAdultFromFive`, and
  `dragonLifespanTrueWyrm`, re-exported here rather than imported from their own modules.
- **Lookups** — `getCategoryFromAge`, `getCategoryFromName`, `getCategoryList`, `getDescription`,
  and `getMaxAge`.
- **Weighted choice** — `randomWeighted` picks a category from a named subset using `commonality`.

## Usage

```typescript
import { getCategoryFromAge, humanStandard, randomWeighted, type AgeCategory } from '$lib/age';

const categories: AgeCategory[] = humanStandard();

// What life stage is a 34-year-old in?
const stage = getCategoryFromAge(34, categories);

// Pick an adult stage at random, weighted by commonality.
const picked = randomWeighted(['young adult', 'adult', 'middle aged'], categories, rng);
```

For a longer-lived species, scale the ladder instead of writing a new one:

```typescript
import { getVariant } from '$lib/age';

const elfCategories = getVariant(10, humanStandard()); // ten times the human lifespan
```

`getVariant` returns new categories rather than rewriting the ones it is handed, and it never emits
a category whose `maxAge` is below its `minAge`. Both were fixed by #75: it used to assign straight
into the array, which permanently aged any species that passed its own `ageCategories` in, and a
small enough modifier drove a category's scaled `maxAge` below the `minAge` chained from the row
above it, so the ladder came back reading "2 to 1 years".
