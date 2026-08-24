import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  lastPersistenceRequest,
  requestPersistenceIfWarranted,
  resetPersistenceRequestSession,
} from './persistence_request';

/**
 * A `navigator.storage` that answers `persisted()` and `persist()`, counting the prompts.
 *
 * `persisted` moves to true once a request is granted, the way a real browser does, so a test can
 * ask twice and see the second call take the "already protected" branch for the real reason rather
 * than because the stub was rewritten between calls.
 */
function stubNavigator(options: { persisted?: boolean; grants?: boolean } = {}) {
  let persisted = options.persisted ?? false;
  const persist = vi.fn(() => {
    if (options.grants === true) {
      persisted = true;
    }
    return Promise.resolve(options.grants === true);
  });
  vi.stubGlobal('navigator', {
    storage: { persisted: () => Promise.resolve(persisted), persist },
  });
  return persist;
}

beforeEach(() => {
  resetPersistenceRequestSession();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requesting persistence when it is warranted', () => {
  it('asks on the first completed work of a session and reports a grant', async () => {
    const persist = stubNavigator({ grants: true });

    const request = await requestPersistenceIfWarranted('projectCreated', 1700);

    expect(request).toEqual({
      trigger: 'projectCreated',
      requestedAt: 1700,
      outcome: 'granted',
    });
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('reports a refusal as refused, which is not the same answer as unavailable', async () => {
    stubNavigator({ grants: false });

    const request = await requestPersistenceIfWarranted('projectCreated');

    expect(request.outcome).toBe('refused');
  });

  it('does not ask twice in one session, whatever the second trigger was', async () => {
    const persist = stubNavigator({ grants: false });

    await requestPersistenceIfWarranted('projectCreated');
    const second = await requestPersistenceIfWarranted('vaultExported', 1800);

    expect(second).toEqual({ trigger: 'vaultExported', requestedAt: 1800, outcome: 'notAsked' });
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('asks again in a new session, because a session is the page’s lifetime', async () => {
    const persist = stubNavigator({ grants: false });
    await requestPersistenceIfWarranted('projectCreated');

    resetPersistenceRequestSession();
    const request = await requestPersistenceIfWarranted('projectExported');

    expect(request.outcome).toBe('refused');
    expect(persist).toHaveBeenCalledTimes(2);
  });

  it('never asks an origin that is already protected', async () => {
    const persist = stubNavigator({ persisted: true });

    const request = await requestPersistenceIfWarranted('vaultExported');

    expect(request.outcome).toBe('alreadyPersisted');
    expect(persist).not.toHaveBeenCalled();
  });

  it('does not re-prompt after a grant, because the origin is now protected', async () => {
    const persist = stubNavigator({ grants: true });
    await requestPersistenceIfWarranted('projectCreated');
    resetPersistenceRequestSession();

    const request = await requestPersistenceIfWarranted('vaultExported');

    expect(request.outcome).toBe('alreadyPersisted');
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('reports unavailable rather than rejecting when persist() throws', async () => {
    vi.stubGlobal('navigator', {
      storage: {
        persisted: () => Promise.resolve(false),
        persist: () => Promise.reject(new Error('refused to answer')),
      },
    });

    const request = await requestPersistenceIfWarranted('projectCreated');

    expect(request.outcome).toBe('unavailable');
  });

  it('reports unavailable on a browser with no persist() at all', async () => {
    vi.stubGlobal('navigator', { storage: { persisted: () => Promise.resolve(false) } });

    expect((await requestPersistenceIfWarranted('projectCreated')).outcome).toBe('unavailable');
  });

  it('reports unavailable rather than throwing when there is no navigator', async () => {
    vi.stubGlobal('navigator', undefined);

    expect((await requestPersistenceIfWarranted('projectCreated')).outcome).toBe('unavailable');
  });

  it('asks a browser that cannot say whether it is persisted, rather than assuming it is', async () => {
    // No `persisted()` reads as unknown, and unknown is not "already protected": the whole point of
    // asking is that the answer might change.
    const persist = vi.fn(() => Promise.resolve(true));
    vi.stubGlobal('navigator', { storage: { persist } });

    expect((await requestPersistenceIfWarranted('projectCreated')).outcome).toBe('granted');
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('raises one prompt when two completions land in the same tick', async () => {
    const persist = stubNavigator({ grants: false });

    const [first, second] = await Promise.all([
      requestPersistenceIfWarranted('projectCreated'),
      requestPersistenceIfWarranted('vaultExported'),
    ]);

    expect(persist).toHaveBeenCalledTimes(1);
    expect([first.outcome, second.outcome].sort()).toEqual(['notAsked', 'refused']);
  });

  it('remembers the last pass, and reports none before the first', async () => {
    expect(lastPersistenceRequest()).toBeNull();
    stubNavigator({ grants: true });

    await requestPersistenceIfWarranted('projectExported', 1900);

    expect(lastPersistenceRequest()).toEqual({
      trigger: 'projectExported',
      requestedAt: 1900,
      outcome: 'granted',
    });
  });

  it('stamps the moment itself when the caller does not supply one', async () => {
    stubNavigator({ grants: true });

    const request = await requestPersistenceIfWarranted('projectCreated');

    expect(request.requestedAt).toBeGreaterThan(0);
  });
});
