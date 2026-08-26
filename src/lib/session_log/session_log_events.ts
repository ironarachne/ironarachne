import type { SessionLogListener } from './session_log_types';

const listeners = new Set<SessionLogListener>();

/**
 * Be told when the log changes. Returns the unsubscribe.
 *
 * Deliberately plain, the way `artifacts/artifact_events.ts` is: no framework and no reactivity
 * system, because libraries here know nothing about Svelte and a component subscribing on mount
 * and unsubscribing on teardown is all this needs to be.
 */
export function onSessionLogChanged(listener: SessionLogListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Announce that the log has changed.
 *
 * A listener that throws is reported and the rest still run. One panel failing to redraw is not a
 * reason for a generator's roll to look like it failed.
 */
export function notifySessionLogChanged(): void {
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch (error: unknown) {
      console.error(error);
    }
  }
}

/** Drop every listener. For tests. */
export function resetSessionLogListeners(): void {
  listeners.clear();
}
