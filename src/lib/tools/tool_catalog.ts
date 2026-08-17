import { applyTagFilter } from '$lib/tags';
import type { TagFilter } from '$lib/tags';
import { defineTool, genreTag, maturityTag, systemTag } from './tools';
import type * as ToolTypes from './tool_types';

/**
 * Every user-facing tool on the site, in the order it is listed in navigation. This is the
 * single source of truth for what a tool is called, where it lives, and what it is for; the
 * index pages build their links from it.
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
    label: 'AD&D 2E Character',
    kind: 'editor',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['fantasy'],
    systems: ['adnd-2e'],
    tags: ['character'],
  }),
  defineTool({
    path: '/character',
    label: 'Character',
    kind: 'generator',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/adnd/character',
    label: 'AD&D 2E Character',
    kind: 'generator',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['fantasy'],
    systems: ['adnd-2e'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/dcc/character',
    label: 'Dungeon Crawl Classics Character',
    kind: 'generator',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['fantasy'],
    systems: ['dcc'],
    tags: ['character'],
  }),
  defineTool({
    path: '/swn/character',
    label: 'Stars Without Number Character',
    kind: 'generator',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['scifi'],
    systems: ['swn'],
    tags: ['character'],
  }),
  defineTool({
    path: '/unchartedworlds/character',
    label: 'Uncharted Worlds Character',
    kind: 'generator',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['scifi'],
    systems: ['uncharted-worlds'],
    tags: ['character'],
  }),
  defineTool({
    // Beta, measured against the Beta bar rather than assumed from "approaching Beta" in the
    // design document. It clears sections 1–3 (a registered kind with a validating v1→v2
    // migration, a round-tripping snapshot, provenance and a name recorded on save), 6 (mobile,
    // keyboard, SVG and PNG export), and 7.1–7.2. What holds it short of Release-ready is section
    // 4: `ARTIFACT_EDITORS` registers a viewer for heraldry and no editor, so a saved coat of arms
    // can be seen and downloaded but not changed.
    path: '/heraldry',
    label: 'Heraldry',
    kind: 'generator',
    domain: 'characters',
    maturity: 'beta',
    genres: ['fantasy'],
    tags: ['heraldry'],
  }),
  defineTool({
    path: '/velgarth-gifts',
    label: 'Velgarth Gifts',
    kind: 'generator',
    domain: 'characters',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['character', 'velgarth'],
  }),

  // Factions & Groups
  defineTool({
    path: '/arms-manufacturer',
    label: 'Arms Manufacturer',
    kind: 'generator',
    domain: 'factions',
    maturity: 'experimental',
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
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/fantasy/encounter',
    label: 'Fantasy Encounter',
    kind: 'generator',
    domain: 'factions',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['encounter'],
  }),
  defineTool({
    path: '/fantasy/family',
    label: 'Fantasy Family',
    kind: 'generator',
    domain: 'factions',
    maturity: 'experimental',
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
    path: '/fantasy/settlement',
    label: 'Settlement',
    kind: 'generator',
    domain: 'locations',
    maturity: 'experimental',
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
    label: 'Fantasy Equipment Lists',
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
    label: 'Fantasy Potion Generator',
    kind: 'generator',
    domain: 'objects',
    maturity: 'experimental',
    genres: ['fantasy'],
    tags: ['magic'],
  }),
  defineTool({
    path: '/fantasy/weapon',
    label: 'Fantasy Weapon',
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
    label: 'Spooky Starship',
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
  defineTool({
    // The workshop is where every other tool in this catalog can be mounted, which makes it the
    // one entry with no panel of its own — see `PATHS_WITHOUT_TOOL_PANELS` in `$lib/workshop`.
    // It is here rather than only in the nav because the catalog is where a tool's name and
    // classification live, and a surface nothing can find is a surface nobody uses.
    //
    // Experimental, and not as a placeholder: the readiness spec measures a tool by what happens
    // to the artifacts it produces, and the workshop produces none of its own — it is the bench
    // the others are worked on. What the level does say truthfully is the part a user needs, which
    // is that the workshop is still being built and may change under them.
    path: '/workshop',
    label: 'Workshop',
    kind: 'editor',
    domain: 'utilities',
    maturity: 'experimental',
    tags: ['workshop', 'projects'],
  }),
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
