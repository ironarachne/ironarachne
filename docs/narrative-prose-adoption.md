# Generated prose adoption

**Status:** implementation in progress under the accepted [prose model](narrative-prose.md).

## Current implementation

`src/lib/narrative` implements focused seeded composition, compatible fragment pools, explicit
batch repetition context and sentence/topic budgets. Region land, habitat-zone, habitat and
settlement-role descriptions are the first consumers. They reuse existing generation-stage RNGs,
store prose in existing fields and leave authored/saved descriptions and exports stable.

Landscape adapters omit routine climate, compare only same-biome peers, and supply altitude detail
only when it differs from comparable country. The regional-land entry supplies the overall terrain
context, so every habitat need not repeat it. Settlement roles supply domain-specific sentence
pools; candidate/template selections use explicit context across a stable ordered batch.

These consumers prove the engine, not completion of the application-wide goal.

Region ecology reading paragraphs now use the composer under #395: current local-use,
gathering-hazard and organism relationships supply bounded candidates, with occasional supported
fantastical life. The words and selected evidence are persisted in an existing causal claim.
Population and relationship fact descriptions remain supporting prose; this does not finish their
independent adoption or the other region prose passes.

## Inventory and work items

The baseline inventory searches TypeScript description writers, exported description/narrative
functions, option-pool providers and their callers. Rows group related entry points by domain
owner. Follow each owner's nested helpers and catalog-backed descriptions during adoption; string
assignment alone does not establish whether text is narrative or rules/reference material.

