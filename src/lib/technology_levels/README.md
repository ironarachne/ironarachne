# Technology levels

This library holds the **technology level ladder** — Stone Age upward — as a small weighted table.
It is what lets a civilization's technology decide the rest of its shape: how much territory it can
hold, what kind of weapons its manufacturers make, what its architecture can attempt.

## Features

- **`TechnologyLevel`** — `name`, `level` (the numeric rung), `description`, and `commonality` (the
  weight used when picking one at random).
- **`getTechnologyLevels`** — the whole ladder.
- **`getTechnologyLevelByLevel`** — look one up by its number.

## Usage

```typescript
import { getTechnologyLevelByLevel, getTechnologyLevels } from '$lib/technology_levels';

const levels = getTechnologyLevels();
const level = getTechnologyLevelByLevel(civilization.technology_level);

level.name; // e.g. 'Iron Age'
```

`getTechnologyLevelByLevel` throws when no rung matches, so treat a miss as bad data rather than an
expected outcome.

Consumers: [`$lib/civilizations`](../civilizations/README.md), whose regions of control are sized by
technology level.
