import type { RouteId } from '$app/types';
import type { Component } from 'svelte';

import type { ArtifactKind } from '$lib/artifact_kinds';
import type {
  ArtifactFailureReason,
  ArtifactProvenance,
  ArtifactReference,
  ArtifactSummary,
} from '$lib/artifacts';
import type { RulesetRef } from '$lib/rulesets';

/**
 * A request to a tool that is already mounted: roll this seed, with these settings.
 *
 * The tool↔panel boundary needed one, because nothing in the codebase could signal a mounted
 * tool. `ToolPanel` mounts its component keyed on the tool's path, so the only way to say anything
 * to a tool was to mount a different one — and the one precedent, heraldry's `?blazon=` URL cue,
 * does not compose with panels: the workshop is a single route, so a query parameter on it cannot
 * say which panel it addresses.
 *
 * `id` is minted at the moment of the request and is deliberately **not** carried over from
 * whatever the request came from. Replaying the same session-log entry twice is two distinct
 * requests, and a tool comparing seeds would swallow the second.
 */
export type ToolCue = {
  /** Fresh per request. What a tool watches; see {@link ToolPanelProps}. */
  id: string;
  seed: string;
  /** Settings as the tool understood them when it rolled. A tool applies what it recognises. */
  config: Record<string, unknown>;
};

/**
 * What a tool component may be handed when it is mounted in a panel.
 *
 * The contract for a tool that reads a cue, since the tools adopting it are the audience:
 *
 * - Read it with an effect that fires when the cue's **`id`** changes, not its contents.
 *   Replaying the same entry twice is two distinct requests, and comparing seeds would swallow
 *   the second.
 * - Apply the config keys you recognise and ignore the rest. A config from a differently-shaped
 *   build cannot arrive, because the session log does not outlive the build (decision 2 in
 *   docs/session-log.md).
 *
 * Reading a cue is opt-in, and a tool that ignores it needs no edit at all — see
 * {@link toolPanelComponent} for why the registry cannot say so in its own type.
 */
export type ToolPanelProps = {
  /** Absent unless something has asked this tool to roll a particular result again. */
  cue?: ToolCue;
};

/**
 * Loads the component that renders a tool inside a panel. Loading is deferred so a workshop
 * pulls in only the tool the user asked for, rather than every generator on the site.
 *
 * Deliberately still `Component` and not `Component<ToolPanelProps>`. A Svelte component's props
 * are contravariant in assignability, and a component declaring no props is
 * `Component<Record<string, never>>` — so widening the loader would reject all thirty tools that
 * do not read a cue, and the fix would be thirty files growing a prop they ignore.
 * {@link toolPanelComponent} is where that is reconciled instead.
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
  /** The pinned project default this generation consumed, when it consumed one. */
  ruleset?: RulesetRef;
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

/**
 * What a kind's editing component is handed, and the only thing it says back.
 *
 * It works in **snapshots**, not live values, because the snapshot is what is stored and what the
 * kind's `validate` speaks: an editor that edited a live value would have to run the codec both
 * ways on every keystroke, and the payload it produced would be one conversion further from what
 * the user is actually keeping.
 *
 * An editor owns its fields and nothing else. Dirty state, saving, re-rolling, renaming, and the
 * warning before edits are discarded all belong to the framework around it, which is the point of
 * the slot: a second kind supplying an editor gets those for free rather than inventing them.
 */
export type ArtifactEditorProps = {
  /** The stored snapshot, as the kind's `validate` accepted it. */
  snapshot: unknown;
  /**
   * Announces a replacement snapshot. Whole rather than a patch: the editor already holds the
   * shape and the framework deliberately does not, so a patch would need a merge that only the
   * kind could write.
   */
  onChange: (snapshot: unknown) => void;
};

/**
 * Loads the component that edits one kind's payload. Deferred, with the import specifier written
 * out in full, for the reason `tool_panels.ts` documents: a bundler can only split a dynamic
 * import it can see, and a computed specifier would pull every editor into whatever chunk opened
 * one artifact.
 */
export type ArtifactEditorLoader = () => Promise<{ default: Component<ArtifactEditorProps> }>;

/**
 * Rolls a fresh snapshot from an artifact's provenance — the destructive half of editing.
 *
 * It is handed the provenance rather than a seed and a config separately, so that a kind whose
 * generator grew a setting reads it from the record that was actually stored. It rolls; it does
 * not write. What it produces goes through the kind's `validate` on the way to storage like
 * anything else, so a roller that has drifted from its own snapshot shape is rejected rather
 * than believed.
 */
export type ArtifactRoller = (provenance: ArtifactProvenance) => unknown;

/** Loads a kind's roller, deferred for the same reason its editor is. */
export type ArtifactRollerLoader = () => Promise<ArtifactRoller>;

/**
 * What a kind's read-only view is handed. The snapshot, and nothing to say back.
 *
 * Separate from {@link ArtifactEditorProps} because they answer different requirements in
 * docs/workshop.md: 4.1 asks for an **editing view** covering every field a user would want to
 * change, and 6.3 asks for **output a user can take to the table** — a rendered coat of arms, an
 * SVG, a PDF. A kind can have the second long before it has the first, and heraldry does. Handing
 * a viewer an `onChange` it must never call would make "this kind is editable" a claim the
 * registry could no longer answer honestly.
 */
