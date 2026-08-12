# Size

This library decides **how big a creature is**. The core idea is the **size matrix**: a species does
not have one size, it has a size per gender per age category, so a juvenile female dragon and an
adult male one are both handled by the same lookup rather than by special cases.

## Features

- **`Size`** — `height`, `weight`, `length`, and `mass`.
- **`SizeGeneratorConfig`** — the min/max bounds for each of those, i.e. one cell of the matrix.
- **`SizeMatrix`** — rows by gender, each holding entries by age category name, each entry a
  `SizeGeneratorConfig`. `SizeAgeSummary` is the flattened, display-ready form.
- **Lookup** — `getSizeConfig(genderName, ageCategoryName, matrix)`.
- **Generation** — `generate(seed, config)` rolls an actual `Size` within a config's bounds.
- **Standard ladders** — `humanStandard()`, `getHumanVariant(weightModifier, heightModifier)` for
  scaling it, and `dragonTrueWyrmSizeMatrix()` for the dragons.
- **Display** — `getHeightRange` and `getWeightRange` (both render metric and imperial), and
  `convertMatrixToSummary`, which flattens one gender's rows against an age ladder.

## Usage

```typescript
import { generate, getSizeConfig } from '$lib/size';

const config = getSizeConfig(gender.name, ageCategory.name, species.sizeGeneratorConfigMatrix);
const size = generate(seed, config);

size.height;
size.weight;
```

For a new species that is human-shaped but bigger or smaller, scale the standard matrix rather than
writing a new one:

```typescript
import { getHumanVariant } from '$lib/size';

const goliathMatrix = getHumanVariant(1.6, 1.3); // heavier and taller
```

Showing the whole range on a species page:

```typescript
import { convertMatrixToSummary } from '$lib/size';

const rows = convertMatrixToSummary(
  species.sizeGeneratorConfigMatrix,
  species.ageCategories,
  'female',
);
```

Age categories come from [`$lib/age`](../age/README.md), and the two must agree: a matrix entry is
keyed by age category **name**, so a species' matrix and its age ladder need matching names.
