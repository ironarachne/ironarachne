# Regions

This library generates a **region**: the largest single thing the site produces in one go. It generates
an environment and map from shared physical inputs, places settlements on suitable cells, runs
roads between those settlements, invents the realms that claim the territory and the organizations
operating in it, and takes its own name and ruler from the realm that holds it.

It is a composition library — nearly all the work belongs to
[`$lib/map`](../map/README.md), [`$lib/environment`](../environment/README.md),
[`$lib/settlements`](../settlements/README.md), [`$lib/realms`](../realms/README.md), and
[`$lib/organizations`](../organizations/README.md) — and its job is to run them in the right order
and pass each one the results of the last. The semantic passes then save the reasons that connect
geography to habitats, inhabitants, materials, daily life and notable places.

Start with the accepted [Regions release contract](../../../docs/regions-release-contract.md) and
the [data-flow and rule-authoring guide](../../../docs/region-authoring.md) for ownership, evidence,
seed streams, migrations and concrete extension examples.

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
const config = getDefaultConfig(rng);
config.dominantCulture = culture;

const region = generate(config);
```

Generating a region runs the whole map pipeline, so it is the slowest thing in the codebase. Expect
it to take noticeably longer than any single generator, and do not call it in a loop without
meaning to.

## The artifact kind

Only whole-region reroll is supported. Saved field edits retain geometry and authored prose;
settlement edits flag recorded dependent explanations for review. See
[edit consistency](../../../docs/region-edit-consistency.md) for dependencies and the visible
regeneration limits.

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
- **`region_artifact_kind.ts`** — kind `region`, payload version 9. Its validator composes the
  culture, settlement, organization and character validators rather than reimplementing them.
- **`region_fact_types.ts`** / **`region_facts.ts`** — the versioned semantic fact vocabulary and
  graph validation. Embedded settlements have region-local IDs; areas, habitats, settlement roles,
  notable places, resources, routes and causal claims cite those IDs or IDs in the saved map.
  Current facts are version 6, independently of payload version 9. Migration initializes missing
  lists without generating causes; payloads 1–2 receive empty `legacy` facts. See the
  [migration table](../../../docs/region-authoring.md#migrations-and-authored-content) for each
  supported version. Existing map, environment, identities and authored text are preserved.
- **`region_editing.ts`** — pure snapshot-to-snapshot edits over the region's words, its seat, its
  realms, its settlements and its organizations.
- **`region_presentation.ts`** — one gazetteer document shared by the page, saved editor,
  Markdown and PDF text, plus `regionToMapSvg` and `regionMapDataUrl`. Landscape, flora/fauna,
  inhabitants, livelihoods, notable places, travel and hazards reuse saved descriptions; empty
  sections disappear. Generated livelihoods use one representative per settlement/topic and
  supply one per settlement; all authored entries remain. Every saved supporting fact is available
  through the page's expandable explanation links. Stale assertions are marked in all formats.
  Realms (including saved descriptions), settlements and organizations remain in the entry.
  `regionToExportDocument` adds a complete supporting-facts appendix for Markdown, standalone
  PDF text and project PDF publication, including generated entries omitted from the short entry.
  PDF pagination has no fixed page cap. The illustrative map remains a separate SVG rendered
  from the same snapshot; no new map or facts are generated on export. See
  [region export decisions](../../../docs/region-exports.md).

### What is stored, and what is not

The map is stored **as a graph** and never as a picture: `RegionMap` is plain nodes, edges and
corners, and the SVG is a rendering — a rendering cannot be re-themed or re-rendered at another
size, and the graph is smaller than the picture of it besides. A realm's type is stored **by name**
and resolved from the table in [`$lib/realms`](../realms/README.md) on read, the treatment the pass
gives species and archetypes; an unknown name reads back as an inert stand-in rather than a refusal.

A **referenced** culture or settlement is not in the payload at all — `dominantCulture` is `null`
and the settlement is absent from the list — because a reference is by identity, and a region
holding its own copy of something somebody later edits would show the stale one forever.

`RegionFacts` stores authored or generated facts, their sources and explanation status. The SVG
map is derived from the saved `RegionMap` and stays outside the payload.

## Dependent passes

New rolls run physical geography, geology, habitats, ecology inhabitants, resources, habitation,
ecology relationships, processing, livelihoods, supply, notable places, and presentation
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
are stored separately and do not yet contribute complete gazetteer sections. Absent systems and
stale facts are omitted. Hazard hooks stay in the notable section. Wording and selection use the isolated presentation RNG without changing facts.

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
relationship pass runs after settlement site roles. Complete gazetteer display remains #344;
[edit consistency](../../../docs/region-edit-consistency.md) implements #347 with whole-region rerolls
only. Named creature-reference integration remains #337. See the
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

## Ecological interactions (#336)

`generateEcologyRelationships` runs after habitation on `ecology-relationships`, before notable
places and presentation. It uses the same per-cell candidate support as inhabitants, without
rolling or rewriting their saved facts. Source identity and roles select explicit feeding rules;
editable names only supply wording. A heron/crayfish feeding link requires a common supported
freshwater-bank cell. Deer, rabbits and ibex can feed on specific represented browse plants;
a grazer/predator role alone supplies no diet. Disconnected or mutually unsuitable cells in one
habitat cannot establish an interaction.

Reed/papyrus material use and woodland woodwork cite an existing embedded settlement, its current
access role and a suitable organism patch reachable through that same connected dry-land habitat.
A generic land role, a missing settlement, or a named artifact without a resolved site supplies no
access. IDs include the rule, endpoint identities and habitat; candidates are sorted before seeded
selection. Each of at most four major habitats contributes at most two relationships, with at most
six overall. No relationship is required when supporting data is absent.

Browse rules may append a qualitative cold constraint when the supporting cell is at or below
5°C and the saved climate contains a valid named period with a negative temperature adjustment.
The reason cites both that cell and the entire saved climate. Coarse adjustments establish the
cooling direction only; they are never interpreted as a seasonal temperature forecast, annual
flood, breeding event or migration route. Empty, warm-only or malformed periods contribute no
qualification. No calendar, structured seasonal state or new payload version is introduced.

The notable-place pass can reuse a current reed-material relationship and an explicitly supported
alligator/crocodile occurrence at the same gathering patch to produce a bank-gathering hazard.
Its reason cites the relationship, dangerous inhabitant and local observations. This joins the
existing obstacle candidate group, preserving the four-place cap. Fantasy labels and generic
predator roles do not establish hazards. Later livelihood rules (#340) should consume saved
`used-by` links and cite their semantic IDs, rather than reconstructing access or copying organisms.

Competition needs evidence of a specific limited resource, pollination/pests need compatible
organism metadata, and domestication needs more than a wild species occurrence. These are omitted
by the first rule table. Their union variants remain available to authored saves and future
reviewed rules; no interaction is invented to complete a food web. Creature-artifact occurrences
remain outside automatic rule resolution until #337. Reopening/exporting a saved relationship
retains its description, references and seasonal qualification, including author edits.

## Raw resources and geology (#338)

The named `geology` stage follows physical geography. `$lib/environment` generates compatible
rock/process assemblages from saved surface-rock hints, including associated subsurface rocks.
Up to four saved provinces cover dry land exactly once. The established terrain surface draw
pool stays stable; the richer rock vocabulary belongs to these newly generated assemblages.
These provinces are coarse material zones and can group separated patches.

The existing `resources` stage selects at most three deposits per province from
`$lib/resources` occurrence rules. Metal ores, gems, eight raw stone types, industrial minerals,
coal, oil and natural gas have actual generation rules. Each deposit records its province,
material, concentration (`trace`, `workable`, `rich`), exposure and extraction method. Oil/gas
require a complete trapped petroleum setting and the relevant maturity window. Diamond needs
kimberlite and a volcanic-pipe setting; ordinary basalt does not establish a diamond deposit.
These are fictional procedural settings, not measured deposits or reserve estimates.

The inventory selects at most three sources per kind and thirty-nine overall. Trace deposits
remain geological facts but do not become usable resources. Raw biological sources recheck
current saved inhabitants against local habitat support; timber and reed/papyrus/flax stems use
explicit rules, while animal food/materials reuse species-product derivation. Water comes from
actual rivers or lakes, and potential cultivation ground needs suitable land and soil evidence.

Availability distinguishes `available`, `limited`, `not-observed` and `unknown`. The first two
mean potential raw supply; they do not imply safe access, sustainability, purity or extraction
technology. Deep oil/gas remain recorded for later sci-fi consumers without inventing a fantasy
fuel industry. Negative assessments refer to the modeled inventory, not a complete natural survey.
`isUsableRegionResource` identifies positive availability; consumers must also reject stale reasons.

Payload v5 adds empty geology/deposit lists to older saves and gives old resources unknown
availability with empty deposit links. It preserves all existing edits, reasons and map data.
Nothing is generated on read. `setRegionResourceFactText` retains identity and stales dependent
explanations; `removeRegionResourceFact` protects authored dependencies, removes direct generated
links and retains reason-only dependents as stale. Full presentation remains #344; partial
regeneration is unavailable under the implemented
[#347 editing contract](../../../docs/region-edit-consistency.md). See
[the approved resource model](../../../docs/region-resources.md).

## Local processing (#339)

`generateProcessingFacts` uses the isolated `processing` stream after habitation and ecology
relationships. It selects up to three supported craft families and twelve product facts, including
all necessary intermediate steps. Timber construction, reed/papyrus mats, flax linen, charcoal and
bloomery iron tools, preserved animal provisions and dressed stone use the shared qualitative
recipe catalog in `$lib/resources`. Supported flax grows only in the curated temperate grassland
conditions; its stems provide textile fiber, while reeds and papyrus provide matting fiber.

Each product is a possible output at an embedded settlement with a current site role. Its inputs
retain raw-resource IDs, reachable dry-land anchors and the usable deposit subset, or earlier
products at that same settlement. All saved upstream evidence must be current. Trace, deep and
drilling deposits supply no fantasy processing inputs. Requirements explicitly state assumed
tools and facilities; the facts do not assert existing industries, cultivated acreage, workforce,
quantities or sustainable yield. Missing inputs cause omission rather than automatic imports.
Authored inputs can record imports with an explicit resource and explanation.

`resolveProcessingChain(facts, productId)` returns saved steps in dependency order, raw leaves,
imports and diagnostic issues without choosing recipes again. Unknown saved recipe/output keys
remain readable. Source/product text edits stale dependent explanations; removals preserve authored
dependencies. Payload v6 adds `products: []` to older saves, preserving their map, facts and edits.
Daily-life rules use these saved facts; the gazetteer links their supporting explanations. Supply rules
record conditional import suggestions without simulating trade. See the
[approved processing model](../../../docs/region-processing.md), and fantasy catalog follow-ups
[#364](https://github.com/ironarachne/ironarachne/issues/364) and
[#365](https://github.com/ironarachne/ironarachne/issues/365).

## Settlement daily life (#340)

`generateLivelihoodFacts` runs on the isolated `livelihoods` stream after processing. It records
representative livelihoods, food choices, building materials, fuel and household crafts in
`facts.dailyLife`, linked to stable settlement/site IDs and explicit raw-resource or product inputs.
Each settlement has at most three livelihoods, three foods, three building materials, two fuels
and three crafts. Category limits never sever processing chains.

Sources need current positive supply and coarse access through the saved land graph; fish need
actual shore access at the settlement. Geological inputs retain only accessible workable/rich
surface/shallow deposits. Complete same-settlement local chains are required for processed goods;
imports, drilling and missing inputs never become invented local production. Role rule IDs guide
livelihood priority without changing geographic roles or matching editable names.

Cultivation requires freshwater and arable-land facts but invents no named crop. Reed/papyrus stems
can supply thatch; linen needs the saved flax-and-water chain. Representative meat/provisions are
an incomplete food picture, not a complete diet or guaranteed sustainable yield. The current catalog
has no fish carcass subtype, so a controlled catalog fixture tests fishing without fabricating
production data. There is no numerical economy or established commercial industry.

`settlementDailyLifeContext(facts, target)` groups saved facts by category with their inputs and
reasons intact. `describeSettlementDailyLife(facts, target)` composes their stored descriptions,
marking stale support as needing review and leaving empty categories empty. These APIs supply
settlement consumers; the gazetteer selects concise examples and preserves authored text. Text edits, source removals
and settlement removal preserve authored dependencies and stale downstream explanations. Old saves
gain an empty daily-life list without rerolling. See the
[approved livelihood model](../../../docs/region-livelihoods.md).

## Scarcity and possible imports (#341)

`generateSupplyFacts` runs after livelihoods on the isolated `supply` stream. `facts.supply`
stores at most three settlement needs, each qualified as limited local supply or local provision
not supported by the saved inventory and craft policy. The assessment uses all accessible raw
sources and complete possible recipe chains, including products omitted by representative
selection. Limited goods remain explicitly locally producible; imports are conditional
supplementation or necessities if the goods are used, with no invented suppliers or routes.

`settlementSupplyContext(facts, target)` returns saved evidence and authored descriptions.
`describeSettlementSupply({ facts, map }, target)` rechecks support without regenerating saved
facts and replaces stale claims with review notices. Source edits stale supply assessments;
additions change their inventory membership and require stale reasons before persistence.
Existing dependency removal protects authored work. Payload version 8 / facts version 6 adds
`supply: []` to older payloads without inventing scarcity or imports. Gazetteer assembly remains
separate from these library APIs. See [the approved design](../../../docs/region-scarcity.md).

## Extending regional rules

Follow the [authoring guide](../../../docs/region-authoring.md#extend-a-rule) to add a habitat,
resource chain or landmark. Shared environment/resource catalogs define possibilities; regional
passes establish local support and save identity, anchors and reasons. The SVG renderer consumes
the graph and embedded settlement labels; it does not generate facts or validate their causes.

## Region inspection flow (#346)

The standalone route and workshop generator share configuration for the next roll, a displayed
seed recorded with that result, save-to-project controls, and Markdown/PDF/SVG exports. Changing
seed or saved-input selections does not change the provenance of the displayed result. With no
project open, saving offers project creation; the Result Vault leads back to the saved editor.

`RegionMapInspection` provides fit/zoom and a focusable scrolling viewport for keyboard panning
on both generated and reopened snapshots. `RegionExports` exports the currently displayed
snapshot, including unsaved field edits in the editor. Map inspection never edits geography.
The gazetteer offers up to three expandable examples drawn from stored settlement roles,
habitats and resources; all supporting facts remain available below the sourcebook text.
Saved region fields remain editable, with existing stale-evidence notices and reroll confirmation.

## Optional context consumers

`buildRegionCreatureContext(snapshot, habitatId, catalog, regionTargetId?)` projects supported
species and saved ecological roles for `$lib/creatures.generateWithHabitatContext`. It checks
current upstream observations, omits unsupported/flora/described sources and returns an explicit
unavailable result rather than selecting an unrelated creature. `describeRegionCreatureContext`
resolves assignment identities to current, stale or unresolved presentation. See the
[creature-context model](../../../docs/region-creature-context.md) and creatures README example.

`regionMaterialSources` lists saved settlement identities. `describeRegionMaterials(snapshot,
source)` projects current building materials, fuel and crafts through their saved evidence chains,
with source attribution and supply qualifications. It is read-only and claims no geographic
access for a consuming settlement. The workshop resolver checks saved references and loads the
region once; it never follows the source settlement's own material context. See the
[material-context model](../../../docs/region-material-context.md).

Payload version 9 adds a nullable material link to each embedded settlement snapshot. Migration
from versions 1–8 initializes it to `null`; regional facts remain version 6. The second-genre
pilot is [explicitly deferred](../../../docs/region-second-genre.md).
