import {
  WORKSPACE_VERSION,
  type PanelState,
  type PanelTarget,
  type ProjectWorkspace,
} from './workspace_types';

/** How many panels one bench may hold. */
export const MAX_PANELS = 8;

/**
 * A panel's identity: what it holds.
 *
 * Prefixed by side, so a tool path and an artifact id can never collide. Opening something
 * already on the bench is a move rather than a second copy, so this is what "already open" is
 * decided on — see {@link PanelState}.
 */
export function panelKey(panel: PanelState | PanelTarget): string {
  return panel.toolPath === undefined ? `artifact:${panel.artifactId}` : `tool:${panel.toolPath}`;
}

/** An empty bench for a project. What a new project starts with, and what an unreadable one resets to. */
export function emptyWorkspace(projectId: string): ProjectWorkspace {
  return { projectId, workspaceVersion: WORKSPACE_VERSION, panels: [] };
}

function panelFromTarget(target: PanelTarget, order: number): PanelState {
  return target.toolPath === undefined
    ? { order, artifactId: target.artifactId }
    : { order, toolPath: target.toolPath };
}

/**
 * The bench holds at most one tool, keeping the rightmost — which is the most recently opened,
 * since {@link withPanelOpened} appends.
 *
 * Artifacts are not capped: the composition case in docs/workshop.md is a settlement open beside
 * the region generator being built from it, and that still wants several things visible. What is
 * single is the *instrument*.
 *
 * Applied inside {@link renumberPanels} rather than only at the point a tool is opened, because a
 * bench stored before this rule existed can hold several, and reading one has to produce a bench
 * that obeys the invariant rather than one that merely stops breaking it from here on.
 */
function withSingleTool(panels: PanelState[]): PanelState[] {
  const lastTool = panels.reduce(
    (last, panel, index) => (panel.toolPath === undefined ? last : index),
    -1,
  );
  return lastTool === -1
    ? panels
    : panels.filter((panel, index) => panel.toolPath === undefined || index === lastTool);
}

/**
 * Panels renumbered from 0 in the order the array already has, deduplicated, reduced to a single
 * tool, and capped.
 *
 * **Array position is what a bench means here, not the `order` field.** The field is how the
 * arrangement survives a round trip through storage, and it is stamped from the array rather than
 * read back into it — otherwise moving a panel would be undone by the stale numbers travelling
 * with it.
 *
 * The cap is applied after the single-tool rule, so dropping surplus tools frees room rather than
 * letting them push artifacts off the left-hand end on the way out.
 */
