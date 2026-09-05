import { GENRES, SYSTEMS } from './tool_types';
import type * as ToolTypes from './tool_types';

/** Prefix marking a tag as a genre label. */
export const GENRE_TAG_PREFIX = 'genre:';

/** Prefix marking a tag as a game system label. */
export const SYSTEM_TAG_PREFIX = 'system:';

/** Prefix marking a tag as a maturity label. */
export const MATURITY_TAG_PREFIX = 'maturity:';

/**
 * Tag marking a tool as one the home page points at.
 *
 * Unprefixed, unlike the three above, because it has no value to namespace — a tool is featured or
 * it is not, so `featured:true` would be a prefix pretending at a vocabulary of one.
 */
export const FEATURED_TAG = 'featured';

export function genreTag(genre: ToolTypes.Genre): string {
  return `${GENRE_TAG_PREFIX}${genre}`;
}

export function systemTag(system: ToolTypes.GameSystem): string {
  return `${SYSTEM_TAG_PREFIX}${system}`;
}

export function maturityTag(maturity: ToolTypes.ToolMaturity): string {
  return `${MATURITY_TAG_PREFIX}${maturity}`;
}

/**
 * Builds a catalog entry, expanding the optional `genres` and `systems` into namespaced tags.
 * A tool with neither is genre-neutral and system-neutral, and simply carries no such tags.
 *
 * Maturity is required, and is expanded into a tag as well as kept as a field: the field is what a
 * badge reads, and the tag is what makes "only tools that will keep my work" the same filtering
 * operation as a genre or a system. Deriving the tag here is what keeps them in agreement — the
 * authoring site sets one value.
 */
export function defineTool(definition: ToolTypes.ToolDefinition): ToolTypes.Tool {
  const genreTags = (definition.genres ?? []).map(genreTag);
  const systemTags = (definition.systems ?? []).map(systemTag);
  const featured = definition.featured ?? false;

  return {
    path: definition.path,
    label: definition.label,
    kind: definition.kind,
    domain: definition.domain,
    maturity: definition.maturity,
    featured,
    tags: [
      ...genreTags,
      ...systemTags,
      maturityTag(definition.maturity),
      ...(featured ? [FEATURED_TAG] : []),
      ...(definition.tags ?? []),
    ],
  };
}

function tagValuesWithPrefix(tags: string[], prefix: string): string[] {
  return tags.filter((tag) => tag.startsWith(prefix)).map((tag) => tag.slice(prefix.length));
}

export function toolGenres(tool: ToolTypes.Tool): ToolTypes.Genre[] {
  return tagValuesWithPrefix(tool.tags, GENRE_TAG_PREFIX) as ToolTypes.Genre[];
}

export function toolSystems(tool: ToolTypes.Tool): ToolTypes.GameSystem[] {
  return tagValuesWithPrefix(tool.tags, SYSTEM_TAG_PREFIX) as ToolTypes.GameSystem[];
}

/**
 * Whether a value is one of the genres this build knows.
 *
 * Exported because the vocabulary is the catalog's and nothing else may keep a second copy of it —
 * `$lib/projects` asks this of a value read from storage or from an export file, where a genre from
 * a future build is an ordinary thing to meet rather than an error.
 */
export function isGenre(value: unknown): value is ToolTypes.Genre {
  return typeof value === 'string' && (GENRES as readonly string[]).includes(value);
}

/** Whether a value is one of the game systems this build knows. See `isGenre`. */
export function isGameSystem(value: unknown): value is ToolTypes.GameSystem {
  return typeof value === 'string' && (SYSTEMS as readonly string[]).includes(value);
}

export function hasGenre(tool: ToolTypes.Tool, genre: ToolTypes.Genre): boolean {
  return tool.tags.includes(genreTag(genre));
}

export function hasSystem(tool: ToolTypes.Tool, system: ToolTypes.GameSystem): boolean {
  return tool.tags.includes(systemTag(system));
}