export type ArtifactViewerProps = {
  /** The stored snapshot, as the kind's `validate` accepted it. */
  snapshot: unknown;
};

/** Loads a kind's read-only view, deferred for the same reason an editor is. */
export type ArtifactViewerLoader = () => Promise<{ default: Component<ArtifactViewerProps> }>;

/**
 * What a kind registers to become editable.
 *
 * The roller sits beside the editor rather than in the kind registry because re-rolling exists to
 * undo edits: 4.3 in docs/workshop.md is about overwriting a user's changes, and a kind that
 * cannot be changed has nothing for a re-roll to destroy. Registering the two together is what
 * keeps "this artifact can be re-rolled" from being true of artifacts nobody can edit.
 */
export type ArtifactEditorEntry = {
  /** Absent when the kind cannot be edited yet, and then {@link loadViewer} decides what is shown. */
  loadEditor?: ArtifactEditorLoader;
  /** Absent when the kind cannot regenerate itself from provenance; then re-roll is not offered. */
  loadRoller?: ArtifactRollerLoader;
  /**
   * How the kind renders itself when it is not being edited.
   *
   * Absent for most kinds, which fall back to the generic snapshot view — the snapshot itself,
   * honestly, rather than a pretence at a view of it. A kind supplies one when the generic view
   * would be actively worse than what it can draw: a coat of arms shown as a list of tincture
   * names is not a coat of arms.
   */
  loadViewer?: ArtifactViewerLoader;
};

/**
 * What each artifact kind contributes to the panel an artifact opens in, keyed by kind id.
 *
 * Partial because a kind is storable long before it is editable — every kind starts that way, and
 * until it registers here its artifacts open read-only rather than not opening at all. An entry
 * with only a `loadViewer` is a kind that can show itself properly but not yet be changed, which
 * is a real state and not a half-finished one.
 */
export type ArtifactEditorRegistry = Partial<Record<ArtifactKind, ArtifactEditorEntry>>;

/** Why the payload of an artifact that is open for editing is not on screen. */
export type ArtifactEditingProblem = {
  reason: ArtifactFailureReason;
  message: string;
};

/**
 * An artifact opened for editing: what it is, what is in it, and what this build can do to it.
 *
 * The summary is always there and the snapshot may not be, which is the same bargain
 * `ArtifactReadResult` makes and for the same reason — a payload this build cannot read is still
 * an artifact the user must be able to see, rename, and export.
 */
export type ArtifactEditingTarget = {
  summary: ArtifactSummary;
  /** The stored snapshot. Absent when the payload could not be read; `problem` says why. */
  snapshot?: unknown;
  /** Why the payload is absent. Absent itself when there is nothing wrong. */
  problem?: ArtifactEditingProblem;
  /** True when the stored payload was older than the kind's current version and came forward. */
  migrated: boolean;
  /** The kind's editor. Absent means read-only, which is an ordinary state rather than a fault. */
  loadEditor?: ArtifactEditorLoader;
  /** The kind's roller. See {@link ArtifactEditorEntry} for why it travels with the editor. */
  loadRoller?: ArtifactRollerLoader;
  /** The kind's read-only view, used when it has no editor. Absent falls back to the generic one. */
  loadViewer?: ArtifactViewerLoader;
};

/**
 * Whether this artifact can be re-rolled, and when it cannot, which of the two reasons it is.
 *
 * They are different sentences on screen and different situations: `unsupported` is a kind that
 * has no roller, where offering the control at all would be a lie, and `no-provenance` is an
 * artifact with no record of its own origin — everything adopted from `ironarachne.save.v1.*`,
 * which had no seed to adopt — where the control belongs on screen saying why it is unavailable.
 */
export type ArtifactRerollAvailability = 'available' | 'unsupported' | 'no-provenance';

/** The changes an editing surface has accumulated and has not written yet. */
export type ArtifactEdits = {
  /** The name in the field. A blank one is not a change: the store keeps the name it had. */
  name: string;
  /**
   * The edited snapshot, or `undefined` when the payload has not been touched — which is every
   * artifact of a kind with no editor, and every artifact of one that has an editor until the
   * user changes something.
   */
  payload?: unknown;
};

/**
 * Why an edit could not be written. `missing-target` is the artifact having been deleted out from
 * under the surface, which is an ordinary state under rule 3 of docs/workshop.md rather than a
 * storage failure; `not-rerollable` and `roll-failed` are the two ways a re-roll stops short of
 * producing anything to store.
 */
export type ArtifactEditFailureReason =
  | ArtifactFailureReason
  | 'missing-target'
  | 'not-rerollable'
  | 'roll-failed';

/**
 * What writing an edit comes back with. Never `void`, like every other write in the workshop: the
 * caller has something on screen that is not yet stored, and an API that returned nothing would
 * make losing it the default.
 */
export type ArtifactEditResult =
  | { ok: true; summary: ArtifactSummary; snapshot?: unknown }
  | { ok: false; reason: ArtifactEditFailureReason; message: string };