| Owner                                   | Entry points / providers                                                                                     | Adoption work                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regions: landscape and settlement roles | `recordPhysicalFacts`, `generateHabitatFacts`, `generateHabitationFacts`; `region_narrative.ts`              | Implemented initial adapter; retain evidence and vary prose/focus.                                                                                              |
| Regions: other prose                    | `generateRegionOverview`, geology, ecology, resource/deposit, product, livelihood, supply and notable passes | Convert remaining fixed prose; derive important candidates from current facts, preserve opportunities versus established industries.                            |
| Settlements                             | `settlements.ts:describe`, category `possibleDescriptions`, `settlement_narrative.ts`                        | Select defining category and unusual social facets instead of repeating category/property checklists; reuse existing pools.                                     |
| Characters                              | `character_generation.ts:describe`, `describePersonality`, physical-trait descriptions                       | Keep identity, choose distinctive appearance/personality, omit routine measurement lists; preserve pronoun agreement.                                           |
| Families and settlement notables        | `families.ts`, `settlement_notable_mutators.ts`                                                              | Reuse character adapter; pass explicit batch context for relatives and residents.                                                                               |
| Relationships                           | `generateRelationshipDescription`, relationship-type phrase templates                                        | Reuse relationship meaning and compatible person-name templates, avoid repeating the same relation phrasing.                                                    |
| Creatures and mobs                      | `creatures`, `mobs`, regional creature contexts; species physical traits                                     | Separate defining species traits from individual departures; reuse canonical species facts rather than inventing ecology.                                       |
| Species providers                       | `species`, `species_animals`, `species_monsters`, `species_sentients`, `physical_traits`                     | Provide truthful domain-owned variant pools; keep taxonomy and canonical trait/stat definitions stable.                                                         |
| Culture                                 | `culture_generation.ts:describeOrganization`, culture narrative generators                                   | Choose distinctive customs and power relationships rather than list every facet.                                                                                |
| Organizations                           | `composeOrganizationDescription`, `resolveEnvironmentNarrative`, organization/member generation              | Select purpose, unusual relationships and supported local context; preserve existing social/leadership assertions.                                              |
| Realms                                  | realm generation and authority descriptions                                                                  | Focus on government/authority relationships; reuse names and accepted polity facts.                                                                             |
| Religion                                | `composeReligionOverviewDescription`, deity and pantheon generation, comparative summaries                   | Preserve coherent traditions and deity identities; select salient dimensions and relationships instead of exhaustive dimension concatenation.                   |
| Architecture                            | `describeArchitecturalStyle`, `fragmentsForArchitecturalStyle`                                               | Adapt component-owned pools and emphasize signature materials/structures/decorations; distinguish architectural narrative from a complete design specification. |
| Merchants                               | `generateVenueDescription`, honesty notes, haggling advice, merchant character generation                    | Reuse venue/shop-type pools, select useful commercial character; keep mechanical prices and negotiation rules canonical.                                        |
| Environment                             | `environments.ts`, biome description/feature pools, `climates.ts:describe`, `describeTerrain`                | Use compatible climate/terrain fragments; omit routine dimensions and choose meaningful same-type contrasts.                                                    |
| Astronomy                               | star, planet and star-system generation; `getDescriptionFromFeatures`                                        | Preserve scientific facts, select unusual systems/features and supply variant wording; keep spectral classes and numerical tables canonical.                    |
| Civilizations                           | `getCivilizationDescription`, `describeMilitary`, star-nation composition                                    | Choose government/economic/military character without repeating every statistic; preserve established scope and capabilities.                                   |
| Dungeon                                 | room/cavern generation, interactive door/key descriptions                                                    | Domain-owned compatible feature fragments, salient layout/obstacles and bounded sensory detail; keep traversal, key and door mechanics unchanged.               |
| Equipment                               | `descriptor.ts`, item, container and lock generation                                                         | Separate physical narrative from complete item specification and effect/rules text; select distinctive item traits.                                             |
| Weapons                                 | `generator.ts:describe`, weapon-type bases, effect/cosmetic component pools                                  | Retain existing pools and mechanical effects; select meaningful appearance/features without dropping structured rules.                                          |
| Potions                                 | `describePotion`, generated appearance/descriptions, naming                                                  | Select meaningful appearance and magical character; preserve exact effects, durations and delivery mechanics outside narrative selection.                       |
| Treasure                                | art objects, gems and coin piles                                                                             | Distinguish narrative detail from canonical quantity/value; vary supported material/appearance descriptions.                                                    |
| Drugs                                   | `drugs.ts:describe`, effect-type option pools                                                                | Select supported substance character; preserve actual strength/effects in structured output.                                                                    |
| Cuisine                                 | `drink.ts:describe`, strength and quality labels                                                             | Let beverage facets supply compatible options, focusing on distinctive flavor/quality rather than mandatory facet lists.                                        |
| Music                                   | `describeMusicStyle`, instrument/genre data                                                                  | Select defining and distinctive musical qualities from established style data.                                                                                  |
| Arms manufacturers                      | manufacturer generation                                                                                      | Adapt company narrative while retaining product ownership and identities.                                                                                       |
| Spooky ships                            | `spooky_ship_generation.ts`                                                                                  | Reuse supported vessel/haunting facets and compatible narrative pools.                                                                                          |
| Game-system characters                  | AD&D, DCC, SWN, Uncharted Worlds and ruleset descriptors                                                     | Trace which prose is flavor versus canonical abilities/backstory/rules; reuse character adapter where appropriate, with system-specific candidate providers.    |
| Other narrative providers               | age, archetypes, technology levels, resource catalogs                                                        | Treat these as semantic providers or reference text, not automatically as standalone prose generators; add variants through the owning narrative adapter.       |

## Boundaries checked during the inventory

`vault_file`, `legacy_adoption`, `projects`, `pdf`, `calendar`, tool maturity labels, language
presentation, encounter presentation and session-log presentation contain descriptions, formatting
or authored records. Their references and human-authored prose must not be randomized by default.
Catalog definitions in `abilities`, `velgarth_gifts`, SWN character effects and ruleset data also
retain exact rules text. A owning generator can describe their established flavor separately.

Editing/re-description functions must be traced individually: explicit regeneration can compose
new text using a deliberate RNG boundary; merely opening, editing unrelated fields or exporting a
saved artifact cannot silently reroll its description.

## Rollout order and acceptance

1. Finish region adapters, because their factual/evidence contracts and visible narrative problems
   are already established. Verify selection and omission with the pinned contrasting seed bank.
2. Adopt settlement, character and environment providers and their family/merchant/creature
   consumers, keeping batch context explicit.
3. Adopt religion, culture, organizations, realms and civilizations, then architecture and dungeon.
4. Adopt object, treasure, substance, music and astronomy descriptions and remaining system flavor.

Each owner needs meaningful eligibility/omission tests, same-seed and multi-seed checks, grammar
coverage for its compatible templates, and stable saved/exported prose. Numerical extreme alone
is not an eligibility rule. Do not classify a row as complete just because its current prose is
random: it must also honor focus, compatibility and omission. The normal verification and
per-library coverage gates apply; rendering changes need the full browser suite before merging.
