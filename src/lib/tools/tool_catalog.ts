import { applyTagFilter } from '$lib/tags';
import type { TagFilter } from '$lib/tags';
import { defineTool, genreTag, maturityTag, systemTag } from './tools';
import type * as ToolTypes from './tool_types';

/**
 * Every user-facing tool on the site, in domain order. This is the single source of truth for what
 * a tool is called, where it lives, and what it is for; the workshop's tool browser and the home
 * page's featured list are both built from it.
 *
 * Genre and system are both optional. A tool that works for any genre (the environment
 * generator) or any system (the culture generator) carries no such tag, rather than a
 * catch-all value.
 *
 * Maturity is not optional, and the value here is an assessment rather than an aspiration: it is
 * what the tool measures at against the readiness spec in `docs/workshop.md` today. Almost every
 * entry reads `experimental`, which is the honest state of a site whose tools mostly predate the
 * workshop and cannot yet save what they produce. Raising one is part of taking that tool to the
 * next level, not a separate tidy-up.
 */
export const TOOL_CATALOG: ToolTypes.Tool[] = [
  // Characters & People
  defineTool({
    path: '/fantasy/adnd/character/build',
    label: 'AD&D 2E Character Builder',
    kind: 'editor',
    domain: 'characters',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/adnd-character.md (#45). It is also the editor `ARTIFACT_EDITORS` mounts for
    // `character.adnd-2e`, so editing a saved character and building a new one are the same tool.
    maturity: 'release-ready',
    genres: ['fantasy'],
    systems: ['adnd-2e'],
    tags: ['character'],
  }),
  defineTool({
    path: '/character',
    label: 'Fantasy Character',
    kind: 'generator',
    domain: 'characters',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/fantasy-character.md (#46). It saves as the unqualified `character` kind, has an editor
    // in `ARTIFACT_EDITORS`, composes a naming culture and a coat of arms by reference, and exports
    // Markdown and PDF. Its roll is deterministic from the seed — the clock left the generation
    // path with `character_roll.ts`, which is what 2.2 was failing on before.
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/adnd/character',
    label: 'AD&D 2E Character',
    kind: 'generator',
    domain: 'characters',
    // Release-ready, assessed with the builder it shares a kind with (#47, docs/adnd-character.md).
    maturity: 'release-ready',
    genres: ['fantasy'],
    systems: ['adnd-2e'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/dcc/character',
    label: 'Dungeon Crawl Classics Character',
    kind: 'generator',
    domain: 'characters',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-characters.md (#48). It saves as `character.dcc` — one artifact per
    // character, which is what makes a funnel survivor openable on their own — has an editor in
    // `ARTIFACT_EDITORS`, composes a naming culture by reference, and exports a PDF sheet and
    // Markdown. Its roll is deterministic from the seed via `dcc_character_roll.ts`.
    maturity: 'release-ready',
    genres: ['fantasy'],
    systems: ['dcc'],
    tags: ['character'],
  }),
  defineTool({
    path: '/swn/character',
    label: 'Stars Without Number Character',
    kind: 'generator',
    domain: 'characters',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-characters.md (#49). It saves as `character.swn`, has an editor in
    // `ARTIFACT_EDITORS`, composes a naming culture by reference, and exports a PDF sheet and
    // Markdown. Its roll is deterministic from the seed via `swn_character_roll.ts`.
    maturity: 'release-ready',
    genres: ['scifi'],
    systems: ['swn'],
    tags: ['character'],
  }),
  defineTool({
    path: '/unchartedworlds/character',
    label: 'Uncharted Worlds Character',
    kind: 'generator',
    domain: 'characters',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-characters.md (#50). It saves as `character.uncharted-worlds` — rulebook rows
    // by name, so a corrected description reaches a character saved last month — has an editor in
    // `ARTIFACT_EDITORS`, composes a naming culture by reference, and exports a PDF sheet and
    // Markdown. Its roll is deterministic from the seed via `uw_character_roll.ts`.
    maturity: 'release-ready',
    genres: ['scifi'],
    systems: ['uncharted-worlds'],
    tags: ['character'],
  }),
  defineTool({
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-characters.md (#51). It cleared 1-3, 6 and 7.1-7.2 at Beta already; what it
    // had was a viewer, so a saved coat of arms could be seen and downloaded and not changed.
    // `HeraldryArtifactEditor` is a form over the names the device is stored as, drawn beside the
    // arms, and `heraldry_roll.ts` is the single path from a seed — which is also what a
    // destructive re-roll needs. The legacy `generator.heraldry` save scope went with it.
    path: '/heraldry',
    label: 'Heraldry',
    kind: 'generator',
    domain: 'characters',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['heraldry'],
  }),
  defineTool({
    path: '/velgarth-gifts',
    label: 'Velgarth Gifts',
    kind: 'generator',
    domain: 'characters',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-characters.md (#52). It saves as `velgarth-gifts` — named for the setting,
    // because it is neither generic nor a game system — has an editor in `ARTIFACT_EDITORS`, and
    // exports Markdown, which is the first export it has ever had. Its roll is deterministic from
    // the seed via `velgarth_gifts_roll.ts`. Nothing it takes as input has an artifact kind, so
    // requirement 5.1 does not bind; 5.3 is met, as it always was.
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['character', 'velgarth'],
  }),

  // Factions & Groups
  defineTool({
    path: '/arms-manufacturer',
    label: 'Arms Manufacturer',
    kind: 'generator',
    domain: 'factions',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-factions.md (#53). It saves as `arms-manufacturer` — its own kind rather than
    // a discriminator on `organization`, because the two payloads share nothing but a name — has
    // an editor in `ARTIFACT_EDITORS`, and exports Markdown and PDF, the first exports it has ever
    // had. Its roll is deterministic from the seed via `arms_manufacturer_roll.ts`; the page had
    // no seed control at all before. Nothing it takes as input has an artifact kind, so
    // requirement 5.1 does not bind; 5.3 is met, as it always was.
    maturity: 'release-ready',
    genres: ['scifi'],
    tags: ['organization'],
  }),
  defineTool({
    // Release-ready, taken there by #40 before this field existed to record it.
    path: '/culture',
    label: 'Culture',
    kind: 'generator',
    domain: 'factions',
    maturity: 'release-ready',
    genres: ['fantasy'],
    featured: true,
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/fantasy/encounter',
    label: 'Fantasy Encounter',
    kind: 'generator',
    domain: 'factions',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-factions.md (#54). It saves as `encounter`, holding the resolved groups as
    // `StoredCharacter` and `StoredCreature` from the stored vocabulary and never the template;
    // has a list editor in `ARTIFACT_EDITORS`; and exports Markdown and PDF, the first exports it
    // has ever had. Its roll is deterministic from the seed and the two controls via
    // `encounter_roll.ts`. No input has an artifact kind yet — `environment` (#60) has not landed
    // — so requirement 5.1 does not bind; 5.3 is met, as it always was.
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['encounter'],
  }),
  defineTool({
    path: '/fantasy/family',
    label: 'Fantasy Family',
    kind: 'generator',
    domain: 'factions',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-factions.md (#55). It saves as `family` — the graph, flat: members as
    // `StoredCharacter`, edges as id records, the two name generators as pattern sources — has a
    // list editor in `ARTIFACT_EDITORS`, and exports Markdown, PDF and the tree as SVG, the first
    // exports it has ever had. Its roll is deterministic from the seed and every control via
    // `family_roll.ts`, names included. It takes a saved culture for naming, so 5.1 binds and is
    // met; `Family` has no arms, so the heraldry reference the design describes waits on a field.
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/organization',
    label: 'Fantasy Organization',
    kind: 'generator',
    domain: 'factions',
    // Release-ready, assessed section by section against docs/workshop.md and recorded in
    // docs/readiness-factions.md (#56). It saves as `organization` — the stored vocabulary the
    // settlement kind has embedded all along, now declared in `$lib/organizations` and
    // `$lib/visual_identity`: maps as entry arrays, people as `StoredCharacter`, imagery as
    // parameters and never as SVG — has a bespoke editor in `ARTIFACT_EDITORS`, and exports
    // Markdown, PDF and the emblem as SVG. Its roll is deterministic from the seed and the five
    // controls via `organization_roll.ts`. It takes a saved culture for naming and a saved coat
    // of arms to bear, so 5.1 binds for both and is met; a saved character as leader waits on
    // the role machinery, as docs/readiness-factions.md records.
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['organization'],
  }),
  defineTool({
    // Release-ready, taken there by #41 before this field existed to record it.
    path: '/fantasy/religion',
    label: 'Fantasy Religion',
    kind: 'generator',
    domain: 'factions',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['worldbuilding'],
  }),
  // Assessed release-ready under #57 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, and its own route. 2: one roll module (`star_nation_roll.ts`) that the
  // page and a re-roll both take, with the four config helpers it calls no longer seeding from
  // the clock. 3: kind `star-nation` with a versioned, validated payload, provenance carrying the
  // seed and the planet count, and `SaveArtifactButton` on the route. 4: an editor over every
  // printed field, the description kept as the user's, re-roll destructive. 5: the home system is
  // embedded because no `star-system` kind exists yet. 6: mobile widths via the page manifest,
  // named controls, Markdown and PDF exports, empty sentences dropped. 7: round-trip, migration
  // and Playwright tests. 8: README and entry point. #11's reframing is additive when it lands.
  defineTool({
    path: '/star-nation',
    label: 'Star Nation',
    kind: 'generator',
    domain: 'factions',
    maturity: 'release-ready',
    genres: ['scifi'],
    tags: ['organization', 'worldbuilding'],
  }),

  // Locations & Places
  // Assessed release-ready under #58 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, and its own route. 2: `chop_shop_roll.ts` is the one path from a seed,
  // and the page grew the seed controls it never had. 3: kind `chop-shop`, payload `{ text }`
  // (decision 4 of docs/tool-readiness.md), provenance carrying the seed, `SaveArtifactButton` on
  // the route. 4: a textarea editor, re-roll destructive. 5: nothing generates the settlement a
  // shop sits in, so 5.1 does not bind. 6: mobile widths via the page manifest, named controls,
  // Markdown and PDF exports, an emptied paragraph dropped. 7: round-trip, migration and
  // Playwright tests. 8: the library split into types, generation and the kind modules.
  defineTool({
    path: '/chop-shop',
    label: 'Cyberpunk Chop Shop',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    genres: ['cyberpunk'],
  }),
  // Assessed release-ready under #59 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, and its own route. 2: `dungeon_roll.ts` is the one path from a seed, and
  // the environment step it now holds used to live in the component where a re-roll could not
  // reach it; the plan is drawn on a 2D canvas and the room list below it is the dungeon, which is
  // 2.5. 3: kind `dungeon`, payload the blueprint and never the drawing (decision 4 of
  // docs/readiness-locations.md), provenance carrying the seed and all six controls. 4: a bespoke
  // room-shaped editor; retheming relabels and never re-rolls. 5: a saved encounter can be placed
  // at the foot of the stairs; `environment` has no kind yet, so that half does not bind. 6:
  // mobile widths via the page manifest, a named canvas over a written-out room list, Markdown and
  // PDF exports, empty sections dropped. 7: round-trip, migration and Playwright tests. 8: the
  // library README documents the six kind modules beside its seven subsystems.
  defineTool({
    path: '/fantasy/dungeon',
    label: 'Dungeon',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['map'],
  }),
  // Assessed release-ready under #60 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, its own route, and no genre tag because a place belongs to no setting.
  // 2: `environment_roll.ts` is the one path from a seed, and the five `getDefault*Config` helpers
  // this library owns now take the RNG rather than defaulting to the clock (decision 1 of
  // docs/tool-readiness.md); the wind arrow moved off `getElementById`, which is 2.1. 3: kind
  // `environment`, payload the type as it stands less `dominantEcosystem`, which is rebuilt from
  // the list. 4: a bespoke editor covering every field, because the payload is nested rather than
  // flat. 5: nothing it consumes has a kind, so 5.1 does not bind — it is a producer, and the
  // dungeon and region generators are what it unblocks. 6: mobile widths via the page manifest,
  // a named wind canvas over a written-out direction, Markdown and PDF exports, the empty
  // ecosystem section dropped. 7: round-trip, migration and Playwright tests. 8: the README
  // documents the five kind modules and still says the ecosystem sub-generator is a stub.
  defineTool({
    path: '/environment',
    label: 'Environment',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    tags: ['worldbuilding'],
  }),
  // Assessed release-ready under #61 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, its own route, featured on the home page. 2: `planet_roll.ts` is the one
  // path from a seed, the moon config stopped defaulting its RNG to the clock, and the page's
  // `onMount` goes through the same roll every press does — it used to call `generatePlanet`
  // directly, so the first planet a visitor met never had moons and was never inhabited. 2.5 was
  // already met by the Canvas2D fallback #135 built. 3: kind `planet`, payload the body's own
  // fields with its moons and any civilization beside them; the preview is never stored. 4: a
  // bespoke editor over every field, recomputing nothing. 5: `star-system` has no kind yet, so 5.1
  // does not bind — #63 wires the reference. 6: mobile widths via the page manifest, a named
  // preview, Markdown, PDF and SVG exports, empty sections dropped. 7: round-trip, migration and
  // Playwright tests. 8: the README documents the five kind modules.
  defineTool({
    path: '/planet',
    label: 'Planet',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    genres: ['scifi'],
    featured: true,
    tags: ['worldbuilding'],
  }),
  // Assessed release-ready under #62 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, its own route. 2: `region_roll.ts` is the one path from a seed, and
  // `Regions.getDefaultConfig` stopped seeding both its RNG and its fallback name set from the
  // clock. 3: kind `region`, payload the map as a graph, the realms, settlements, organizations
  // and rulers through the libraries that own them; a rendered map is never stored. 4: a bespoke
  // editor over the words and the seat, with the map and the arms shown and not edited. 5: the
  // pass's best composition case — a saved culture names the region and a saved settlement sits on
  // it, both linked rather than copied. 6: mobile widths via the page manifest, the map on the page
  // at last, Markdown, PDF and SVG exports, empty sections dropped. 7: round-trip, migration and
  // Playwright tests. 8: the README documents the six kind modules.
  defineTool({
    path: '/region',
    label: 'Region',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['map', 'worldbuilding'],
  }),
  defineTool({
    // Release-ready as of #20, the third and hardest of the first release's three tools: the only
    // one whose payload was built against the kind contract from scratch rather than retrofitted.
    path: '/fantasy/settlement',
    label: 'Settlement',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['worldbuilding'],
  }),
  // Assessed release-ready under #63 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, its own route. 2: `star_system_roll.ts` is the one path from a seed, and
  // the preview seeds were already derived from it; 2.5 is met by the Canvas2D fallback #135 built
  // and by every figure being written out beside the pictures. 3: kind `star-system`, payload the
  // two body lists and the words, with the counts derived on read rather than stored beside the
  // lists they count. 4: a bespoke editor over every body, recomputing nothing and re-sorting
  // nothing. 5: a saved planet can be placed in the system, linked rather than copied. 6: mobile
  // widths via the page manifest, named previews, Markdown, PDF and SVG exports, meaningless
  // measurements dropped. 7: round-trip, migration and Playwright tests. 8: the README documents
  // the five kind modules.
  defineTool({
    path: '/star-system',
    label: 'Star System',
    kind: 'generator',
    domain: 'locations',
    maturity: 'release-ready',
    genres: ['scifi'],
    tags: ['worldbuilding'],
  }),

  // Objects & Items
  // Assessed release-ready under #64 against docs/workshop.md, section by section. 1: catalog
  // entry, `TOOL_PANELS`, its own route. 2: `drug_roll.ts` is the one path from a seed; the page
  // drew its seed from the clock twice, at module load and on every press. 3: kind `drug`, its own
  // rather than a share of `item` — a drug has no material, rarity or weight and an item has no
  // method of ingestion — payload eleven strings, the two table rows stored by name. 4: a bespoke
  // editor over all eleven, with the description offered rather than recomputed. 5: nothing it
  // consumes has a kind, so 5.1 does not bind. 6: mobile widths via the page manifest, the ten
  // fields shown at last, Markdown and PDF exports, empty lines dropped. 7: round-trip, migration
  // and Playwright tests. 8: the README documents the five kind modules.
  defineTool({
    path: '/drug',
    label: 'Cyberpunk Drug',
    kind: 'generator',
    domain: 'objects',
    maturity: 'release-ready',
    genres: ['cyberpunk'],
  }),
  // Release-ready, assessed section by section against docs/workshop.md and recorded in
  // docs/readiness-objects.md (#65). The first reference tool taken there, so most of the spec
  // does not apply: it produces no artifacts, which takes out sections 3, 4 and 5 along with
  // 2.2-2.4 and 7.2-7.4. What was assessed is 1, 2.1, 2.5, 6, 7.1 and 8. 6.1 was already met by
  // `DataTable`'s flip and is held by e2e/tables.spec.ts; what failed was 6.4 — an item costing
  // nothing printed an empty Cost cell, and the key named coins no price was ever quoted in. The
  // pricing, the key and both exports live in `$lib/equipment`'s `price_lists.ts` now, under test.
  defineTool({
    path: '/fantasy/equipment',
    label: 'Fantasy Equipment Price Lists',
    kind: 'reference',
    domain: 'objects',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  // Release-ready, assessed section by section against docs/workshop.md and recorded in
  // docs/readiness-objects.md (#66). It saves as `item` — the kind decision 1 of that document
  // gives it and `/fantasy/weapon` to share, because two kinds for one payload shape would split a
  // user's gear across two vault entries — has an editor in `ARTIFACT_EDITORS`, and exports
  // Markdown and PDF, the first exports it has ever had. Its roll is deterministic from the seed
  // via `item_roll.ts`. Nothing it takes as input has an artifact kind, so requirement 5.1 does
  // not bind; 5.3 is met, as it always was.
  defineTool({
    path: '/fantasy/equipment-generator',
    label: 'Fantasy Equipment',
    kind: 'generator',
    domain: 'objects',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  // Release-ready, assessed section by section against docs/workshop.md and recorded in
  // docs/readiness-objects.md (#67). It saves as `merchant` — the person, the venue and the
  // inventory, with the stock stored rather than regenerated because a referee who crosses two
  // things off has edited the shop — has an editor in `ARTIFACT_EDITORS`, and exports Markdown and
  // PDF, the first exports it has ever had. Its roll is deterministic from the seed via
  // `merchant_roll.ts`, and the payload's own `seed` is the provenance seed rather than a second
  // answer to the same question. It is the first tool in the pass to compose two kinds: a culture
  // for naming and a settlement for where the shop stands (5.1).
  defineTool({
    path: '/fantasy/merchant',
    label: 'Fantasy Merchant',
    kind: 'generator',
    domain: 'objects',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  // Release-ready, assessed section by section against docs/workshop.md and recorded in
  // docs/readiness-objects.md (#68). It saves as `potion` — its own kind rather than a share of
  // `item`, per decision 2 of that document, because an item editor has no field for a duration or
  // a flavour — has an editor in `ARTIFACT_EDITORS`, and exports Markdown and PDF, the first
  // exports it has ever had. Its roll is deterministic from the seed via `potion_roll.ts`. 1.4
  // needed nothing: this label has always read `Fantasy Potion`, whatever the issue says.
  defineTool({
    path: '/fantasy/potion-generator',
    label: 'Fantasy Potion',
    kind: 'generator',
    domain: 'objects',
    maturity: 'release-ready',
    genres: ['fantasy'],
    tags: ['magic'],
  }),
  defineTool({
    path: '/fantasy/weapon',
    label: 'Fantasy Magic Weapon',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['equipment', 'magic'],
  }),
  defineTool({
    path: '/fantasy/treasure-hoard',
    label: 'Fantasy Treasure Hoard',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['treasure'],
  }),
  defineTool({
    path: '/spooky-ship',
    label: 'Spooky Ship',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['scifi', 'horror'],
    tags: ['starship'],
  }),
  defineTool({
    path: '/swn/starship',
    label: 'Stars Without Number Starship',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['scifi'],
    systems: ['swn'],
    tags: ['starship'],
  }),

  // Utilities & Reference
  // The workshop is deliberately absent. It is a surface rather than an instrument — the bench
  // the tools below are worked on — and this catalog holds instruments; see decision 9 in
  // docs/workshop.md. It is reached from `NAV_DESTINATIONS`, as Projects and the Result Vault are.
  defineTool({
    path: '/language',
    label: 'Language',
    kind: 'generator',
    domain: 'utilities',
    maturity: 'experimental',
    tags: ['naming', 'worldbuilding'],
  }),
  // Release-ready, assessed section by section against docs/workshop.md and recorded in
  // docs/readiness-utilities.md (#75). A reference tool, so sections 3, 4 and 5 do not apply, nor
  // do 2.2-2.4 and 7.2-7.4. #25's placeholder species sizes are not a blocker: the calculator
  // never reads the species list, it scales a human baseline, and #25 is a fact about data this
  // tool is used to author. What was wrong was 6.4 — a cleared field produced age rows reading
  // "2 to 1 years" — and 7.1, the arithmetic having lived in the component. `$lib/size`'s
  // `species_stats.ts` holds it now, with Markdown and PDF exports for 6.3.
  defineTool({
    path: '/species-stats',
    label: 'Species Height and Weight Calculator',
    kind: 'reference',
    domain: 'utilities',
    maturity: 'release-ready',
    // No genre. Height and weight as a proportion of a human baseline is arithmetic, and a sci-fi
    // setting inventing a heavy-worlder does it identically; the `fantasy` tag would have hidden
    // the tool from every project that is not one (1.2).
    tags: ['species'],
  }),
  // Release-ready, assessed section by section against docs/workshop.md and recorded in
  // docs/readiness-utilities.md (#76). The third and last reference tool of the pass. It is the
  // one that forced the spec question — does a tool with no library satisfy 8.1 and 8.2? — and
  // decision 8 of docs/tool-readiness.md answered it: `src/lib/word_patterns` holds the element
  // table and the pattern syntax as data, where the component held them as a concatenated HTML
  // string. 6.1 was already met by the table's own scroll container. What failed was 6.4, twice:
  // Generate on the empty pattern the page opened with produced ten blank bullets, and the clicks
  // element set is made of the character a Markdown table separates columns with.
  defineTool({
    path: '/word-generator-cheat-sheet',
    label: 'Word Generator Cheat Sheet',
    kind: 'reference',
    domain: 'utilities',
    maturity: 'release-ready',
    tags: ['naming'],
  }),
];

export function allTools(): ToolTypes.Tool[] {
  return TOOL_CATALOG;
}

export function findToolByPath(path: string): ToolTypes.Tool | undefined {
  return TOOL_CATALOG.find((tool) => tool.path === path);
}

/**
 * The tools the home page points at, in catalog order.
 *
 * Catalog order rather than an order of its own: the featured list is short enough that the
 * difference is invisible, and a second ordering would be a second thing to keep in step.
 */
export function featuredTools(): ToolTypes.Tool[] {
  return TOOL_CATALOG.filter((tool) => tool.featured);
}

/**
 * Looks tools up by path, preserving the order asked for. Throws on an unknown path so a
 * renamed route fails loudly at page load instead of silently dropping a nav link.
 */
export function toolsByPath(paths: string[]): ToolTypes.Tool[] {
  return paths.map((path) => {
    const tool = findToolByPath(path);
    if (!tool) {
      throw new Error(`No tool in the catalog has the path ${path}`);
    }
    return tool;
  });
}

/**
 * The maturity of the tool at a path, for a page or panel that has to state its own.
 *
 * Throws on an unknown path rather than falling back to a level, for the same reason `maturity`
 * has no default: a page that showed nothing because a lookup missed, or showed `experimental`
 * because that is the safe-looking answer, would be making a durability promise nobody assessed.
 * Every page that calls this is prerendered by the static adapter, so a wrong path fails the
 * build rather than shipping.
 */
export function toolMaturityForPath(path: string): ToolTypes.ToolMaturity {
  const tool = findToolByPath(path);
  if (!tool) {
    throw new Error(`No tool in the catalog has the path ${path}`);
  }
  return tool.maturity;
}

export function toolsInDomain(domain: ToolTypes.ToolDomain): ToolTypes.Tool[] {
  return TOOL_CATALOG.filter((tool) => tool.domain === domain);
}

export function toolsOfKind(kind: ToolTypes.ToolKind): ToolTypes.Tool[] {
  return TOOL_CATALOG.filter((tool) => tool.kind === kind);
}

/** Filters the catalog with the shared tag filter, so genre and system compose with any tag. */
export function filterTools(filter: TagFilter): ToolTypes.Tool[] {
  return applyTagFilter(TOOL_CATALOG, filter);
}

export function toolsWithGenre(genre: ToolTypes.Genre): ToolTypes.Tool[] {
  return filterTools({ includeAllTags: [genreTag(genre)] });
}

export function toolsForSystem(system: ToolTypes.GameSystem): ToolTypes.Tool[] {
  return filterTools({ includeAllTags: [systemTag(system)] });
}

/**
 * Tools at exactly the given maturity. Goes through the tag filter rather than the field so that
 * "durable tools only" composes with a genre or a system in one filter, which is the reason the
 * maturity tag exists at all.
 */
export function toolsWithMaturity(maturity: ToolTypes.ToolMaturity): ToolTypes.Tool[] {
  return filterTools({ includeAllTags: [maturityTag(maturity)] });
}
