/**
 * The version of the workspace shape this build writes.
 *
 * Its own number rather than the file format's or a payload's, per decision 3 in
 * docs/workshop.md: panel shape will churn faster than either, and a workspace that cannot be
 * read resets to a default bench rather than being quarantined. There is deliberately no
 * migration chain here — a bench is not work.
 */
export const WORKSPACE_VERSION = 1 as const;

/**
 * One panel on the bench: a mounted tool or an open artifact, never both.
 *
 * The domain model draws this as two optional fields because Mermaid has no union; the type is
 * the union it was approximating, so a panel that names neither cannot be constructed.
 *
 * There is no panel id, and that is deliberate: a panel *is* what it holds. Two panels showing
 * the same tool would be two copies of one thing with separately drifting state, so opening
 * something already on the bench moves to it rather than duplicating it — which makes the
 * content its own key. {@link panelKey} is that key.
 */
export type PanelState =
  | {
      /** Position on the bench, left to right. Contiguous from 0 in a normalized workspace. */
      order: number;
      /** A tool catalog path. */
      toolPath: string;
      artifactId?: undefined;
    }
  | {
      order: number;
      toolPath?: undefined;
      /** An artifact in the workspace's own project. */
      artifactId: string;
    };

/**
 * A project's bench, as it was left.
 *
 * Persisted per project so reopening a project restores what was open, and deliberately not a
 * user-visible concept: no named layouts, no layout manager. It travels in vault and project
 * exports and is absent from artifact exports, having nothing to attach to.
 */
export type ProjectWorkspace = {
  projectId: string;
  workspaceVersion: typeof WORKSPACE_VERSION;
  panels: PanelState[];
};

/** What a caller asks to open, before it has a position on the bench. */
export type PanelTarget =
  | { toolPath: string; artifactId?: undefined }
  | { toolPath?: undefined; artifactId: string };
