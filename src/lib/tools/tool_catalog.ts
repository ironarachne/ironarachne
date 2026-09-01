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
    maturity: 'experimental',
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
  defineTool({
    path: '/star-nation',
    label: 'Star Nation',
    kind: 'generator',
    domain: 'factions',
    maturity: 'experimental',
    genres: ['scifi'],
    tags: ['organization', 'worldbuilding'],
  }),

  // Locations & Places
  defineTool({
    path: '/chop-shop',
    label: 'Cyberpunk Chop Shop',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
    genres: ['cyberpunk'],
  }),
  defineTool({
    path: '/fantasy/dungeon',
    label: 'Dungeon',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['map'],
  }),
  defineTool({
    path: '/environment',
    label: 'Environment',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/planet',
    label: 'Planet',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
    genres: ['scifi'],
    featured: true,
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/region',
    label: 'Region',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
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
  defineTool({
    path: '/star-system',
    label: 'Star System',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
    genres: ['scifi'],
    tags: ['worldbuilding'],
  }),

  // Objects & Items
  defineTool({
    path: '/drug',
    label: 'Cyberpunk Drug',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['cyberpunk'],
  }),
  defineTool({
    path: '/fantasy/equipment',
    label: 'Fantasy Equipment Price Lists',
    kind: 'reference',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  defineTool({
    path: '/fantasy/equipment-generator',
    label: 'Fantasy Equipment',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  defineTool({
    path: '/fantasy/merchant',
    label: 'Fantasy Merchant',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  defineTool({
    path: '/fantasy/potion-generator',
    label: 'Fantasy Potion',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
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
  defineTool({
    path: '/species-stats',
    label: 'Species Height and Weight Calculator',
    kind: 'reference',
    domain: 'utilities',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['species'],
  }),
  defineTool({
    path: '/word-generator-cheat-sheet',
    label: 'Word Generator Cheat Sheet',
    kind: 'reference',
    domain: 'utilities',
    maturity: 'experimental',
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
