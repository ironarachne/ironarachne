# Regions

This library generates a **region**: the largest single thing the site produces in one go. It builds
a map, derives an environment from it, places settlements on the cells best suited to them, runs
roads between those settlements, invents the realms that claim the territory and the organizations
operating in it, and takes its own name and ruler from the realm that holds it.

It is a composition library — nearly all the work belongs to
[`$lib/map`](../map/README.md), [`$lib/environment`](../environment/README.md),
[`$lib/settlements`](../settlements/README.md), [`$lib/realms`](../realms/README.md), and
[`$lib/organizations`](../organizations/README.md) — and its job is to run them in the right order
and pass each one the results of the last.

## Features

- **`Region`** — `name`, `map`, `environment`, `description`, `dominantCulture`, `settlements`,
  `realms` (with `mainRealm` as an index into them), `authority`, and `organizations`.
- **`RegionGeneratorConfig`** — name generators, an optional dominant culture, map dimensions, the
  realm count range, and the `RNG`.
- **`generate`** / **`getDefaultConfig`**.
- **Tile constants** — `terrain_tiles` (`WATER`, `GRASSLAND`, `HILLS`, `MOUNTAINS`, `DESERT`,
  `TUNDRA`, …) and `settlement_tiles` (`VILLAGE`, `TOWN`, `CITY`, `CAPITAL`).

## Usage

```typescript
import { generate, getDefaultConfig } from '$lib/regions';

const config = getDefaultConfig();
config.rng = rng;
config.minRealms = 2;
config.maxRealms = 4;

const region = generate(config);

region.name; // taken from the realm that holds it
region.settlements.length;
region.realms[region.mainRealm];
```

Give the region a culture and everything inside it is named consistently — the culture's name
generators are used in place of the config's own:

```typescript
const config = getDefaultConfig();
config.dominantCulture = culture;

const region = generate(config);
```

Generating a region runs the whole map pipeline, so it is the slowest thing in the codebase. Expect
it to take noticeably longer than any single generator, and do not call it in a loop without
meaning to.
