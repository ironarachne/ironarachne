import { describe, expect, it } from 'vitest';

import {
  characterArtifactKind,
  CHARACTER_ARTIFACT_KIND,
  CHARACTER_PAYLOAD_VERSION,
  migrateCharacterSnapshot,
  validateCharacterSnapshot,
} from './character_artifact_kind.js';
import { rollCharacter } from './character_roll.js';
import { toCharacterSnapshot, type CharacterSnapshot } from './character_snapshot.js';

function snapshot(config: Parameters<typeof rollCharacter>[1] = {}): CharacterSnapshot {
  return toCharacterSnapshot(rollCharacter('kind-fixture', config).character);
}

describe('the character artifact kind', () => {
  it('is registered unqualified, and does not collide with a system-qualified character', () => {
    expect(CHARACTER_ARTIFACT_KIND).toBe('character');
    expect(characterArtifactKind.kind).toBe('character');
    expect(characterArtifactKind.payloadVersion).toBe(CHARACTER_PAYLOAD_VERSION);
    expect(characterArtifactKind.icon).not.toBe('');
  });

  it('names an artifact after the character', () => {
    const rolled = snapshot();

    expect(characterArtifactKind.nameOf(rolled)).toBe(rolled.name);
  });

  it('falls back to what a nameless character is', () => {
    const base = snapshot();

    expect(
      characterArtifactKind.nameOf({
        ...base,
        name: '   ',
        speciesName: 'elf',
        archetype: { ...(base.archetype ?? { tags: [] }), name: 'noble' } as typeof base.archetype,
      }),
    ).toBe('elf noble');
  });

  it('round-trips through the codec the registry loads', async () => {
    const codec = await characterArtifactKind.loadCodec();
    const { character } = rollCharacter('codec-fixture');
    const stored = codec.toSnapshot(character) as CharacterSnapshot;

    expect(validateCharacterSnapshot(stored).ok).toBe(true);
    expect((codec.fromSnapshot(stored, undefined as never) as typeof character).name).toBe(
      character.name,
    );
  });
});

describe('validating a character payload', () => {
  it('accepts what the generator writes', () => {
    expect(validateCharacterSnapshot(snapshot()).ok).toBe(true);
    expect(validateCharacterSnapshot(snapshot({ archetypeName: 'noble' })).ok).toBe(true);
  });

  it('accepts a character whose arms are a referenced artifact', () => {
    const rolled = toCharacterSnapshot(
      rollCharacter('referenced', { archetypeName: 'noble' }).character,
      true,
    );

    expect(rolled.heraldry).toBeNull();
    expect(validateCharacterSnapshot(rolled).ok).toBe(true);
  });

  it('rejects something that is not an object', () => {
    const result = validateCharacterSnapshot('a character, honestly');

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('invalid-payload');
  });

  it('rejects a payload with no species name to resolve', () => {
    const { speciesName: _dropped, ...rest } = snapshot();

    expect(validateCharacterSnapshot(rest).ok).toBe(false);
  });

  it('rejects a payload whose build is not numbers', () => {
    expect(validateCharacterSnapshot({ ...snapshot(), height: 'tallish' }).ok).toBe(false);
  });

  it('rejects a gender with no name, which the description prose reads', () => {
    expect(validateCharacterSnapshot({ ...snapshot(), gender: { pronouns: {} } }).ok).toBe(false);
  });

  it('rejects arms with no blazon to print', () => {
    expect(validateCharacterSnapshot({ ...snapshot(), heraldry: { device: {} } }).ok).toBe(false);
  });

  /**
   * A species this build no longer has is not a corrupt record. Quarantining over the lookup would
   * retire a saved character permanently; `character_rehydrate.ts` gives it a placeholder instead.
   */
  it('accepts a species name this build does not have', () => {
    expect(validateCharacterSnapshot({ ...snapshot(), speciesName: 'Thrennish' }).ok).toBe(true);
  });
});

describe('migrating a character payload', () => {
  it('rejects, because version 1 is the only shape there has been', () => {
    const result = migrateCharacterSnapshot(snapshot(), 0);

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.reason).toBe('unsupported-version');
  });
});
