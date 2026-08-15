import { applyTagFilter } from '$lib/tags';
import type { TagFilter } from '$lib/tags';
import { defineTool, genreTag, systemTag } from './tools';
import type * as ToolTypes from './tool_types';

/**
 * Every user-facing tool on the site, in the order it is listed in navigation. This is the
 * single source of truth for what a tool is called, where it lives, and what it is for; the
 * index pages build their links from it.
 *
 * Genre and system are both optional. A tool that works for any genre (the environment
 * generator) or any system (the culture generator) carries no such tag, rather than a
 * catch-all value.
 */
export const TOOL_CATALOG: ToolTypes.Tool[] = [
  // Characters & People
  defineTool({
    path: '/fantasy/adnd/character/build',
    label: 'AD&D 2E Character',
    kind: 'editor',
    domain: 'characters',
    genres: ['fantasy'],
    systems: ['adnd-2e'],
    tags: ['character'],
  }),
  defineTool({
    path: '/character',
    label: 'Character',
    kind: 'generator',
    domain: 'characters',
    genres: ['fantasy'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/adnd/character',
    label: 'AD&D 2E Character',
    kind: 'generator',
    domain: 'characters',
    genres: ['fantasy'],
    systems: ['adnd-2e'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/dcc/character',
    label: 'Dungeon Crawl Classics Character',
    kind: 'generator',
    domain: 'characters',
    genres: ['fantasy'],
    systems: ['dcc'],
    tags: ['character'],
  }),
  defineTool({
    path: '/swn/character',
    label: 'Stars Without Number Character',
    kind: 'generator',
    domain: 'characters',
    genres: ['scifi'],
    systems: ['swn'],
    tags: ['character'],
  }),
  defineTool({
    path: '/unchartedworlds/character',
    label: 'Uncharted Worlds Character',
    kind: 'generator',
    domain: 'characters',
    genres: ['scifi'],
    systems: ['uncharted-worlds'],
    tags: ['character'],
  }),
  defineTool({
    path: '/heraldry',
    label: 'Heraldry',
    kind: 'generator',
    domain: 'characters',
    genres: ['fantasy'],
    tags: ['heraldry'],
  }),
  defineTool({
    path: '/velgarth-gifts',
    label: 'Velgarth Gifts',
    kind: 'generator',
    domain: 'characters',
    genres: ['fantasy'],
    tags: ['character', 'velgarth'],
  }),

  // Factions & Groups
  defineTool({
    path: '/arms-manufacturer',
    label: 'Arms Manufacturer',
    kind: 'generator',
    domain: 'factions',
    genres: ['scifi'],
    tags: ['organization'],
  }),
  defineTool({
    path: '/culture',
    label: 'Culture',
    kind: 'generator',
    domain: 'factions',
    genres: ['fantasy'],
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/fantasy/encounter',
    label: 'Fantasy Encounter',
    kind: 'generator',
    domain: 'factions',
    genres: ['fantasy'],
    tags: ['encounter'],
  }),
  defineTool({
    path: '/fantasy/family',
    label: 'Fantasy Family',
    kind: 'generator',
    domain: 'factions',
    genres: ['fantasy'],
    tags: ['character'],
  }),
  defineTool({
    path: '/fantasy/organization',
    label: 'Fantasy Organization',
    kind: 'generator',
    domain: 'factions',
    genres: ['fantasy'],
    tags: ['organization'],
  }),
  defineTool({
    path: '/fantasy/religion',
    label: 'Fantasy Religion',
    kind: 'generator',
    domain: 'factions',
    genres: ['fantasy'],
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/star-nation',
    label: 'Star Nation',
    kind: 'generator',
    domain: 'factions',
    genres: ['scifi'],
    tags: ['organization', 'worldbuilding'],
  }),

  // Locations & Places
  defineTool({
    path: '/chop-shop',
    label: 'Cyberpunk Chop Shop',
    kind: 'generator',
    domain: 'locations',
    genres: ['cyberpunk'],
  }),
  defineTool({
    path: '/fantasy/dungeon',
    label: 'Dungeon',
    kind: 'generator',
    domain: 'locations',
    genres: ['fantasy'],
    tags: ['map'],
  }),
  defineTool({
    path: '/environment',
    label: 'Environment',
    kind: 'generator',
    domain: 'locations',
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/planet',
    label: 'Planet',
    kind: 'generator',
    domain: 'locations',
    genres: ['scifi'],
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/region',
    label: 'Region',
    kind: 'generator',
    domain: 'locations',
    genres: ['fantasy'],
    tags: ['map', 'worldbuilding'],
  }),
  defineTool({
    path: '/fantasy/settlement',
    label: 'Settlement',
    kind: 'generator',
    domain: 'locations',
    genres: ['fantasy'],
    tags: ['worldbuilding'],
  }),
  defineTool({
    path: '/star-system',
    label: 'Star System',
    kind: 'generator',
    domain: 'locations',
    genres: ['scifi'],
    tags: ['worldbuilding'],
  }),

  // Objects & Items
  defineTool({
    path: '/drug',
    label: 'Cyberpunk Drug',
    kind: 'generator',
    domain: 'objects',
    genres: ['cyberpunk'],
  }),
  defineTool({
    path: '/fantasy/equipment',
    label: 'Fantasy Equipment Lists',
    kind: 'reference',
    domain: 'objects',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  defineTool({
    path: '/fantasy/equipment-generator',
    label: 'Fantasy Equipment',
    kind: 'generator',
    domain: 'objects',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  defineTool({
    path: '/fantasy/merchant',
    label: 'Fantasy Merchant',
    kind: 'generator',
    domain: 'objects',
    genres: ['fantasy'],
    tags: ['equipment'],
  }),
  defineTool({
    path: '/fantasy/potion-generator',
    label: 'Fantasy Potion Generator',
    kind: 'generator',
    domain: 'objects',
    genres: ['fantasy'],
    tags: ['magic'],
  }),
  defineTool({
    path: '/fantasy/weapon',
    label: 'Fantasy Weapon',
    kind: 'generator',
    domain: 'objects',
    genres: ['fantasy'],
    tags: ['equipment', 'magic'],
  }),
  defineTool({
    path: '/fantasy/treasure-hoard',
    label: 'Fantasy Treasure Hoard',
    kind: 'generator',
    domain: 'objects',
    genres: ['fantasy'],
    tags: ['treasure'],
  }),
  defineTool({
    path: '/spooky-ship',
    label: 'Spooky Starship',
    kind: 'generator',
    domain: 'objects',
    genres: ['scifi', 'horror'],
    tags: ['starship'],
  }),
  defineTool({
    path: '/swn/starship',
    label: 'Stars Without Number Starship',
    kind: 'generator',
    domain: 'objects',
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
    path: '/workshop',
    label: 'Workshop',
    kind: 'editor',
    domain: 'utilities',
    tags: ['workshop', 'projects'],
  }),
  defineTool({
    path: '/saved-data',
    label: 'Saved data',
    kind: 'editor',
    domain: 'utilities',
  }),
  defineTool({
    path: '/language',
    label: 'Language',
    kind: 'generator',
    domain: 'utilities',
    tags: ['naming', 'worldbuilding'],
  }),
  defineTool({
    path: '/species-stats',
    label: 'Species Height and Weight Calculator',
    kind: 'reference',
    domain: 'utilities',
    genres: ['fantasy'],
    tags: ['species'],
  }),
  defineTool({
    path: '/word-generator-cheat-sheet',
    label: 'Word Generator Cheat Sheet',
    kind: 'reference',
    domain: 'utilities',
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
