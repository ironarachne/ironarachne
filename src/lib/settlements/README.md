# Settlements library

This library generates **narrative settlements** (hamlets through metropolises) with structured fields for **simulation and UI**: **population**, derived **facets** (law, commerce, food, health), **tags** (e.g. river_trade, highland), and an **economic role** (agrarian, market, industrial, extractive, mixed). It composes the shared [**Environment**](../environment/) model with optional **trade blurbs**, **acute/creeping problems**, **organizations** ([`$lib/organizations`](../organizations/)), and **important characters** ([`$lib/characters`](../characters/)).

## What is in scope

- **`generate(config)`:** picks a `SettlementCategory` from `config.size` (`small` | `medium` | `large` | **`any`**, meaning all categories), rolls population and prosperity, writes a long text `description`, and **always** fills `lawAndOrder`, `commerce`, `foodSecurity`, `publicHealth` (0–10), `settlementTags`, and `economicRole` via `deriveSettlementFacets`.
- **`buildSettlementWithFacets` / `applySettlementEnrichment`:** lower-level steps if you assemble a base settlement yourself.
- **Optional `config.enrichment`:** `includeTrade` (narrative import/export lists + `tradeBlurb`), `includeProblems` (template acute + creeping rows), `includeOrganizations` (calls `generateOrganization` with population-appropriate kind filtering), `importantCharacterCount` (generates adults with `Characters.generate`, then applies civic **notable roles** (titles, archetype, importance text)). Defaults keep enrichment **off** so existing callers do not need character configs.
- **Category data** in `categories/*.ts`: static `SettlementCategory` rows (name, size band, `possibleDescriptions`).

## What is out of scope

- Full economy or resource-simulation (trade strings are **narrative**; no automatic link to [`$lib/resources`](../resources/) yet).
- Pol map placement: optional `location` / `mapNodeId` are set by region generation, not here.

## Saving a settlement

A settlement is an **artifact kind** (`settlement`), which is what took this tool to Release-ready
against the spec in [`docs/workshop.md`](../../../docs/workshop.md). The pieces:

| Module                        | What it is for                                                          |
| ----------------------------- | ----------------------------------------------------------------------- |
| `settlement_artifact_kind.ts` | The kind entry: id, `payloadVersion`, `validate`, `migrate`.            |
| `settlement_snapshot.ts`      | `toSettlementSnapshot` and the stored shapes. The cheap half.           |
| `settlement_rehydrate.ts`     | `settlementFromSnapshot`. The expensive half; see below.                |
| `settlement_roll.ts`          | `rollSettlement` — the one path both the page and a re-roll take.       |
| `settlement_editing.ts`       | One function per field a user may rewrite; each returns a new snapshot. |
| `settlement_presentation.ts`  | The document model behind the Markdown and PDF exports.                 |

### What is not plain data, and what happens to it

A settlement borrows from `$lib/characters`, `$lib/organizations`, and `$lib/heraldry`, and three
things it borrows are not storable as they stand. Each is converted by name rather than stripped,
so the round trip is lossless:

- **An organization's hierarchy is three `Map`s.** `JSON.stringify` turns a `Map` into `{}` without
  complaining, which would have emptied every organization's structure silently. Stored as entry
  arrays.
- **A coat of arms carries a render function.** `arrangement.renderSVG` sits on every charge group,
  and `structuredClone` — what IndexedDB stores with — refuses a function outright. Stored the way
  the heraldry kind stores arms, by the names of the parts, and rebuilt through
  `$lib/heraldry`'s `armsFromStored`.
- **An archetype carries its own equipment tables.** `equipmentGenerationConfigs` is 66 KB per
  character, measured, and it is what a character was rolled _from_ rather than anything about the
  character. Dropped and rebuilt from the archetype's name: kept, one enriched settlement is a
  megabyte, and a campaign accumulates settlements. An archetype this build no longer has comes
  back with no tables rather than throwing — the tables are only used to re-equip somebody, which a
  saved settlement never does.

That last pair is why reading is split out of `settlement_snapshot.ts`: rebuilding reaches
`$lib/charges` (18 MB of glyph art) and the archetype tables, and validating or listing a
settlement needs neither.

### Sixteen shapes of one kind

