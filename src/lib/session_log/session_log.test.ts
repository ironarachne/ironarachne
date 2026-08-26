import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  canonicalSessionConfig,
  clearSessionLog,
  listSessionLog,
  newSessionLogEntryId,
  recordGeneration,
  sessionLogSize,
  sessionRunKey,
  SESSION_CONFIG_CYCLE,
  SESSION_LOG_CAP,
} from './session_log';
import { onSessionLogChanged, resetSessionLogListeners } from './session_log_events';
import type { GenerationReport } from './session_log_types';

const settlement: GenerationReport = {
  toolPath: '/fantasy/settlement',
  summary: 'Ashvale',
  seed: 'abc',
  config: { size: 'small', nameGeneratorSet: 'human' },
};

/** A recorded run with its id and time pinned, so nothing here races the clock. */
function record(report: GenerationReport, id: string, now: number) {
  return recordGeneration(report, { id, now });
}

beforeEach(() => {
  clearSessionLog();
  resetSessionLogListeners();
});

afterEach(() => {
  clearSessionLog();
  resetSessionLogListeners();
  vi.restoreAllMocks();
});

describe('recordGeneration', () => {
  it('turns a report into an entry, taking the supplied id and time', () => {
    const entry = record(settlement, 'run-1', 1000);

    expect(entry).toEqual({
      id: 'run-1',
      toolPath: '/fantasy/settlement',
      summary: 'Ashvale',
      seed: 'abc',
      config: { nameGeneratorSet: 'human', size: 'small' },
      at: 1000,
    });
  });

  it('gives a tool with no settings an empty config rather than none', () => {
    const entry = record({ toolPath: '/heraldry', seed: 'xyz' }, 'run-1', 1000);

    expect(entry.config).toEqual({});
  });

  it('leaves the summary off an entry whose tool had no name to give', () => {
    const entry = record({ toolPath: '/heraldry', seed: 'xyz' }, 'run-1', 1000);

    expect('summary' in entry).toBe(false);
  });

  it('lists runs newest first', () => {
    record(settlement, 'run-1', 1000);
    record({ ...settlement, seed: 'def' }, 'run-2', 2000);
    record({ ...settlement, seed: 'ghi' }, 'run-3', 3000);

    expect(listSessionLog().map((entry) => entry.id)).toEqual(['run-3', 'run-2', 'run-1']);
  });

  it('mints an id when it is not given one', () => {
    const entry = recordGeneration(settlement);

    expect(entry.id).not.toBe('');
    expect(listSessionLog()[0].id).toBe(entry.id);
  });

  it('times a run by the clock when it is not given one', () => {
    vi.spyOn(Date, 'now').mockReturnValue(4242);

    expect(recordGeneration(settlement).at).toBe(4242);
  });

  it('announces the change', () => {
    const listener = vi.fn();
    onSessionLogChanged(listener);

    record(settlement, 'run-1', 1000);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('records a copy of the config, so a tool mutating its own cannot rewrite history', () => {
    const config: Record<string, unknown> = { size: 'small', tinctures: ['Or'] };
    const entry = record({ ...settlement, config }, 'run-1', 1000);

    config.size = 'large';
    (config.tinctures as string[]).push('azure');

    expect(entry.config).toEqual({ size: 'small', tinctures: ['Or'] });
    expect(listSessionLog()[0].config).toEqual({ size: 'small', tinctures: ['Or'] });
  });
});

describe('an identical run', () => {
  it('moves its entry to the top rather than adding a second', () => {
    record(settlement, 'run-1', 1000);
    record({ ...settlement, seed: 'def' }, 'run-2', 2000);

    const again = record(settlement, 'ignored', 3000);

    expect(listSessionLog().map((entry) => entry.id)).toEqual(['run-1', 'run-2']);
    expect(again.id).toBe('run-1');
    expect(again.at).toBe(3000);
  });

  it('is identical whatever order the config keys arrive in', () => {
    record(settlement, 'run-1', 1000);

    record(
      { ...settlement, config: { nameGeneratorSet: 'human', size: 'small' } },
      'ignored',
      2000,
    );

    expect(sessionLogSize()).toBe(1);
  });

  it('is identical whatever order the keys of a nested object arrive in', () => {
    record({ ...settlement, config: { field: { first: 'Or', second: 'azure' } } }, 'run-1', 1000);

    record({ ...settlement, config: { field: { second: 'azure', first: 'Or' } } }, 'ignored', 2000);

    expect(sessionLogSize()).toBe(1);
  });

  it('is not identical when an array is in a different order, because a roll is not', () => {
    record({ ...settlement, config: { categories: ['a', 'b'] } }, 'run-1', 1000);
    record({ ...settlement, config: { categories: ['b', 'a'] } }, 'run-2', 2000);

    expect(sessionLogSize()).toBe(2);
  });

  it('is not identical when the seed differs', () => {
    record(settlement, 'run-1', 1000);
    record({ ...settlement, seed: 'def' }, 'run-2', 2000);

    expect(sessionLogSize()).toBe(2);
  });

  it('is not identical when the tool differs', () => {
    record(settlement, 'run-1', 1000);
    record({ ...settlement, toolPath: '/culture' }, 'run-2', 2000);

    expect(sessionLogSize()).toBe(2);
  });

  it('is not identical when a setting differs', () => {
    record(settlement, 'run-1', 1000);
    record({ ...settlement, config: { ...settlement.config, size: 'large' } }, 'run-2', 2000);

    expect(sessionLogSize()).toBe(2);
  });
});

describe('the cap', () => {
  it('keeps the newest and drops the oldest past it', () => {
    for (let index = 0; index < SESSION_LOG_CAP + 5; index += 1) {
      record({ ...settlement, seed: `seed-${index}` }, `run-${index}`, 1000 + index);
    }

    const log = listSessionLog();
    expect(log).toHaveLength(SESSION_LOG_CAP);
    expect(log[0].id).toBe(`run-${SESSION_LOG_CAP + 4}`);
    expect(log[log.length - 1].id).toBe('run-5');
  });

  it('does not push an entry off the end when an existing run is merely moved', () => {
    for (let index = 0; index < SESSION_LOG_CAP; index += 1) {
      record({ ...settlement, seed: `seed-${index}` }, `run-${index}`, 1000 + index);
    }

    record({ ...settlement, seed: 'seed-0' }, 'ignored', 9000);

    const log = listSessionLog();
    expect(log).toHaveLength(SESSION_LOG_CAP);
    expect(log[0].id).toBe('run-0');
    expect(log.map((entry) => entry.id)).toContain('run-1');
  });
});

describe('listSessionLog', () => {
  it('hands back a copy, so a caller cannot reorder the log by holding it', () => {
    record(settlement, 'run-1', 1000);
    record({ ...settlement, seed: 'def' }, 'run-2', 2000);

    listSessionLog().reverse();

    expect(listSessionLog().map((entry) => entry.id)).toEqual(['run-2', 'run-1']);
  });
});

describe('clearSessionLog', () => {
  it('forgets every run and says so', () => {
    const listener = vi.fn();
    record(settlement, 'run-1', 1000);
    onSessionLogChanged(listener);

    clearSessionLog();

    expect(listSessionLog()).toEqual([]);
    expect(sessionLogSize()).toBe(0);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('sessionRunKey', () => {
  it('is the same for the same run', () => {
    expect(sessionRunKey('/culture', 'abc', { a: 1, b: 2 })).toBe(
      sessionRunKey('/culture', 'abc', { b: 2, a: 1 }),
    );
  });

  it('separates a missing config from an empty one only by not doing so', () => {
    expect(sessionRunKey('/culture', 'abc', undefined)).toBe(sessionRunKey('/culture', 'abc', {}));
  });

  it('is different for a different tool, seed, or setting', () => {
    const base = sessionRunKey('/culture', 'abc', { a: 1 });

    expect(sessionRunKey('/heraldry', 'abc', { a: 1 })).not.toBe(base);
    expect(sessionRunKey('/culture', 'def', { a: 1 })).not.toBe(base);
    expect(sessionRunKey('/culture', 'abc', { a: 2 })).not.toBe(base);
  });

  it('never matches anything when the config cannot be written down', () => {
    const unwritable = { size: 1n as unknown as number };

    const first = sessionRunKey('/culture', 'abc', unwritable);
    const second = sessionRunKey('/culture', 'abc', unwritable);

    expect(first).not.toBe(second);
  });

  it('records a run whose config cannot be written down rather than losing the roll', () => {
    const entry = recordGeneration({
      toolPath: '/culture',
      seed: 'abc',
      config: { size: 1n as unknown as number },
    });

    expect(listSessionLog()[0].id).toBe(entry.id);
  });
});

describe('canonicalSessionConfig', () => {
  it('sorts object keys at every depth and leaves arrays alone', () => {
    const canonical = canonicalSessionConfig({
      b: 1,
      a: { d: 2, c: [{ f: 3, e: 4 }] },
    });

    expect(JSON.stringify(canonical)).toBe('{"a":{"c":[{"e":4,"f":3}],"d":2},"b":1}');
  });

  it('turns an absent config into an empty one', () => {
    expect(canonicalSessionConfig(undefined)).toEqual({});
  });

  it('keeps null apart from an object', () => {
    expect(canonicalSessionConfig({ religion: null })).toEqual({ religion: null });
  });

  it('cuts a cycle rather than recursing into it', () => {
    const cyclic: Record<string, unknown> = { size: 'small' };
    cyclic.self = cyclic;

    expect(canonicalSessionConfig(cyclic)).toEqual({
      self: SESSION_CONFIG_CYCLE,
      size: 'small',
    });
  });

  it('writes a value that merely appears twice out both times', () => {
    const shared = { tincture: 'Or' };

    expect(canonicalSessionConfig({ first: shared, second: shared })).toEqual({
      first: { tincture: 'Or' },
      second: { tincture: 'Or' },
    });
  });
});

describe('newSessionLogEntryId', () => {
  it('mints something unique', () => {
    expect(newSessionLogEntryId()).not.toBe(newSessionLogEntryId());
  });

  it('falls back to a home-made id where the browser has no UUID to give', () => {
    vi.spyOn(globalThis, 'crypto', 'get').mockReturnValue(
      undefined as unknown as typeof globalThis.crypto,
    );

    expect(newSessionLogEntryId()).toMatch(/^run-/);
  });
});
