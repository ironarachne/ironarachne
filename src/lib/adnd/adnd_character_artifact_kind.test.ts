import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  ADND_CHARACTER_ARTIFACT_KIND,
  ADND_CHARACTER_PAYLOAD_VERSION,
  adndCharacterArtifactKind,
  migrateAdndCharacterSnapshot,
  validateAdndCharacterSnapshot,
} from './adnd_character_artifact_kind.js';
import { ADND_CHARACTER_RULESET_REF, toAdndCharacterSnapshot } from './adnd_character_snapshot.js';
import type { AdndCharacterSnapshot } from './adnd_character_snapshot.js';
import { generateCharacter } from './adndcharactergenerator.js';
import { getDefaultConfig } from './adndcharactergeneratorconfig.js';

function aSnapshot(): AdndCharacterSnapshot {
  for (let seed = 0; seed < 400; seed += 1) {
    try {
      return toAdndCharacterSnapshot(generateCharacter(getDefaultConfig(new RNG(`kind-${seed}`))));
    } catch {
      continue;
    }
  }
  throw new Error('no seed produced a character');
}

describe('the AD&D character kind', () => {
  it('is system-qualified, concept first', () => {
    // Not `adnd-2e.character`: concept first is what sorts every character kind together in a
    // vault listing, and it is the convention `artifact_kind_types.ts` documents.
    expect(ADND_CHARACTER_ARTIFACT_KIND).toBe('character.adnd-2e');
  });

  it('pins system identity at payload version 2', () => {
    expect(ADND_CHARACTER_PAYLOAD_VERSION).toBe(2);
    expect(adndCharacterArtifactKind.payloadVersion).toBe(2);
  });

  it('names an artifact after the character', () => {
    const snapshot = aSnapshot();
    snapshot.firstName = 'Aldric';
    snapshot.lastName = 'Vane';

    expect(adndCharacterArtifactKind.nameOf(snapshot)).toBe('Aldric Vane');
  });

  it('falls back to race and class when the character was never named', () => {
    const snapshot = aSnapshot();
    snapshot.firstName = '';
    snapshot.lastName = '';
    snapshot.raceName = 'elf';
    snapshot.className = 'thief';

    expect(adndCharacterArtifactKind.nameOf(snapshot)).toBe('elf thief');
  });

  it('round-trips through the codec the registry loads', async () => {
    const snapshot = aSnapshot();
    const codec = await adndCharacterArtifactKind.loadCodec();

    const restored = codec.fromSnapshot(snapshot, new RNG('unused'));

    expect(codec.toSnapshot(restored)).toEqual(snapshot);
  });
});

describe('validateAdndCharacterSnapshot', () => {
  it('accepts what the generator produces', () => {
    expect(validateAdndCharacterSnapshot(aSnapshot()).ok).toBe(true);
  });

  it('accepts a character with no thief skills, kit, or proficiencies', () => {
    // Eighteen classes of twenty have no thief skills and most characters have no kit. A
    // validator that demanded either would reject every fighter ever rolled.
    const snapshot = aSnapshot();
    snapshot.thiefSkills = [];
    snapshot.kit = null;
    snapshot.weaponProficiencyGroups = [];
    snapshot.nonweaponProficiencies = [];

    expect(validateAdndCharacterSnapshot(snapshot).ok).toBe(true);
  });

  it('accepts a race or class this build does not have', () => {
    // Deliberately not a validity question: a class that was removed is not a corrupt record,
    // and rejecting here would retire the character over a lookup nothing brings back.
    const snapshot = aSnapshot();
    snapshot.raceName = 'gnoll';
    snapshot.className = 'bladesinger';

    expect(validateAdndCharacterSnapshot(snapshot).ok).toBe(true);
  });

  it('rejects something that is not an object', () => {
    for (const payload of [null, 'a character', 42, ['a', 'character']]) {
      const result = validateAdndCharacterSnapshot(payload);

      expect(result.ok).toBe(false);
      expect(result.ok === false && result.reason).toBe('invalid-payload');
    }
  });

  it('rejects a payload missing the names it is read by', () => {
    const snapshot = aSnapshot() as unknown as Record<string, unknown>;
    delete snapshot.raceName;

    const result = validateAdndCharacterSnapshot(snapshot);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('raceName');
  });

  it('rejects a payload whose attributes are not numbers', () => {
    const snapshot = { ...aSnapshot(), strength: 'very' };

    const result = validateAdndCharacterSnapshot(snapshot);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('strength');
  });

  it('rejects thief skills that lost the split between base and allocation', () => {
    const snapshot = { ...aSnapshot(), thiefSkills: [{ name: 'Pick Pockets', value: 45 }] };

    const result = validateAdndCharacterSnapshot(snapshot);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('thiefSkills');
  });

  it('rejects a kit that is neither null nor a named list of features', () => {
    const result = validateAdndCharacterSnapshot({ ...aSnapshot(), kit: { name: 'Berserker' } });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('kit');
  });

  it('rejects equipment that is not a list of named entries', () => {
    const result = validateAdndCharacterSnapshot({ ...aSnapshot(), weapons: ['long sword'] });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('weapons');
  });

  it('returns a rejection rather than throwing on anything unrecognisable', () => {
    // Requirement 3.3: a well-defined result, never an exception, whatever came out of storage.
    for (const payload of [undefined, Symbol('x'), () => 1, new Map(), { firstName: 1 }]) {
      expect(() => validateAdndCharacterSnapshot(payload)).not.toThrow();
      expect(validateAdndCharacterSnapshot(payload).ok).toBe(false);
    }
  });
});

describe('migrateAdndCharacterSnapshot', () => {
  it('pins the legacy ruleset ref without inventing source provenance', () => {
    const { ruleset: _ruleset, ...legacy } = aSnapshot();
    const result = migrateAdndCharacterSnapshot(legacy, 1);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ ...legacy, ruleset: ADND_CHARACTER_RULESET_REF });
      expect(result.value).not.toHaveProperty('sourceIds');
    }
  });

  it('rejects an unsupported version', () => {
    const result = migrateAdndCharacterSnapshot({}, 0);

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe('unsupported-version');
  });

  it('says which version it could not read', () => {
    const result = migrateAdndCharacterSnapshot({}, 7);

    expect(result.ok === false && result.message).toContain('version 7');
  });
});
