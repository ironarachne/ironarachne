import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  notifyProjectsChanged,
  onProjectsChanged,
  resetProjectChangeListeners,
} from './project_events';
import type { ProjectChange } from './project_types';

const change: ProjectChange = { change: 'created', projectId: 'p1' };

afterEach(() => {
  resetProjectChangeListeners();
  vi.restoreAllMocks();
});

describe('onProjectsChanged', () => {
  it('hands every listener the change', () => {
    const first = vi.fn();
    const second = vi.fn();
    onProjectsChanged(first);
    onProjectsChanged(second);

    notifyProjectsChanged(change);

    expect(first).toHaveBeenCalledWith(change);
    expect(second).toHaveBeenCalledWith(change);
  });

  it('stops calling a listener that has unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = onProjectsChanged(listener);

    unsubscribe();
    notifyProjectsChanged(change);

    expect(listener).not.toHaveBeenCalled();
  });

  it('registers a listener once, however many times it is added', () => {
    const listener = vi.fn();
    onProjectsChanged(listener);
    onProjectsChanged(listener);

    notifyProjectsChanged(change);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('survives a listener unsubscribing from inside the notification', () => {
    const later = vi.fn();
    const unsubscribe = onProjectsChanged(() => unsubscribe());
    onProjectsChanged(later);

    expect(() => notifyProjectsChanged(change)).not.toThrow();
    expect(later).toHaveBeenCalledTimes(1);
  });
});

describe('notifyProjectsChanged', () => {
  it('runs the rest of the listeners when one throws, and reports it', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    const survivor = vi.fn();
    onProjectsChanged(() => {
      throw new Error('a project bar blew up');
    });
    onProjectsChanged(survivor);

    notifyProjectsChanged(change);

    expect(survivor).toHaveBeenCalledWith(change);
    expect(reported).toHaveBeenCalled();
  });

  it('does nothing when nobody is listening', () => {
    expect(() => notifyProjectsChanged(change)).not.toThrow();
  });
});

describe('resetProjectChangeListeners', () => {
  it('drops every listener', () => {
    const listener = vi.fn();
    onProjectsChanged(listener);

    resetProjectChangeListeners();
    notifyProjectsChanged(change);

    expect(listener).not.toHaveBeenCalled();
  });
});
