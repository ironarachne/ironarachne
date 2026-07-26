import type { RouteId } from '$app/types';
import type { TaggedItem } from '$lib/tags/tag_types';

/**
 * Every genre the site knows about, in display order. `Genre` is derived from this list so the
 * two cannot drift apart.
 *
 * These mirror the `theme` values `GeneratorPage` styles pages with, so a tool's genre and its
 * visual treatment stay in step.
 */
export const GENRES = ['fantasy', 'scifi', 'cyberpunk', 'horror'] as const;

export type Genre = (typeof GENRES)[number];

/**
 * Every game system the site knows about, in display order. Tools that produce system-agnostic
 * content carry no system at all rather than a placeholder value.
 */
export const SYSTEMS = ['adnd-2e', 'dcc', 'swn', 'uncharted-worlds'] as const;

export type GameSystem = (typeof SYSTEMS)[number];

/**
 * What the user does on the page: roll new content, edit content they supply, or read a
 * static table.
 */
export type ToolKind = 'generator' | 'editor' | 'reference';

/** Nav section the tool is listed under; mirrors the top-level navigation taxonomy. */
export type ToolDomain = 'characters' | 'factions' | 'locations' | 'objects' | 'utilities';

/**
 * Authoring shape for a catalog entry. `genres` and `systems` are both optional and are
 * expanded into namespaced tags by `defineTool`.
 */
export type ToolDefinition = {
  path: RouteId;
  label: string;
  kind: ToolKind;
  domain: ToolDomain;
  genres?: Genre[];
  systems?: GameSystem[];
  /** Free-form tags beyond genre and system, such as 'heraldry' or 'naming'. */
  tags?: string[];
};

/**
 * A user-facing tool. Genre and system are not fields: they live in `tags` as `genre:` and
 * `system:` entries so tools can be filtered with the shared tag filtering in `$lib/tags`.
 * Read them back with `toolGenres` and `toolSystems`.
 */
export type Tool = TaggedItem & {
  path: RouteId;
  label: string;
  kind: ToolKind;
  domain: ToolDomain;
};
