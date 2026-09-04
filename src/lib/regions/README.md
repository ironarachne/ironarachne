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
  `dominantCulture` is `Culture | null`: the generator only sets it when a caller supplies one, and
  it used to leave `{} as Culture` behind otherwise — an empty object claiming to be a `Culture`,
  which every reader had to guard against by testing a field for `undefined`.
- **`RegionGeneratorConfig`** — name generators, an optional dominant culture, map dimensions, the
  realm count range, and the `RNG`.
- **`generate`** / **`getDefaultConfig`**. The config helper takes the RNG it should draw from;
  it used to seed both that RNG _and_ its fallback name generator set from the clock, so a caller
  that overwrote the first still got clock-driven names.
- **`rollRegion`** — what most callers want: a seed and the page's settings in, a region and the
  name set it used out.
- **Tile constants** — `terrain_tiles` (`WATER`, `GRASSLAND`, `HILLS`, `MOUNTAINS`, `DESERT`,
  `TUNDRA`, …) and `settlement_tiles` (`VILLAGE`, `TOWN`, `CITY`, `CAPITAL`).

## Usage

```typescript
import { generate, getDefaultConfig } from '$lib/regions';

const config = getDefaultConfig(rng);
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

## The artifact kind

The modules the readiness pass gives every Release-ready tool
([docs/tool-readiness.md](../../../docs/tool-readiness.md)):

- **`region_roll.ts`** — the one path from a seed to a region, taken by the generator page and by a
  re-roll from provenance. It reports the name set it resolved, which is what provenance records; a
  region named from a referenced culture records none, because the culture is what a reader should
  follow to find the names.
- **`region_snapshot.ts`** / **`region_rehydrate.ts`** — the two halves, split because reading
  reaches the culture, settlement, organization and character rehydrators and through their arms the
  charge art. Writing, listing and validating reach none of it. Almost no conversion work is here:
  every part of a region already had a stored form by the time this tool reached the front of the
  pass, which is the whole point of the ordering.
- **`region_artifact_kind.ts`** — kind `region`, payload version 2. Its validator composes the
  culture, settlement, organization and character validators rather than reimplementing them.
- **`region_editing.ts`** — pure snapshot-to-snapshot edits over the region's words, its seat, its
  realms, its settlements and its organizations.
- **`region_presentation.ts`** — the gazetteer, as Markdown and as text, plus `regionToMapSvg` for
  the file and `regionMapSvgMarkup` for the copy the page embeds. The two differ by the XML
  declaration, which is right in a file and parses as a bogus comment inside HTML.

### What is stored, and what is not

The map is stored **as a graph** and never as a picture: `RegionMap` is plain nodes, edges and
corners, and the SVG is a rendering — a rendering cannot be re-themed or re-rendered at another
size, and the graph is smaller than the picture of it besides. A realm's type is stored **by name**
and resolved from the table in [`$lib/realms`](../realms/README.md) on read, the treatment the pass
gives species and archetypes; an unknown name reads back as an inert stand-in rather than a refusal.

A **referenced** culture or settlement is not in the payload at all — `dominantCulture` is `null`
and the settlement is absent from the list — because a reference is by identity, and a region
holding its own copy of something somebody later edits would show the stale one forever.
