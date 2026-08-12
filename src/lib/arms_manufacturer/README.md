# Arms manufacturer

This library generates a **weapons manufacturer** for science-fiction settings: a corporate name, a
description of its outlook and reputation, and a line of weapon models drawn from
[`$lib/weapons`](../weapons/README.md).

## Features

- **`ArmsManufacturer`** — `name`, `description`, and the `models` (weapons) it produces.
- **`generate`** — build a whole manufacturer from an `RNG`.
- **Parts** — `randomName`, `randomOutlook`, and `randomReputation`, exposed individually for
  callers that want one piece rather than a full company.

## Usage

```typescript
import * as RNG from '@ironarachne/rng';
import { generate } from '$lib/arms_manufacturer';

const rng = new RNG.RNG('some seed');
const manufacturer = generate(rng);

manufacturer.name; // e.g. 'Kestrel Dynamics'
manufacturer.models; // the weapons in its catalog
```

The generator takes an existing `RNG` rather than a seed because it is normally called as part of a
larger generation run that already owns one.
