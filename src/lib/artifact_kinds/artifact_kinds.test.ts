import { describe, expect, it } from 'vitest';

import {
  acceptedPayload,
  defineArtifactKind,
  readArtifactPayload,
  rejectedPayload,
} from './artifact_kinds';
import type { AnyArtifactKindEntry, ArtifactKindEntry, PayloadResult } from './artifact_kind_types';
import {
  asRecord,
  errorMessage,
  hasStringFields,
  isStringArray,
  isStringArrayArray,
} from './payload_guards';

type Note = { title: string };

function noteKind(overrides: Partial<ArtifactKindEntry<Note, Note>> = {}) {
  return defineArtifactKind<Note, Note>({
    kind: 'test.note',
    displayName: 'Note',
    payloadVersion: 2,
    loadCodec: async () => ({
      toSnapshot: (value: Note) => ({ ...value }),
      fromSnapshot: (snapshot: Note) => ({ ...snapshot }),
    }),
    nameOf: (snapshot) => snapshot.title,
    validate: (payload) => {
      const record = asRecord(payload);
      if (record === null || typeof record.title !== 'string') {
        return rejectedPayload('invalid-payload', 'note has no title');
      }
      return acceptedPayload({ title: record.title });
    },
    migrate: (payload, from) => {
      if (from !== 1) {
        return rejectedPayload('unsupported-version', `no migration from ${from}`);
      }
      const record = asRecord(payload);
      return acceptedPayload({ title: String(record?.name ?? '') });
    },
    ...overrides,
  });
}

/** The registry hands entries back erased; this is the same conversion `registerArtifactKind` does. */
function erased(entry: ArtifactKindEntry<Note, Note>): AnyArtifactKindEntry {
  return entry as unknown as AnyArtifactKindEntry;
}

describe('defineArtifactKind', () => {
  it('returns the entry it was given', () => {
    const entry = noteKind();
    expect(entry.kind).toBe('test.note');
    expect(entry.payloadVersion).toBe(2);
  });

  it('refuses an empty kind id', () => {
    expect(() => noteKind({ kind: '  ' })).toThrow(/non-empty id/);
  });

  it('refuses an empty display name', () => {
    expect(() => noteKind({ displayName: '' })).toThrow(/display name/);
  });

  it('refuses a payload version that is not a whole number of at least 1', () => {
    expect(() => noteKind({ payloadVersion: 0 })).toThrow(/payloadVersion/);
    expect(() => noteKind({ payloadVersion: 1.5 })).toThrow(/payloadVersion/);
  });
});

describe('readArtifactPayload', () => {
  const entry = erased(noteKind());

  it('validates a payload already at the current version', () => {
    expect(readArtifactPayload(entry, { title: 'Ashfall' }, 2)).toEqual({
      ok: true,
      value: { title: 'Ashfall' },
    });
  });

  it('reports why a current-version payload is unusable', () => {
    const result = readArtifactPayload(entry, { name: 'Ashfall' }, 2);
    expect(result).toEqual({ ok: false, reason: 'invalid-payload', message: 'note has no title' });
  });

  it('migrates an older payload and validates the result', () => {
    expect(readArtifactPayload(entry, { name: 'Ashfall' }, 1)).toEqual({
      ok: true,
      value: { title: 'Ashfall' },
    });
  });

  it('quarantines a payload from a newer build rather than guessing at it', () => {
    const result = readArtifactPayload(entry, { title: 'Ashfall' }, 3);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
    expect(result.ok === false && result.message).toContain('understands up to 2');
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects %s as a payload version', (version) => {
    const result = readArtifactPayload(entry, { title: 'Ashfall' }, version);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  it('passes a failed migration through with its own reason', () => {
    const older = erased(noteKind({ payloadVersion: 3 }));
    const result = readArtifactPayload(older, { name: 'Ashfall' }, 2);
    expect(result).toEqual({
      ok: false,
      reason: 'unsupported-version',
      message: 'no migration from 2',
    });
  });

  it('reports a migration that produces something invalid as a failed migration', () => {
    const broken = erased(
      noteKind({
        migrate: () => acceptedPayload({ title: 1 } as unknown as Note),
      }),
    );
    const result = readArtifactPayload(broken, { name: 'Ashfall' }, 1);
    expect(result.ok === false && result.reason).toBe('migration-failed');
    expect(result.ok === false && result.message).toContain('note has no title');
  });

  it('never calls migrate for a payload that is already current', () => {
    let migrateCalls = 0;
    const counted = erased(
      noteKind({
        migrate: (): PayloadResult<Note> => {
          migrateCalls += 1;
          return rejectedPayload('migration-failed', 'should not run');
        },
      }),
    );
    expect(readArtifactPayload(counted, { title: 'Ashfall' }, 2).ok).toBe(true);
    expect(migrateCalls).toBe(0);
  });
});

describe('payload guards', () => {
  it('treats only plain objects as records', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord([1, 2])).toBeNull();
    expect(asRecord(null)).toBeNull();
    expect(asRecord('culture')).toBeNull();
  });

  it('checks string arrays', () => {
    expect(isStringArray([])).toBe(true);
    expect(isStringArray(['a', 'b'])).toBe(true);
    expect(isStringArray(['a', 1])).toBe(false);
    expect(isStringArray('a')).toBe(false);
  });

  it('checks arrays of string arrays', () => {
    expect(isStringArrayArray([['a'], []])).toBe(true);
    expect(isStringArrayArray([['a'], 'b'])).toBe(false);
    expect(isStringArrayArray('a')).toBe(false);
  });

  it('requires every named field to be a string', () => {
    expect(hasStringFields({ a: 'x', b: 'y' }, ['a', 'b'])).toBe(true);
    expect(hasStringFields({ a: 'x' }, ['a', 'b'])).toBe(false);
    expect(hasStringFields({ a: 'x', b: 2 }, ['a', 'b'])).toBe(false);
  });

  it('reads a message off anything thrown', () => {
    expect(errorMessage(new Error('no such charge'))).toBe('no such charge');
    expect(errorMessage('no such charge')).toBe('no such charge');
  });
});
