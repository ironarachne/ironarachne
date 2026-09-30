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
- **`region_artifact_kind.ts`** — kind `region`, payload version 4. Its validator composes the
  culture, settlement, organization and character validators rather than reimplementing them.
- **`region_fact_types.ts`** / **`region_facts.ts`** — the versioned semantic fact vocabulary and
  graph validation. Embedded settlements have region-local IDs; areas, habitats, settlement roles,
  notable places, resources, routes and causal claims cite those IDs or IDs in the saved map.
  Versions 1 and 2 migrate to an empty `legacy` facts container. Version 3 preserves all existing
  facts and adds empty ecology lists; facts are now version 2. Migration preserves the original map, environment and composed snapshots; it does not
  infer missing causes.
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

`RegionFacts` stores only authored or generated facts and their sources. The SVG map is still
derived from the saved `RegionMap` and stays outside the payload.

## Dependent passes

New rolls run physical geography, habitats, ecology inhabitants, resources, habitation, notable places, and presentation
with separate named RNG streams. Name generators are rebuilt from their pattern inputs for
habitation, so their internal RNG does not couple names to geography. Generated semantic facts carry
saved map evidence and versioned rule IDs. See [generation passes](../../../docs/region-generation-passes.md)
for stage responsibilities and the recorded terrain-profile limitation. Existing saved maps and facts
are loaded as written.

## Spatial habitats

The habitat pass derives dominant and secondary habitats from saved dry-land biome cells. Each
habitat retains its complete node footprint, including disconnected patches. Up to four named
connected zones become `RegionArea` facts linked from their habitats. Descriptions report measured
climate and altitude plus observed coasts and rivers; they never alter or regenerate the map.
Zone IDs use the smallest member node ID, and habitat IDs use the biome name; ties and graph
traversal are deterministic. See [spatial habitats](../../../docs/region-habitats.md).

## Settlement sites

The habitation pass records geographic site roles, road routes between stable settlement targets,
and related causal claims without changing saved placements or names. A separate capital role
preserves the seat's identity when settlements are reordered. Rules use observed river/road edges,
coastal ocean access, and suitable grassland or forest cells; unsupported sites retain a land-role
explanation. Loading preserves authored snapshots and facts. See
[geographic settlement sites](../../../docs/region-settlement-sites.md).

## Notable places

The notable-places pass selects a small set of supported natural and inhabited landmarks plus
river, terrain or climate obstacles. Each stores a reason, saved-map anchor, compass location and
suggested adventure hook. The generator, saved view and gazetteer use those stored descriptions.

### Causal overview (#333)

The presentation pass calls `generateRegionOverview` after all semantic passes. It describes the
realized land classification and the two most prevalent habitats, then selects a supported settlement
site cause, a resource, a road connection and a localized hazard. Farming, coastal trade and woodland
access appear only through their recorded settlement rules; richer ecological and livelihood systems
remain optional future inputs. Absent systems and stale facts are omitted. Hazard hooks stay in the
notable section. Wording and selection use the isolated presentation RNG without changing facts.

Opening a snapshot never runs presentation. Saved descriptions, including user edits and intentional
blanks, remain authoritative in the editor and exports.
See [grounded landmarks and hazards](../../../docs/region-notable-places.md).

## Characteristic inhabitants (#335)

`generateEcologyInhabitants` runs on the isolated `ecology-inhabitants` stream after habitats.
It selects up to four major habitats in prevalence order with semantic-ID ties, at most two flora
and three fauna/fantastical inhabitants per habitat, one fantastical inhabitant per habitat and two
distinct fantastical inhabitants overall. Repeated source/role occurrences merge into one saved
fact with sorted habitat IDs; at most twenty distinct inhabitants are generated. No minimum forces
an organism or a fantasy creature into unsupported conditions.

Candidates reuse terrestrial biome vegetation/fauna labels, exact species-name aliases and a small
curated suitability/role table in `region_ecology_rules.ts`. Each supporting cell must satisfy the
biome's temperature, moisture and altitude ranges. Additional rules require compatible species
environments, the shared landform classification and observed freshwater/coastal access as needed.
The same cell must support all conditions; a river in a disconnected unsuitable patch cannot
justify a wet-bank organism. Ecosystem strings contribute saved provenance only when the native
biome label or a curated rule independently supports that candidate. Unknown ecosystem strings
are omitted rather than treating a region-wide list as habitat metadata.

Reasons retain habitat IDs and the actual map/environment observations tested. Species sources
store names, descriptive sources store labels, and neither embeds a catalog entry or creature.
Unknown species names remain readable in saved facts. Loading, JSON export and editing retain
those facts without selecting again. Generic validation checks ecology IDs, roles, sources,
habitats, relationship endpoints, pollination, settlement uses and duplicate relations. The
relationship list is empty on new rolls until #336; display work belongs to #344, regeneration and
structural editing to #347, and named creature-reference integration to #337. See the
[approved ecology model](../../../docs/region-ecology.md).

### Catalog gaps and conservative omissions

The ecosystem generator currently supplies empty organism lists. There is no plant species
registry, and most animal species lack explicit niches, diets and suitability ranges. Native
unknown biome labels stay descriptive with role `other`; only the listed plant metadata and
curated animal rules establish more specific roles. Broad environment labels use a fixed alias
map; no biology is extracted from prose or threat levels. Species with missing/incompatible
metadata are omitted. Unknown biome labels and contradictory local conditions can yield no ecology.

Open-water communities, water lilies, algae, marine ice fauna, mudskippers and oasis-dependent date
palms are omitted until habitat/suitability data supports them. Rules deliberately use coarse
ranges, not scientific range maps. Follow-on catalog work should add reviewed plant identities,
water-specific and seasonal suitability, then explicit relationship metadata for #336. Adding a
rule means defining its role and local evidence requirements, adding a contrast/omission test,
and retaining the existing versioned rule ID for old saves (use a new rule version if semantics
change). Do not force a feeding chain from co-occurrence.
