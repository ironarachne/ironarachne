import type { ArtifactReference, ArtifactSummary } from './artifact_types';
import { getArtifactSummary, listArtifacts } from './artifacts';

/**
 * A reference paired with what it points at.
 *
 * `target` is optional because a missing target is an ordinary state rather than an error, per
 * rule 3 in docs/workshop.md: an artifact may be deleted while something still names it, and what
 * survives has to render as visibly broken rather than take out its consumer.
 */
export type ResolvedArtifactReference = {
  reference: ArtifactReference;
  /** The artifact the reference names, or `undefined` when this project no longer holds it. */
  target?: ArtifactSummary;
};

/**
 * One artifact that points at another, with the references that do the pointing.
 *
 * Grouped by referrer rather than listed one reference at a time because that is the question a
 * user asks — "which of my regions use this culture?" — and a region naming the same culture as
 * both its capital's and its own would otherwise appear twice in the answer.
 */
export type ArtifactBacklink = {
  referrer: ArtifactSummary;
  /** Every reference that referrer holds against the artifact, in the order it declares them. */
  references: ArtifactReference[];
};

/**
 * Every reference an artifact declares, each with the artifact it names or nothing.
 *
 * Synchronous, and against the hydrated index rather than the database, exactly like
 * `listArtifacts`: resolving what a panel is about to draw must not make it wait.
 *
 * A target outside this project never resolves. References point within a project only
 * (docs/workshop.md, "Composition"), so an id naming something in another project is as broken as
 * an id naming nothing at all, and reporting it as resolved would invent the cross-project edge
 * the model does not have.
 */
export function resolveArtifactReferences(
  projectId: string,
  summary: ArtifactSummary,
): ResolvedArtifactReference[] {
  return summary.references.map((reference) => {
    const target = getArtifactSummary(projectId, reference.targetId);
    return target === undefined ? { reference } : { reference, target };
  });
}

/** The references of one artifact that name something no longer here. */
export function brokenArtifactReferences(
  projectId: string,
  summary: ArtifactSummary,
): ArtifactReference[] {
  return resolveArtifactReferences(projectId, summary)
    .filter((resolved) => resolved.target === undefined)
    .map((resolved) => resolved.reference);
}

/**
 * Whether an artifact points at anything that is gone — what a listing needs to badge a row.
 *
 * Separate from {@link brokenArtifactReferences} because a listing asks this of every row it
 * draws and does not need the references themselves; this stops at the first one.
 */
export function hasBrokenArtifactReferences(projectId: string, summary: ArtifactSummary): boolean {
  return summary.references.some(
    (reference) => getArtifactSummary(projectId, reference.targetId) === undefined,
  );
}

/**
 * What points at an artifact, grouped by the artifact doing the pointing.
 *
 * The delete prompt is built from this, and it answers "which of my regions use this culture?" on
 * its own. Cheap because references live in the summary, so this reads memory rather than every
 * payload in the project.
 *
 * A self-reference is reported like any other. Cycles are legitimate — a realm's ruler is a
 * character from that realm — and hiding one here would only mean the delete prompt understated
 * what it was about to break.
 */
export function listArtifactBacklinks(projectId: string, id: string): ArtifactBacklink[] {
  const backlinks: ArtifactBacklink[] = [];
  for (const referrer of listArtifacts(projectId)) {
    const references = referrer.references.filter((reference) => reference.targetId === id);
    if (references.length > 0) {
      backlinks.push({ referrer, references });
    }
  }
  return backlinks;
}

/**
 * Every artifact reachable from one, following references as far as they go.
 *
 * Breadth-first from the artifact's own references, so the things it names directly come first.
 * **The artifact itself is never in the result**, including when a cycle leads back to it: the
 * question is what it reaches, and a project is not a thing that reaches itself.
 *
 * Cycle-tolerant by construction. Every id is visited once, so `A → B → A` terminates, and so
 * does an artifact that names itself. Anything walking references has to survive this, per
 * docs/workshop.md — cycles are normal, not a bug to detect.
 *
 * References naming something that is gone are simply not followed; a dangling edge stops the walk
 * rather than ending it.
 */
export function collectReferencedArtifacts(projectId: string, id: string): ArtifactSummary[] {
  const root = getArtifactSummary(projectId, id);
  if (root === undefined) {
    return [];
  }

  const visited = new Set<string>([id]);
  const reached: ArtifactSummary[] = [];
  const queue: ArtifactSummary[] = [root];
  while (queue.length > 0) {
    const current = queue.shift() as ArtifactSummary;
    for (const reference of current.references) {
      if (visited.has(reference.targetId)) {
        continue;
      }
      visited.add(reference.targetId);
      const target = getArtifactSummary(projectId, reference.targetId);
      if (target !== undefined) {
        reached.push(target);
        queue.push(target);
      }
    }
  }
  return reached;
}
