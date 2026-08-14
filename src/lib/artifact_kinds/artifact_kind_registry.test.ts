import { describe, expect, it } from 'vitest';

import {
  artifactKindIds,
  createArtifactKindRegistry,
  getArtifactKind,
  hasArtifactKind,
  listArtifactKinds,
  readArtifactPayloadForKind,
  registerArtifactKind,
  requireArtifactKind,
} from './artifact_kind_registry';
import { acceptedPayload, defineArtifactKind, rejectedPayload } from './artifact_kinds';
import type { ArtifactKindRegistry } from './artifact_kind_types';
import { asRecord } from './payload_guards';

type Note = { title: string };

function noteKind(kind: string, payloadVersion = 1) {
  return defineArtifactKind<Note, Note>({
    kind,
    displayName: `Note (${kind})`,
    payloadVersion,
    loadCodec: async () => ({
      toSnapshot: (value: Note) => ({ ...value }),
      fromSnapshot: (snapshot: Note) => ({ ...snapshot }),
    }),
    nameOf: (snapshot) => snapshot.title,
    validate: (payload) => {
      const record = asRecord(payload);
      if (record === null || typeof record.title !== 'string') {
        return rejectedPayload('invalid-payload', `${kind} has no title`);
      }
      return acceptedPayload({ title: record.title });
    },
    migrate: (_payload, from) =>
      rejectedPayload('unsupported-version', `no migration from ${from}`),
  });
}

function registryWith(...kinds: string[]): ArtifactKindRegistry {
  const registry = createArtifactKindRegistry();
  for (const kind of kinds) {
    registerArtifactKind(registry, noteKind(kind));
  }
  return registry;
}

describe('artifact kind registry', () => {
  it('starts empty', () => {
    const registry = createArtifactKindRegistry();
    expect(listArtifactKinds(registry)).toEqual([]);
    expect(artifactKindIds(registry)).toEqual([]);
  });

  it('looks a registered kind up', () => {
    const registry = registryWith('note');
    expect(getArtifactKind(registry, 'note')?.displayName).toBe('Note (note)');
    expect(hasArtifactKind(registry, 'note')).toBe(true);
  });

  it('reports an unknown kind as a miss rather than throwing', () => {
    const registry = registryWith('note');
    expect(getArtifactKind(registry, 'sonnet')).toBeUndefined();
    expect(hasArtifactKind(registry, 'sonnet')).toBe(false);
  });

  it('lists kinds in registration order', () => {
    const registry = registryWith('note', 'sonnet', 'ballad');
    expect(artifactKindIds(registry)).toEqual(['note', 'sonnet', 'ballad']);
    expect(listArtifactKinds(registry).map((entry) => entry.kind)).toEqual([
      'note',
      'sonnet',
      'ballad',
    ]);
  });

  it('refuses a duplicate registration instead of letting one kind shadow another', () => {
    const registry = registryWith('note');
    expect(() => registerArtifactKind(registry, noteKind('note'))).toThrow(
      'artifact kind "note" is already registered',
    );
    expect(listArtifactKinds(registry)).toHaveLength(1);
  });

  it('keeps the first registration when a duplicate is refused', () => {
    const registry = registryWith('note');
    try {
      registerArtifactKind(registry, noteKind('note', 7));
    } catch {
      // The throw is the assertion above; what matters here is what survived it.
    }
    expect(getArtifactKind(registry, 'note')?.payloadVersion).toBe(1);
  });

  it('throws for a required kind that is not registered', () => {
    const registry = registryWith('note');
    expect(requireArtifactKind(registry, 'note').kind).toBe('note');
    expect(() => requireArtifactKind(registry, 'sonnet')).toThrow(
      'no artifact kind registered as "sonnet"',
    );
  });
});

describe('readArtifactPayloadForKind', () => {
  it('reads a payload for a registered kind', () => {
    const registry = registryWith('note');
    expect(readArtifactPayloadForKind(registry, 'note', { title: 'Ashfall' }, 1)).toEqual({
      ok: true,
      value: { title: 'Ashfall' },
    });
  });

  it('quarantines a payload whose kind this build does not have', () => {
    const registry = registryWith('note');
    const result = readArtifactPayloadForKind(registry, 'sonnet', { title: 'Ashfall' }, 1);
    expect(result).toEqual({
      ok: false,
      reason: 'unknown-kind',
      message: 'no artifact kind registered as "sonnet"',
    });
  });

  it('reports an invalid payload for a kind it does have', () => {
    const registry = registryWith('note');
    const result = readArtifactPayloadForKind(registry, 'note', { untitled: true }, 1);
    expect(result.ok === false && result.reason).toBe('invalid-payload');
  });
});
