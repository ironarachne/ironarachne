import type { RouteId } from '$app/types';
import type { Component } from 'svelte';

import type { ArtifactKind } from '$lib/artifact_kinds';

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
};
