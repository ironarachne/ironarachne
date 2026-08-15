import { afterEach, describe, expect, it, vi } from 'vitest';

import { measureStorageEstimate, readPersistenceState } from './storage_estimate';

/** Replaces `navigator` wholesale, which is the only way to take `storage` off it. */
function stubNavigatorStorage(storage: unknown): void {
  vi.stubGlobal('navigator', { storage });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('measuring the origin estimate', () => {
  it('reports what the browser answered', async () => {
    stubNavigatorStorage({ estimate: () => Promise.resolve({ usage: 4096, quota: 1_000_000 }) });

    expect(await measureStorageEstimate(1700)).toEqual({
      usageBytes: 4096,
      quotaBytes: 1_000_000,
      measuredAt: 1700,
    });
  });

  it('reports zero usage, which is a real answer rather than a missing one', async () => {
    stubNavigatorStorage({ estimate: () => Promise.resolve({ usage: 0, quota: 500 }) });

    expect(await measureStorageEstimate(1700)).toEqual({
      usageBytes: 0,
      quotaBytes: 500,
      measuredAt: 1700,
    });
  });

  it('leaves both figures out when the browser has no estimate()', async () => {
    stubNavigatorStorage({});

    const measurement = await measureStorageEstimate(1700);

    expect(measurement).toEqual({ measuredAt: 1700 });
    // Absent, never zero: zero is a claim that the origin stores nothing.
    expect('usageBytes' in measurement).toBe(false);
    expect('quotaBytes' in measurement).toBe(false);
  });

  it('leaves both figures out when there is no navigator at all', async () => {
    vi.stubGlobal('navigator', undefined);

    expect(await measureStorageEstimate(1700)).toEqual({ measuredAt: 1700 });
  });

  it('leaves both figures out when estimate() rejects', async () => {
    stubNavigatorStorage({ estimate: () => Promise.reject(new Error('refused')) });

    expect(await measureStorageEstimate(1700)).toEqual({ measuredAt: 1700 });
  });

  it('drops a figure the browser gave that no display could use, keeping the other', async () => {
    stubNavigatorStorage({
      estimate: () => Promise.resolve({ usage: Number.NaN, quota: 1_000_000 }),
    });

    expect(await measureStorageEstimate(1700)).toEqual({
      quotaBytes: 1_000_000,
      measuredAt: 1700,
    });
  });

  it('drops a negative figure rather than repairing it', async () => {
    stubNavigatorStorage({ estimate: () => Promise.resolve({ usage: -1, quota: -1 }) });

    expect(await measureStorageEstimate(1700)).toEqual({ measuredAt: 1700 });
  });

  it('drops a figure that is not a number', async () => {
    stubNavigatorStorage({
      estimate: () => Promise.resolve({ usage: '4096' as unknown as number, quota: 10 }),
    });

    expect(await measureStorageEstimate(1700)).toEqual({ quotaBytes: 10, measuredAt: 1700 });
  });

  it('stamps the measurement with the current time when none is supplied', async () => {
    stubNavigatorStorage({ estimate: () => Promise.resolve({ usage: 1, quota: 2 }) });

    const before = Date.now();
    const measurement = await measureStorageEstimate();

    expect(measurement.measuredAt).toBeGreaterThanOrEqual(before);
    expect(measurement.measuredAt).toBeLessThanOrEqual(Date.now());
  });
});

describe('reading the persistence state', () => {
  it('is persisted when the browser has promised not to evict', async () => {
    stubNavigatorStorage({ persisted: () => Promise.resolve(true) });

    expect(await readPersistenceState()).toBe('persisted');
  });

  it('is notPersisted when the browser answers that it has not', async () => {
    stubNavigatorStorage({ persisted: () => Promise.resolve(false) });

    expect(await readPersistenceState()).toBe('notPersisted');
  });

  it('is unknown, not notPersisted, when the browser has no persisted()', async () => {
    stubNavigatorStorage({});

    expect(await readPersistenceState()).toBe('unknown');
  });

  it('is unknown when there is no navigator at all', async () => {
    vi.stubGlobal('navigator', undefined);

    expect(await readPersistenceState()).toBe('unknown');
  });

  it('is unknown when persisted() rejects', async () => {
    stubNavigatorStorage({ persisted: () => Promise.reject(new Error('refused')) });

    expect(await readPersistenceState()).toBe('unknown');
  });
});
