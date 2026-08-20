import type { RouteId } from '$app/types';
import type { TaggedItem } from '$lib/tags';

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

/**
 * How finished a tool is, least to most, from the maturity levels in `docs/workshop.md`.
 * `ToolMaturity` is derived from this list so the two cannot drift apart.
 *
 * This is a promise about durability rather than a note about polish, which is why it is on the
 * catalog entry and shown to the user: an experimental tool may change or vanish and its output
 * may not be savable, a beta tool produces durable artifacts but may not be fully editable, and a
 * release-ready tool meets every requirement in the readiness spec. In a local-only application
 * that promise is the user's only basis for deciding what to trust with a campaign's worth of work.
 */
export const MATURITIES = ['experimental', 'beta', 'release-ready'] as const;

export type ToolMaturity = (typeof MATURITIES)[number];

/**
 * Nav sections a tool can be listed under, in navigation order; mirrors the top-level
 * navigation taxonomy. `ToolDomain` is derived from this list so the two cannot drift apart.
 */
export const DOMAINS = ['characters', 'factions', 'locations', 'objects', 'utilities'] as const;

export type ToolDomain = (typeof DOMAINS)[number];

/**
 * Authoring shape for a catalog entry. `genres` and `systems` are both optional and are
 * expanded into namespaced tags by `defineTool`.
 *
 * `maturity` is required and deliberately has no default. A default would let a tool claim a
 * maturity nobody assessed, which is the one failure the levels exist to prevent; requiring it
 * forces the question while the entry is being written.
 */
export type ToolDefinition = {
  path: RouteId;
  label: string;
  kind: ToolKind;
  domain: ToolDomain;
  maturity: ToolMaturity;
  genres?: Genre[];
  systems?: GameSystem[];
  /**
   * Whether the home page points at this tool. Optional and defaulting to false, because most
   * tools are not featured and an entry should not have to say so.
   *
   * An editorial judgement, deliberately not derived from `maturity`. Deriving it would sound
   * principled and would produce an empty list: almost every entry is `experimental` today, and
   * the home page would ship with a hole in it until that changed.
   */
  featured?: boolean;
  /** Free-form tags beyond genre and system, such as 'heraldry' or 'naming'. */
  tags?: string[];
};

/**
 * A user-facing tool. Genre and system are not fields: they live in `tags` as `genre:` and
 * `system:` entries so tools can be filtered with the shared tag filtering in `$lib/tags`.
 * Read them back with `toolGenres` and `toolSystems`.
 *
 * Maturity is both — a field, because every reader of it wants exactly one value and a field is
 * the only shape that guarantees that, and a `maturity:` tag alongside it so it composes with the
 * same filter. `defineTool` derives the tag from the field, so the two cannot disagree.
 */
export type Tool = TaggedItem & {
  path: RouteId;
  label: string;
  kind: ToolKind;
  domain: ToolDomain;
  maturity: ToolMaturity;
  /**
   * Both a field and a `featured` tag, for the same reason maturity is: the home page wants one
   * boolean answer and a field is the only shape that guarantees it, while the tag lets "featured"
   * compose with the same filtering as a genre. `defineTool` derives the tag from the field, so
   * the two cannot disagree.
   */
  featured: boolean;
};