`enrich_settlement.ts` is opt-in four times over, so a settlement generated with enrichment and one
generated without are different shapes of the same kind — sixteen legitimate combinations in all.
The validator accepts every optional layer when absent and checks it when present, which is what
makes a payload written by a build with different enrichment defaults readable rather than
quarantined. The editor renders each layer only when the settlement has it, so a settlement with no
notables looks like what it is rather than like one that lost them.

## Core types

- **`Settlement`:** `name`, `description`, `category`, `population`, `prosperity`, `environment`, optional `location` / `mapNodeId`, always-present facets and tags, plus optional `primaryImports`, `primaryExports`, `tradeBlurb`, `acuteProblems`, `creepingProblems`, `organizations`, `importantPeople` (civic `SettlementImportantPerson` records with `importance` and salient trait lists).
- **`SettlementEnrichmentConfig`:** toggles and count ranges; see `settlement_types.ts`.
- **`SettlementProblem`:** `{ kind: 'acute' | 'creeping', summary, detail? }` from template tables in `settlement_problems.ts`.

## Usage

**Basic (facets + description only):**

```typescript
import * as Settlements from '$lib/settlements';
import { RNG } from '@ironarachne/rng';

const rng = new RNG('world-seed');
const config = Settlements.getDefaultConfig(rng);
const settlement = Settlements.generate(config);
// settlement.lawAndOrder, settlement.settlementTags, settlement.economicRole, …
```

**With enrichment (trade, problems, one org, one notable):**

```typescript
import * as Settlements from '$lib/settlements';
import { getDefaultCharacterGenerationConfig } from '$lib/characters';
import { RNG } from '@ironarachne/rng';

const rng = new RNG('rich-seed');
const base = Settlements.getDefaultConfig(rng);
const settlement = Settlements.generate({
  ...base,
  enrichment: {
    seedPrefix: 'demo',
    includeTrade: true,
    includeProblems: true,
    includeOrganizations: true,
    importantCharacterCount: { min: 1, max: 2 },
    characterConfig: getDefaultCharacterGenerationConfig('demo-chars'),
    genre: 'fantasy',
  },
});
```

**Kind filtering for orgs:** `settlement_organizations.ts` uses minimum population gates per `kindId` (e.g. `wizard_school` needs a large town). If no kind passes the full filter, the code relaxes economic-role and size constraints but still respects the requested `genre`. When nothing fits, org generation returns an empty list.

## Rolling one

`rollSettlement(seed, config)` is the entry point the generator page and the artifact re-roll both
use, and having exactly one is what makes requirement 2.2 true: a seed plus a
`SettlementGeneratorConfigRecord` determine the settlement. It returns the resolved
`nameGeneratorSet` alongside the settlement, because a roll may draw a pattern set itself and
provenance has to record what was used rather than what was asked for — "any set" stored as
provenance would make a re-roll a fresh draw rather than the same place again.

A settlement built around a saved culture records that culture's **pattern set name**, not its id.
That is what lets a re-roll produce names of the same tongue without reaching back into the store
for an artifact it has no way to ask for, and it is the same bargain `$lib/religion` makes.

```typescript
import { rollSettlement } from '$lib/settlements';

const { settlement, nameGeneratorSet } = rollSettlement('greyhaven', {
  size: 'large',
  includeProblems: true,
  includeNotables: true,
});
```

## Exporting one

`settlementToDocument` arranges a settlement for reading, and the Markdown and plain-text renderers
are written over that one model. Empty sections are dropped there, once, rather than in each
renderer — which matters more here than anywhere else on the site, because the plainest settlement
the generator makes would otherwise print four bare headings.

A referenced religion is passed in rather than read off the settlement: the payload holds no copy
of one, only the artifact's link, so `settlementToMarkdown(settlement, { religion })` is how a
caller that has resolved the link gets a Faith section.

## Tests

`settlements.test.ts`: facet bounds, prosperity monotonicity for commerce, default vs enriched `generate` paths.
`settlement_snapshot.test.ts`: the round trip, enriched and unenriched, and each of the three
conversions above.

## Adding a new size category

1. Add `categories/<name>.ts` exporting a const `SettlementCategory` object.
2. Register it in `settlement_categories.ts` `all()`.
3. Prefer one test covering population bounds for the new name if non-obvious.
