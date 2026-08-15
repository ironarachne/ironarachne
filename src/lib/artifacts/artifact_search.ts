import type { ArtifactKind } from '$lib/artifact_kinds';
import { applyTagFilter } from '$lib/tags';

import type { ArtifactSummary } from './artifact_types';

/**
 * What narrows a project's contents down to what a user is looking for. Criteria that are left
 * out do not narrow anything, so empty criteria return everything.
 */
export type ArtifactSearchCriteria = {
  /** Free text, matched against the artifact's name and its kind. Blank matches everything. */
  query?: string;
  /** When set, only artifacts of this kind are kept. */
  kind?: ArtifactKind;
  /** When set, an artifact must carry every one of these tags. */
  tags?: string[];
};

/** Artifacts of one kind, as the project view lists them under a heading. */
export type ArtifactKindGroup = {
  kind: ArtifactKind;
  artifacts: ArtifactSummary[];
};

function searchTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Matches an artifact against a query, one whitespace-separated term at a time. Every term has to
 * appear in the name or the kind, so "ash cult" finds the Ashfall culture without the user typing
 * either in full or in order.
 *
 * The kind is matched as well as the name because it is the one thing every artifact has that the
 * user did not write, which makes "culture" a useful thing to type when a project holds a hundred
 * things and only some of them are cultures.
 */
export function matchesArtifactQuery(summary: ArtifactSummary, query: string): boolean {
  const haystack = `${summary.name} ${summary.kind}`.toLowerCase();

  return searchTerms(query).every((term) => haystack.includes(term));
}

/**
 * Filters a project's artifacts by name, kind, and tags.
 *
 * Tags go through `applyTagFilter` rather than a comparison written here, so artifacts filter by
 * exactly the mechanism tools and everything else tagged on the site already use.
 */
export function searchArtifacts(
  summaries: ArtifactSummary[],
  criteria: ArtifactSearchCriteria,
): ArtifactSummary[] {
  const { query, kind, tags } = criteria;
  const byTag =
    tags === undefined || tags.length === 0
      ? summaries
      : applyTagFilter(summaries, { includeAllTags: tags });

  return byTag.filter((summary) => {
    if (query && !matchesArtifactQuery(summary, query)) {
      return false;
    }
    return !(kind && summary.kind !== kind);
  });
}

/**
 * Groups artifacts under their kind. Kinds with nothing in them are left out entirely, so a
 * filtered listing does not show empty headings.
 *
 * `kindOrder` is how a caller gets registry order — the order kinds are declared in, which is what
 * a user sees everywhere else — without this library having to know the registry. Kinds absent
 * from it sort after the ones in it, alphabetically, so a project holding an artifact from a
 * newer build still lists it somewhere predictable rather than first.
 */
export function groupArtifactsByKind(
  summaries: ArtifactSummary[],
  kindOrder: ArtifactKind[] = [],
): ArtifactKindGroup[] {
  const groups = new Map<ArtifactKind, ArtifactSummary[]>();
  for (const summary of summaries) {
    const existing = groups.get(summary.kind);
    if (existing === undefined) {
      groups.set(summary.kind, [summary]);
    } else {
      existing.push(summary);
    }
  }

  const rank = (kind: ArtifactKind) => {
    const index = kindOrder.indexOf(kind);
    return index === -1 ? kindOrder.length : index;
  };
  return [...groups.entries()]
    .map(([kind, artifacts]) => ({ kind, artifacts }))
    .sort((a, b) => rank(a.kind) - rank(b.kind) || a.kind.localeCompare(b.kind));
}

/** Every distinct kind present, in the order the artifacts were given. */
export function artifactKindsOf(summaries: ArtifactSummary[]): ArtifactKind[] {
  return [...new Set(summaries.map((summary) => summary.kind))];
}

/**
 * Every distinct tag present, alphabetically — what a tag filter offers as its options. Sorted
 * rather than left in encounter order, because a list of checkboxes that reshuffles as artifacts
 * are added is a list nobody can use.
 */
export function artifactTagsOf(summaries: ArtifactSummary[]): string[] {
  return [...new Set(summaries.flatMap((summary) => summary.tags))].sort((a, b) =>
    a.localeCompare(b),
  );
}
