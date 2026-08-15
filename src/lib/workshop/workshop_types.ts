import type { RouteId } from '$app/types';
import type { Component } from 'svelte';

import type { ArtifactKind } from '$lib/artifact_kinds';
import type { ArtifactFailureReason, ArtifactReference, ArtifactSummary } from '$lib/artifacts';

/**
 * Loads the component that renders a tool inside a panel. Loading is deferred so a workshop
 * pulls in only the tool the user asked for, rather than every generator on the site.
 */
export type ToolPanelLoader = () => Promise<{ default: Component }>;

/**
 * The panel component for each tool, keyed by the tool's catalog path. Partial because a route
 * that is not a tool has no panel, and a tool may be added to the catalog before it has one.
 */
export type ToolPanelRegistry = Partial<Record<RouteId, ToolPanelLoader>>;

/**
 * What a tool hands over when the user keeps something it made.
 *
 * `payload` is a **snapshot**, not the live value: a tool already owns the conversion — it is the
 * `toSnapshot` half of its kind's codec — and asking for the snapshot keeps saving off the codec
 * loader, which is the expensive half, on the one path where the user is waiting.
 */
export type ToolArtifactDraft = {
  kind: ArtifactKind;
  payload: unknown;
  /** The tool's catalog path, recorded as provenance. */
  toolPath: RouteId;
  /**
   * The seed the payload was rolled from. Absent for a tool that has none, and absent rather than
   * invented for anything else: provenance is a record of origin, and a made-up seed is a lie the
   * re-roll button would act on.
   */
  seed?: string;
  /** Generator settings as the tool understood them. */
  config?: Record<string, unknown>;
  /** What to call it. The kind's `nameOf` decides when this is blank. */
  name?: string;
  tags?: string[];
  /**
   * The saved artifacts this one was built from — what the picker filled in. Empty for a tool
   * that was handed nothing, which is every tool until the user takes the offer up: composition
   * is opt-in, per rule 1 in docs/workshop.md.
   */
  references?: ArtifactReference[];
};

/**
 * Why a saved artifact could not be turned back into something a tool can use.
 *
 * `missing-target` is the reference case and it is the reason this is not simply
 * `ArtifactFailureReason`: an artifact that has been deleted out from under a picker is an
 * ordinary state under rule 3, not a storage failure, and the two want different words on screen.
 */
export type ArtifactValueFailureReason = ArtifactFailureReason | 'missing-target';

/**
 * A saved artifact rebuilt into the live value its library works with.
 *
 * A rejection carries the summary when there is one to carry — the same bargain
 * `ArtifactReadResult` makes — so a picker can say which artifact it could not use rather than
 * only that something failed. `missing-target` is the one case with no summary at all.
 */
export type ArtifactValueResult<TValue = unknown> =
  | { ok: true; summary: ArtifactSummary; value: TValue }
  | {
      ok: false;
      summary?: ArtifactSummary;
      reason: ArtifactValueFailureReason;
      message: string;
    };
