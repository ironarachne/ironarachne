/**
 * Who on the page is holding edits that have not been written.
 *
 * The workshop is one route with several panels on it, so the ways a user loses work are not all
 * navigations: closing the panel is the likeliest one, and the control that closes it belongs to
 * the bench rather than to the surface doing the editing. Something has to let the bench ask, and
 * a shared registry keyed by what the panel holds is the smallest thing that can answer.
 *
 * It holds predicates rather than a boolean, so the answer is computed when it is asked for. A
 * flag pushed in on every keystroke would be a second copy of the surface's dirty state, and the
 * copy is what would be stale at the moment it mattered.
 */
const guards = new Map<string, () => boolean>();

/**
 * Report that whatever is under `key` may be holding unsaved edits, and hand back the
 * unregistration. The caller is a component: registering on mount and unregistering on teardown is
 * what keeps a closed panel from answering for one that is still open.
 *
 * Registering the same key twice replaces the guard, and only the guard that is current is
 * removed — so a surface remounted for the same artifact cannot be silenced by the teardown of
 * the one it replaced.
 */
export function trackUnsavedEdits(key: string, isDirty: () => boolean): () => void {
  guards.set(key, isDirty);
  return () => {
    if (guards.get(key) === isDirty) {
      guards.delete(key);
    }
  };
}

/** Whether what is under `key` is holding unsaved edits. False when nothing is registered. */
export function hasUnsavedEdits(key: string): boolean {
  return guards.get(key)?.() ?? false;
}

/** Whether anything on the page is. What a whole-page guard asks before letting go of it. */
export function hasAnyUnsavedEdits(): boolean {
  return [...guards.values()].some((isDirty) => isDirty());
}
