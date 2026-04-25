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
import { getDefaultCharacterGenerationConfig } from '$lib/characters/character_generation';
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

**Kind filtering for orgs:** `settlement_organizations.ts` uses minimum population gates per `kindId` (e.g. `wizard_school` needs a large town). If no kind passes, the code falls back to any kind that fits the population.

## Tests

`settlements.test.ts`: facet bounds, prosperity monotonicity for commerce, default vs enriched `generate` paths.

## Adding a new size category

1. Add `categories/<name>.ts` exporting a const `SettlementCategory` object.
2. Register it in `settlement_categories.ts` `all()`.
3. Prefer one test covering population bounds for the new name if non-obvious.
