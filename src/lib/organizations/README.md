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
import { generateOrganization } from '$lib/organizations';
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
import { getOrganizationKindsForRegistry } from '$lib/organizations';

const kinds = getOrganizationKindsForRegistry(rng);
```

**Convenience lists**:

- `$lib/organizations/fantasy` — `getDefaultOrganizationCharacterConfig`, `listFantasyKindDefinitions`
- `$lib/organizations/science_fiction` — `listScienceFictionKindDefinitions`

**Batch relationships** (optional second pass on co-generated orgs):

```typescript
import { addRandomRivalryBetweenPairs } from '$lib/organizations';
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

## Two registries, not one

This library's **kind registry** (`kind_registry.ts`, `Organization.kindId`, values like
`mercenary_company` and `noble_house`) says what sort of organization one is. The site's
**artifact kind registry** (`$lib/artifact_kinds`, `ArtifactKind`, the value `organization`) says
what sort of payload a saved artifact holds. They predate each other in opposite directions and
mean different things; in code they stay `kindId` and `ArtifactKind`.

## Saving an organization

The generator is Release-ready (issue #56), which means a rolled organization can be kept:

- `organization_snapshot.ts` — the stored form, `StoredOrganization`, declared here since #56 (it
  lived in `$lib/settlements`, which now composes it). The hierarchy's three `Map`s travel as entry
  arrays, the leader and notable members as `StoredCharacter`, and the visual identity as
  `StoredVisualIdentity` from `$lib/visual_identity` — **imagery as parameters, never as a
  rendered SVG**. `kindId` was already the right shape: the kind's closures never reached the
  payload.
- `organization_rehydrate.ts` — the stored form back into an `Organization`. Nothing is recomputed.
- `organization_artifact_kind.ts` — the `organization` kind. Each person is validated by the
  character kind's own validator; referenced arms (`arms: null`) are accepted.
- `organization_roll.ts` — the single path from a seed and the page's five controls to an
  organization, and the provenance record a re-roll reads back. A kind or name set this build no
  longer has is substituted and reported.
- `organization_editing.ts` — name, description, motto, palette, the profile's traits, goal,
  weakness, standing and hook, and each person's names and line. Changing a facet does not rewrite
  the description composed from it.
- `organization_emblem.ts` — the emblem drawn from its stored parameters, whichever kind, and a
  sentence about it for text that cannot carry a picture.
- `organization_presentation.ts` — the sheet as a document, and the Markdown and PDF exports.

The organization can be named from a saved culture and bear a saved coat of arms, both recorded as
artifact references (5.1). A saved character as leader is not offered: the leader is shaped by the
kind's role mutators, and a character rolled elsewhere would not fit the role.
