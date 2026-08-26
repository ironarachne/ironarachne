import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  notifySessionLogChanged,
  onSessionLogChanged,
  resetSessionLogListeners,
} from './session_log_events';

afterEach(() => {
  resetSessionLogListeners();
  vi.restoreAllMocks();
});

describe('onSessionLogChanged', () => {
  it('tells every listener the log moved', () => {
    const first = vi.fn();
    const second = vi.fn();
    onSessionLogChanged(first);
    onSessionLogChanged(second);

    notifySessionLogChanged();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops calling a listener that has unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = onSessionLogChanged(listener);

    unsubscribe();
    notifySessionLogChanged();

    expect(listener).not.toHaveBeenCalled();
  });

  it('registers a listener once, however many times it is added', () => {
    const listener = vi.fn();
    onSessionLogChanged(listener);
    onSessionLogChanged(listener);

    notifySessionLogChanged();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('runs the rest when one listener throws, and reports it', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const survivor = vi.fn();
    onSessionLogChanged(() => {
      throw new Error('a panel failed to redraw');
    });
    onSessionLogChanged(survivor);

    notifySessionLogChanged();

    expect(survivor).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('is not disturbed by a listener that unsubscribes while being notified', () => {
    const second = vi.fn();
    const stopFirst = onSessionLogChanged(() => stopFirst());
    onSessionLogChanged(second);

    notifySessionLogChanged();

    expect(second).toHaveBeenCalledTimes(1);
  });

  it('drops every listener on reset', () => {
    const listener = vi.fn();
    onSessionLogChanged(listener);

    resetSessionLogListeners();
    notifySessionLogChanged();

    expect(listener).not.toHaveBeenCalled();
  });
});
