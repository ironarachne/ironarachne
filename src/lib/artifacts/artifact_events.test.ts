import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  notifyArtifactsChanged,
  onArtifactsChanged,
  resetArtifactChangeListeners,
} from './artifact_events';
import type { ArtifactChange } from './artifact_types';

const change: ArtifactChange = { change: 'created', projectId: 'p1', artifactId: 'a1' };

afterEach(() => {
  resetArtifactChangeListeners();
  vi.restoreAllMocks();
});

describe('onArtifactsChanged', () => {
  it('hands every listener the change', () => {
    const first = vi.fn();
    const second = vi.fn();
    onArtifactsChanged(first);
    onArtifactsChanged(second);

    notifyArtifactsChanged(change);

    expect(first).toHaveBeenCalledWith(change);
    expect(second).toHaveBeenCalledWith(change);
  });

  it('stops calling a listener that has unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = onArtifactsChanged(listener);

    unsubscribe();
    notifyArtifactsChanged(change);

    expect(listener).not.toHaveBeenCalled();
  });

  it('registers a listener once, however many times it is added', () => {
    const listener = vi.fn();
    onArtifactsChanged(listener);
    onArtifactsChanged(listener);

    notifyArtifactsChanged(change);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('survives a listener unsubscribing from inside the notification', () => {
    const later = vi.fn();
    const unsubscribe = onArtifactsChanged(() => unsubscribe());
    onArtifactsChanged(later);

    expect(() => notifyArtifactsChanged(change)).not.toThrow();
    expect(later).toHaveBeenCalledTimes(1);
  });
});

describe('notifyArtifactsChanged', () => {
  it('runs the rest of the listeners when one throws, and reports it', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    const survivor = vi.fn();
    onArtifactsChanged(() => {
      throw new Error('a panel blew up');
    });
    onArtifactsChanged(survivor);

    notifyArtifactsChanged(change);

    expect(survivor).toHaveBeenCalledWith(change);
    expect(reported).toHaveBeenCalled();
  });

  it('does nothing when nobody is listening', () => {
    expect(() => notifyArtifactsChanged(change)).not.toThrow();
  });
});

describe('resetArtifactChangeListeners', () => {
  it('drops every listener', () => {
    const listener = vi.fn();
    onArtifactsChanged(listener);

    resetArtifactChangeListeners();
    notifyArtifactsChanged(change);

    expect(listener).not.toHaveBeenCalled();
  });
});
