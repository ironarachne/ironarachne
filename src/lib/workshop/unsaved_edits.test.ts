import { describe, expect, it } from 'vitest';

import { hasAnyUnsavedEdits, hasUnsavedEdits, trackUnsavedEdits } from './unsaved_edits';

describe('tracking unsaved edits', () => {
  it('says nothing is held when nothing is registered', () => {
    expect(hasUnsavedEdits('artifact-1')).toBe(false);
    expect(hasAnyUnsavedEdits()).toBe(false);
  });

  it('asks the guard each time rather than remembering an answer', () => {
    let dirty = false;
    const stop = trackUnsavedEdits('artifact-1', () => dirty);

    expect(hasUnsavedEdits('artifact-1')).toBe(false);
    dirty = true;
    expect(hasUnsavedEdits('artifact-1')).toBe(true);
    expect(hasAnyUnsavedEdits()).toBe(true);

    stop();
    expect(hasUnsavedEdits('artifact-1')).toBe(false);
    expect(hasAnyUnsavedEdits()).toBe(false);
  });

  it('keeps one surface’s answer out of another’s', () => {
    const stopFirst = trackUnsavedEdits('artifact-1', () => true);
    const stopSecond = trackUnsavedEdits('artifact-2', () => false);

    expect(hasUnsavedEdits('artifact-1')).toBe(true);
    expect(hasUnsavedEdits('artifact-2')).toBe(false);
    expect(hasAnyUnsavedEdits()).toBe(true);

    stopFirst();
    stopSecond();
  });

  /**
   * The remount case: a panel showing the same artifact is torn down after its replacement has
   * registered. Letting the older teardown win would silence a surface that is on screen and
   * holding edits, which is the one thing this must not do.
   */
  it('ignores a teardown from a guard that has already been replaced', () => {
    const stopOld = trackUnsavedEdits('artifact-1', () => false);
    const stopNew = trackUnsavedEdits('artifact-1', () => true);

    stopOld();

    expect(hasUnsavedEdits('artifact-1')).toBe(true);
    stopNew();
    expect(hasUnsavedEdits('artifact-1')).toBe(false);
  });
});