/** Distinct genres present across the given tools, in display order. */
export function genresOf(tools: ToolTypes.Tool[]): ToolTypes.Genre[] {
  const present = new Set(tools.flatMap(toolGenres));
  return GENRES.filter((genre) => present.has(genre));
}

/** Distinct game systems present across the given tools, in display order. */
export function systemsOf(tools: ToolTypes.Tool[]): ToolTypes.GameSystem[] {
  const present = new Set(tools.flatMap(toolSystems));
  return SYSTEMS.filter((system) => present.has(system));
}

const GENRE_NAMES: Record<ToolTypes.Genre, string> = {
  fantasy: 'Fantasy',
  scifi: 'Science Fiction',
  cyberpunk: 'Cyberpunk',
  horror: 'Horror',
};

const SYSTEM_NAMES: Record<ToolTypes.GameSystem, string> = {
  'adnd-2e': 'AD&D 2E',
  dcc: 'Dungeon Crawl Classics',
  'dnd-5e': 'D&D 5E',
  swn: 'Stars Without Number',
  'uncharted-worlds': 'Uncharted Worlds',
};

export function genreDisplayName(genre: ToolTypes.Genre): string {
  return GENRE_NAMES[genre];
}

export function systemDisplayName(system: ToolTypes.GameSystem): string {
  return SYSTEM_NAMES[system];
}

const MATURITY_NAMES: Record<ToolTypes.ToolMaturity, string> = {
  experimental: 'Experimental',
  beta: 'Beta',
  'release-ready': 'Release-ready',
};

/**
 * What each level promises the user about their work, in the terms they care about rather than in
 * terms of the readiness spec's section numbers. A level whose name means nothing to a visitor is
 * a label, not a warning, so the badge shows this sentence beside it.
 */
const MATURITY_DESCRIPTIONS: Record<ToolTypes.ToolMaturity, string> = {
  experimental: 'This tool may change or disappear, and its output may not be savable.',
  beta: 'Output saves as a durable artifact, but editing it may be partial or unavailable.',
  'release-ready': 'A full citizen of the workshop: it saves, edits, and composes.',
};

export function maturityDisplayName(maturity: ToolTypes.ToolMaturity): string {
  return MATURITY_NAMES[maturity];
}

export function maturityDescription(maturity: ToolTypes.ToolMaturity): string {
  return MATURITY_DESCRIPTIONS[maturity];
}

/**
 * Whether a level is worth putting in front of a user, as opposed to being kept as the internal
 * classifier it also is.
 *
 * Only the levels that carry a warning are: `experimental` and `beta` each qualify what will
 * happen to the user's work, which is something they have to know before they invest any.
 * `release-ready` qualifies nothing — it is the ordinary case — so showing it turns a warning into
 * a decoration, and a badge on every tool is a badge nobody reads, including the two that matter.
 *
 * The trade is that a finished tool is now recognised by an absence, which is harder to read than
 * a label. That was the argument for marking every row in the tool browser, and #43 settled it the
 * other way: release-ready is our classification of a tool, not a promise the user asked for.
 *
 * The level itself stays on the catalog entry and in the `maturity:` tag either way; this governs
 * display only. Callers that wrap the badge in an element of their own must ask this too, because
 * a component rendering nothing still leaves that wrapper behind.
 */
export function showsMaturityBadge(maturity: ToolTypes.ToolMaturity): boolean {
  return maturity !== 'release-ready';
}

const DOMAIN_NAMES: Record<ToolTypes.ToolDomain, string> = {
  characters: 'Characters & People',
  factions: 'Factions & Groups',
  locations: 'Locations & Places',
  objects: 'Objects & Items',
  utilities: 'Utilities & Reference',
};

export function domainDisplayName(domain: ToolTypes.ToolDomain): string {
  return DOMAIN_NAMES[domain];
}