export function renumberPanels(panels: PanelState[]): PanelState[] {
  const seen = new Set<string>();
  const unique = panels.filter((panel) => {
    const key = panelKey(panel);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return withSingleTool(unique)
    .slice(0, MAX_PANELS)
    .map((panel, index) => ({ ...panel, order: index }));
}

/**
 * Panels in stored bench order, renumbered from 0.
 *
 * The one place `order` is read rather than written: stored values are whatever was last put in
 * the database and are not promised to be contiguous or even sorted. Everything after this point
 * works on array position.
 */
export function normalizePanels(panels: PanelState[]): PanelState[] {
  return renumberPanels([...panels].sort((a, b) => a.order - b.order));
}

function withPanels(workspace: ProjectWorkspace, panels: PanelState[]): ProjectWorkspace {
  return { ...workspace, panels: renumberPanels(panels) };
}

export function isPanelOpen(workspace: ProjectWorkspace, target: PanelTarget): boolean {
  const key = panelKey(target);
  return workspace.panels.some((panel) => panelKey(panel) === key);
}

/**
 * Put something on the bench, at the right-hand end.
 *
 * Opening what is already open returns the workspace unchanged rather than duplicating it, so a
 * user clicking a tool twice does not end up with two of it. A bench already holding
 * {@link MAX_PANELS} drops its leftmost panel to make room: refusing instead would leave the user
 * to work out which panel is in the way of the one they just asked for.
 *
 * Opening a **tool** takes the tool that was there off first: one instrument at a time. The
 * removal happens here rather than being left to `renumberPanels` so that replacing a tool costs
 * nothing else — the bench is back under the cap before the new panel is added, and no artifact is
 * evicted to make room for something that displaced a panel of its own.
 */
export function withPanelOpened(
  workspace: ProjectWorkspace,
  target: PanelTarget,
): ProjectWorkspace {
  if (isPanelOpen(workspace, target)) {
    return workspace;
  }
  const existing =
    target.toolPath === undefined
      ? workspace.panels
      : workspace.panels.filter((panel) => panel.toolPath === undefined);
  const kept = existing.slice(Math.max(0, existing.length - (MAX_PANELS - 1)));
  return withPanels(workspace, [...kept, panelFromTarget(target, kept.length)]);
}

/** Take something off the bench. Closing what is not open changes nothing. */
export function withPanelClosed(
  workspace: ProjectWorkspace,
  target: PanelTarget,
): ProjectWorkspace {
  const key = panelKey(target);
  return withPanels(
    workspace,
    workspace.panels.filter((panel) => panelKey(panel) !== key),
  );
}

/**
 * Move a panel one position along the bench. A move off either end changes nothing, so a user
 * holding down "move left" stops at the left rather than wrapping around to the right.
 */
export function withPanelMoved(
  workspace: ProjectWorkspace,
  target: PanelTarget,
  direction: -1 | 1,
): ProjectWorkspace {
  const key = panelKey(target);
  const panels = [...workspace.panels];
  const from = panels.findIndex((panel) => panelKey(panel) === key);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= panels.length) {
    return workspace;
  }
  [panels[from], panels[to]] = [panels[to], panels[from]];
  return withPanels(workspace, panels);
}

/**
 * Drop panels holding something that is no longer there — a deleted artifact, a tool this build
 * has removed.
 *
 * Silently, and that is the deliberate carve-out decision 3 makes from invariant 2: the invariant
 * protects *work*, and a bench is not work. Quarantining a layout would be absurd; the panel just
 * goes.
 */
export function withUnresolvablePanelsDropped(
  workspace: ProjectWorkspace,
  isResolvable: (panel: PanelState) => boolean,
): ProjectWorkspace {
  return withPanels(workspace, workspace.panels.filter(isResolvable));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toPanelState(value: unknown): PanelState | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.order !== 'number' || !Number.isFinite(record.order)) {
    return undefined;
  }
  // Exactly one of the two, because a panel holding both would leave the renderer to guess which
  // half the user meant.
  const hasTool = typeof record.toolPath === 'string' && record.toolPath !== '';
  const hasArtifact = typeof record.artifactId === 'string' && record.artifactId !== '';
  if (hasTool === hasArtifact) {
    return undefined;
  }
  return hasTool
    ? { order: record.order, toolPath: record.toolPath as string }
    : { order: record.order, artifactId: record.artifactId as string };
}

/**
 * A stored record as a workspace, or `undefined` when it is not one.
 *
 * Unreadable panels are dropped individually and an unreadable workspace resets to an empty
 * bench; the caller decides which, since only it knows the project id to reset under. Nothing is
 * repaired by guessing, but nothing here is worth refusing to open a project over either.
 */
export function toProjectWorkspace(value: unknown): ProjectWorkspace | undefined {
  const record = asRecord(value);
  if (record === null || typeof record.projectId !== 'string' || record.projectId === '') {
    return undefined;
  }
  if (record.workspaceVersion !== WORKSPACE_VERSION || !Array.isArray(record.panels)) {
    return undefined;
  }
  const panels = record.panels
    .map(toPanelState)
    .filter((panel): panel is PanelState => panel !== undefined);
  return {
    projectId: record.projectId,
    workspaceVersion: WORKSPACE_VERSION,
    panels: normalizePanels(panels),
  };
}
