# Organizations library

This library models **factions and institutions** in world-building: trading companies, wizard schools, mercenary outfits, corpo divisions, and more. It combines the shared [**hierarchy**](../hierarchy/) structure (parent forest + ordered roles), the [**visual identity**](../visual_identity/) model (emblem, colors, motto), and [**characters**](../characters/) (leader and notable members) with per-role **mutations** (titles, age bands, species tweaks).

## What is in scope

- **`Organization` instances** with `id`, `name`, `description`, `profile`, `memberCount`, `visualIdentity`, `hierarchy`, `leader`, `notableMembers`, `relationships`, and metadata `genre` + `kindId`. The structured **`profile`** holds personality traits, goal, weakness, public standing, hook line, and optional **`environmentNarrative`**, all aligned with the composed `description`.
- **`OrganizationKindDefinition`**: a registered kind (e.g. `mercenary_company`) with static hierarchy, mutators, heraldry config, `generateName`, and default size bounds. Flavor and narrative come from `organization_profile.ts` (archetypes per `kindId`), not from the kind module.
- **`generateOrganization(options)`** with control over `genre`, `kindId`, `size`, optional `environment` (from region/simulation), and optional **`worldContext`** (preset or freeform hint; overrides `environment` for environment narrative when both are set).
- **Inter-organization links** via `OrganizationRelationship` (`addRandomRivalryBetweenPairs` for small batches, e.g. region generation).
- **Fantasy** and **science fiction** kind modules under `kinds/fantasy/` and `kinds/science_fiction/`.

## What is out of scope

- Runtime simulation of org economics, turn-by-turn membership changes, or UI rendering of heraldry (use existing heraldry renderers and `visualIdentity.emblem`).
- Multi-parent lattices (the hierarchy model is a **parent forest** only).

## Core types

- **`OrganizationHierarchy`**: `childToParent` + `idToOrder` (larger order = **higher** standing) + `roleById` for display names. Validated in generation.
- **Mutators**: `ReadonlyMap<roleId, (ctx) => Character>` applied **after** `Characters.generate` (typically to push a role title from `createTitleFromCore`).
- **Naming**: each kind’s `namingProfile` in `organization_naming.ts` documents the style; `generateName` provides the name. **Description** is built in `organization_profile.ts` from coherent archetype bundles so traits, goals, weaknesses, and public standing match the paragraph.

## Usage

```typescript
import { generateOrganization } from '$lib/organizations/generate_organization';
import * as Characters from '$lib/characters';
import { RNG } from '@ironarachne/rng';

const rng = new RNG.RNG('my-seed');
const org = generateOrganization({
  rng,
  characterConfig: Characters.getDefaultCharacterGenerationConfig('x'),
  genre: 'fantasy',
  kindId: 'trading_company',
  size: { kind: 'preset', value: 'medium' },
  seedPrefix: 'demo',
});
```

**Registry** (all kinds for one `rng` snapshot, including randomized heraldry templates where applicable):

```typescript
import { getOrganizationKindsForRegistry } from '$lib/organizations/kind_registry';

const kinds = getOrganizationKindsForRegistry(rng);
```

**Convenience lists**:

- `$lib/organizations/fantasy` — `getDefaultOrganizationCharacterConfig`, `listFantasyKindDefinitions`
- `$lib/organizations/science_fiction` — `listScienceFictionKindDefinitions`

**Batch relationships** (optional second pass on co-generated orgs):

```typescript
import { addRandomRivalryBetweenPairs } from '$lib/organizations/organization_relationships';
```

## Adding a new kind

1. Add `kinds/<genre>/<my_kind>.ts` exporting `buildMyKind(rng: RNG): OrganizationKindDefinition`.
2. Use `lineChain` or `flatForest` from `organization_hierarchy_builders.ts` to build a valid hierarchy (or construct maps by hand; then call `assertValidOrganizationHierarchy` in a test).
3. Define `mutators` for **every** role id in the maps; the highest `idToOrder` is the **leader** role.
4. Set `heraldryConfig` via `mergeHeraldryGeneratorConfig` and optional `buildVisualExtras` (e.g. motto).
5. Register the builder in `kind_registry.ts` inside `getOrganizationKindsForRegistry`.
6. Add **archetype entries** for the new `kindId` in `organization_profile.ts` (`ARCHETYPES` map) so generation has hooks, traits, goals, and weaknesses.
7. Add a focused test if the hierarchy or mutator chain is non-trivial.

## Registered kinds (ids)

| id                    | genre           | Notes |
| --------------------- | --------------- | ----- |
| `mercenary_company`   | fantasy         |       |
| `trading_company`     | fantasy         |       |
| `wizard_school`       | fantasy         |       |
| `holy_order`          | fantasy         |       |
| `thieves_guild`       | fantasy         |       |
| `druid_circle`        | fantasy         |       |
| `noble_house`         | fantasy         |       |
| `weavers_collective`  | fantasy         |       |
| `signet_circle`       | fantasy         |       |
| `corporate_division`  | science_fiction |       |
| `sf_mercenary_outfit` | science_fiction |       |
| `research_institute`  | science_fiction |       |
| `smuggler_outfit`     | science_fiction |       |
| `starship_squadron`   | science_fiction |       |
| `colonial_syndicate`  | science_fiction |       |

## Tests

`generate_organization.test.ts` covers a valid `lineChain` and a full mercenary `generateOrganization` run.
