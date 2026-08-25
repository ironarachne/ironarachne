import { domainDisplayName, toolGenres, toolSystems } from './tools';
import { DOMAINS } from './tool_types';
import type * as ToolTypes from './tool_types';

export type ToolSearchCriteria = {
  /** Free text matched against the tool's label. An empty or blank query matches everything. */
  query?: string;
  /** When set, tools written for a different genre are dropped. */
  genre?: ToolTypes.Genre;
  /** When set, tools written for a different system are dropped. */
  system?: ToolTypes.GameSystem;
};

export type ToolGroup = {
  domain: ToolTypes.ToolDomain;
  heading: string;
  tools: ToolTypes.Tool[];
};

function searchTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Matches a tool's label against a query, one whitespace-separated term at a time. Every term
 * has to appear somewhere in the label, so "star char" finds "Stars Without Number Character"
 * without the user having to type the name in full or in order.
 */
export function matchesToolQuery(tool: ToolTypes.Tool, query: string): boolean {
  const label = tool.label.toLowerCase();

  return searchTerms(query).every((term) => label.includes(term));
}

/**
 * Decides whether a tool can be used at a table running the given system.
 *
 * A tool written for another system is excluded, which is the point of passing a system at all:
 * it keeps AD&D content out of a Stars Without Number game. A tool that carries no system tag is
 * kept, because system-neutral content (a culture, a region, a language) mixes nothing — it has
 * no rules of its own to clash with.
 */
export function isCompatibleWithSystem(
  tool: ToolTypes.Tool,
  system: ToolTypes.GameSystem,
): boolean {
  const systems = toolSystems(tool);

  return systems.length === 0 || systems.includes(system);
}

/**
 * Decides whether a tool belongs in a project set in the given genre.
 *
 * The same shape as `isCompatibleWithSystem`, and for the same reason: a tool written for another
 * genre is excluded, and a tool carrying no genre at all is kept. That second half is what makes
 * this usable — four tools in the catalog are genre-neutral, and a filter that dropped them would
 * take the environment generator away from a fantasy campaign, which is the opposite of the point.
 *
 * A tool carrying several genres matches if any of them does: `/spooky-ship` is science fiction and
 * horror, and belongs in both.
 */
export function isCompatibleWithGenre(tool: ToolTypes.Tool, genre: ToolTypes.Genre): boolean {
  const genres = toolGenres(tool);

  return genres.length === 0 || genres.includes(genre);
}

/**
 * Filters tools by name, genre, and system. Criteria that are left out do not narrow the list,
 * so an empty set of criteria returns everything.
 */
export function searchTools(
  tools: ToolTypes.Tool[],
  criteria: ToolSearchCriteria,
): ToolTypes.Tool[] {
  const { query, genre, system } = criteria;

  return tools.filter((tool) => {
    if (query && !matchesToolQuery(tool, query)) {
      return false;
    }
    if (genre && !isCompatibleWithGenre(tool, genre)) {
      return false;
    }
    if (system && !isCompatibleWithSystem(tool, system)) {
      return false;
    }
    return true;
  });
}

/**
 * Groups tools under their domain, in navigation order. Domains with no matching tool are left
 * out entirely so a filtered list does not show empty headings.
 */
export function groupToolsByDomain(tools: ToolTypes.Tool[]): ToolGroup[] {
  return DOMAINS.map((domain) => ({
    domain,
    heading: domainDisplayName(domain),
    tools: tools.filter((tool) => tool.domain === domain),
  })).filter((group) => group.tools.length > 0);
}

/**
 * The tool a browsing UI lists first: the first tool of the first non-empty domain. Deriving it
 * from `groupToolsByDomain` rather than from the catalog order means a default selection and the
 * top of the rendered list cannot disagree. Returns undefined for an empty list.
 */
export function firstToolInBrowseOrder(tools: ToolTypes.Tool[]): ToolTypes.Tool | undefined {
  return groupToolsByDomain(tools)[0]?.tools[0];
}
