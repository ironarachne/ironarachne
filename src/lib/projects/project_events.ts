import type { ProjectChangeListener, ProjectChange } from './project_types';

const listeners = new Set<ProjectChangeListener>();

/**
 * Be told when a project is created, changed, deleted, or opened. Returns the unsubscribe.
 *
 * The workshop has more than one surface touching projects: the context bar at the top, and a
 * generator saving from inside a panel, which may create a project and open it. Neither knows the
 * other exists, and without this the bar would go on showing "no project yet" over a project the
 * user has just put a culture into.
 *
 * The same plain mechanism `$lib/artifacts` uses, for the same reason: libraries here know nothing
 * about Svelte, and a component subscribing on mount is all this has to be.
 */
export function onProjectsChanged(listener: ProjectChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Announce a committed change. **Called only after the write behind it has succeeded**, so nothing
 * redraws as though a project were saved that the database does not have.
 *
 * Deliberately not raised by `getActiveProject`. That function resolves a stale pointer by writing
 * a new one, so announcing from it would mean a listener that re-reads the active project could
 * set itself off again — a read that notifies is a loop waiting for a subscriber.
 */
export function notifyProjectsChanged(change: ProjectChange): void {
  for (const listener of [...listeners]) {
    try {
      listener(change);
    } catch (error: unknown) {
      console.error(error);
    }
  }
}

/** Drop every listener. For tests, and for anything replacing the whole store. */
export function resetProjectChangeListeners(): void {
  listeners.clear();
}
