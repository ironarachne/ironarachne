import { GENRES, SYSTEMS } from './tool_types';
import type * as ToolTypes from './tool_types';

/** Prefix marking a tag as a genre label. */
export const GENRE_TAG_PREFIX = 'genre:';

/** Prefix marking a tag as a game system label. */
export const SYSTEM_TAG_PREFIX = 'system:';

export function genreTag(genre: ToolTypes.Genre): string {
  return `${GENRE_TAG_PREFIX}${genre}`;
}

export function systemTag(system: ToolTypes.GameSystem): string {
  return `${SYSTEM_TAG_PREFIX}${system}`;
}

/**
 * Builds a catalog entry, expanding the optional `genres` and `systems` into namespaced tags.
 * A tool with neither is genre-neutral and system-neutral, and simply carries no such tags.
 */
export function defineTool(definition: ToolTypes.ToolDefinition): ToolTypes.Tool {
  const genreTags = (definition.genres ?? []).map(genreTag);
  const systemTags = (definition.systems ?? []).map(systemTag);

  return {
    path: definition.path,
    label: definition.label,
    kind: definition.kind,
    domain: definition.domain,
    tags: [...genreTags, ...systemTags, ...(definition.tags ?? [])],
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
  swn: 'Stars Without Number',
  'uncharted-worlds': 'Uncharted Worlds',
};

export function genreDisplayName(genre: ToolTypes.Genre): string {
  return GENRE_NAMES[genre];
}

export function systemDisplayName(system: ToolTypes.GameSystem): string {
  return SYSTEM_NAMES[system];
}
