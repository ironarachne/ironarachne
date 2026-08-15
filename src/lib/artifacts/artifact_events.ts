import type { ArtifactChange, ArtifactChangeListener } from './artifact_types';

const listeners = new Set<ArtifactChangeListener>();

/**
 * Be told when an artifact is created, changed, or deleted. Returns the unsubscribe.
 *
 * This exists because the workshop has more than one thing on screen looking at the same project:
 * a generator saving from inside a panel and the project view listing what the project holds have
 * no other way to hear about each other. Polling the index would be the alternative, and a list
 * that redraws on a timer is both wasteful and, at the moment it matters, still stale.
 *
 * Deliberately plain: no framework, no reactivity system. Libraries here know nothing about
 * Svelte, and a component subscribing in `onMount` and unsubscribing on teardown is all this
 * needs to be.
 */
export function onArtifactsChanged(listener: ArtifactChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Announce a committed change. **Called only after the transaction behind it has committed**, for
 * the same reason the hydrated index is: a listener told about a save the database does not have
 * would redraw as though the work were safe.
 *
 * A listener that throws is reported and the rest still run. One panel failing to redraw is not a
 * reason for a save to look like it failed.
 */
export function notifyArtifactsChanged(change: ArtifactChange): void {
  for (const listener of [...listeners]) {
    try {
      listener(change);
    } catch (error: unknown) {
      console.error(error);
    }
  }
}

/** Drop every listener. For tests, and for anything replacing the whole store. */
export function resetArtifactChangeListeners(): void {
  listeners.clear();
}
