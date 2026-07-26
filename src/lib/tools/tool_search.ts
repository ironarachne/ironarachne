import { domainDisplayName, hasGenre, toolSystems } from './tools';
import { DOMAINS } from './tool_types';
import type * as ToolTypes from './tool_types';

export type ToolSearchCriteria = {
  /** Free text matched against the tool's label. An empty or blank query matches everything. */
  query?: string;
  /** When set, only tools carrying this genre are kept. */
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
    if (genre && !hasGenre(tool, genre)) {
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
