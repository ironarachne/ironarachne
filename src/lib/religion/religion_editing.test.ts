import { describe, expect, it } from 'vitest';

import { getFantasyNameGeneratorSet } from '$lib/names';
import { CommonSpecies } from '$lib/species';
import { RNG } from '@ironarachne/rng';

import { all as allCategories, byName as categoryByName } from './categories';
import {
  removeDeity,
  renameReligion,
  setDeityField,
  setDeityRelationshipDescription,
  setDivineRealmField,
  setNonTheisticField,
  setPantheonDescription,
  setReligionCosmologySummary,
  setReligionDescription,
  setReligionDimensionSummary,
  setSpiritEchelonField,
  setSpiritEchelonRankDepth,
} from './religion_editing';
import { generateReligion } from './religion_generation';
import { toReligionSnapshot, type ReligionSnapshot } from './religion_snapshot';
import type { Religion } from './religion_types';

const options = {
  lockSeed: false,
  selectedCategories: ['polytheism'],
  selectedSpecies: ['human'],
  polytheisticStanding: 'hierarchical' as const,
  spiritCosmologyDepth: 'moderate' as const,
  useSavedCulture: false,
};

function religionOfCategory(categoryName: string, seed: string): Religion {
  const names = getFantasyNameGeneratorSet('human', new RNG(seed));
  return generateReligion(seed, {
    categories: [categoryByName(categoryName, allCategories())],
    deitySpeciesOptions: [CommonSpecies.byName('human', CommonSpecies.sentient())],
    nameGenerator: names.family,
    femaleNameGenerator: names.female,
    maleNameGenerator: names.male,
    polytheisticStanding: 'hierarchical',
    spiritCosmologyDepth: 'moderate',
  });
}

function snapshotOf(categoryName: string, seed: string): ReligionSnapshot {
  return toReligionSnapshot(religionOfCategory(categoryName, seed), seed, options);
}

/** A polytheistic religion, so there is a pantheon with several gods in it to edit. */
const pantheonSnapshot = snapshotOf('polytheism', 'editing-pantheon');
/** An animist one, which has no deities at all — the shape half of these functions must survive. */
const godlessSnapshot = snapshotOf('animism', 'editing-animism');

describe('renameReligion', () => {
  it('renames the religion and the envelope together', () => {
    const renamed = renameReligion(pantheonSnapshot, 'The Ashen Path');

    expect(renamed.name).toBe('The Ashen Path');
    expect(renamed.religion.name).toBe('The Ashen Path');
  });

  it('leaves the original alone', () => {
    const before = pantheonSnapshot.religion.name;
    renameReligion(pantheonSnapshot, 'The Ashen Path');

    expect(pantheonSnapshot.religion.name).toBe(before);
    expect(pantheonSnapshot.name).toBe(before);
  });

  it('keeps the seed and the options it was rolled with', () => {
    const renamed = renameReligion(pantheonSnapshot, 'The Ashen Path');

    expect(renamed.seed).toBe(pantheonSnapshot.seed);
    expect(renamed.generatorOptions).toEqual(pantheonSnapshot.generatorOptions);
  });
});

describe('setReligionDescription', () => {
  it('replaces the description and nothing else', () => {
    const edited = setReligionDescription(pantheonSnapshot, 'They keep the long silence.');

    expect(edited.religion.description).toBe('They keep the long silence.');
    expect(edited.religion.pantheon).toEqual(pantheonSnapshot.religion.pantheon);
  });
});

describe('setReligionDimensionSummary', () => {
  it('rewrites the summary of one dimension, leaving the others alone', () => {
    const before = pantheonSnapshot.religion.dimensions?.ethical?.summary;
    const edited = setReligionDimensionSummary(pantheonSnapshot, 'ritual', 'They fast at dusk.');

    expect(edited.religion.dimensions?.ritual?.summary).toBe('They fast at dusk.');
    expect(edited.religion.dimensions?.ethical?.summary).toBe(before);
  });

  /** The mythological block keeps its prose under a different key; both ends must agree on which. */
  it('writes the mythological dimension to the field that actually holds its prose', () => {
    const edited = setReligionDimensionSummary(
      pantheonSnapshot,
      'mythological',
      'The world is the corpse of the first god.',
    );

    expect(edited.religion.dimensions?.mythological?.centralMythSummary).toBe(
      'The world is the corpse of the first god.',
    );
  });

  it('changes nothing when the religion has no such dimension', () => {
    const withoutDimensions: ReligionSnapshot = {
      ...pantheonSnapshot,
      religion: { ...pantheonSnapshot.religion, dimensions: undefined },
    };

    expect(setReligionDimensionSummary(withoutDimensions, 'ritual', 'x')).toBe(withoutDimensions);
  });
});

describe('the spirit cosmology', () => {
  it('rewrites the cosmology summary', () => {
    const edited = setReligionCosmologySummary(pantheonSnapshot, 'Nine courts of messengers.');

    expect(edited.religion.cosmology?.summary).toBe('Nine courts of messengers.');
  });

  it('rewrites one echelon without disturbing its neighbours', () => {
    const echelons = pantheonSnapshot.religion.cosmology?.echelons ?? [];
    if (echelons.length < 2) {
      // The seed above yields several orders; this guards the assertion rather than the code.
      expect(echelons.length).toBeGreaterThan(0);
      return;
    }
    const edited = setSpiritEchelonField(pantheonSnapshot, 0, 'label', 'the wind-callers');

    expect(edited.religion.cosmology?.echelons[0]?.label).toBe('the wind-callers');
    expect(edited.religion.cosmology?.echelons[1]).toEqual(echelons[1]);
  });

  it('sets a rank depth the generator could itself have drawn', () => {
    const edited = setSpiritEchelonRankDepth(pantheonSnapshot, 0, 3);

    expect(edited.religion.cosmology?.echelons[0]?.rankDepth).toBe(3);
  });

  it.each([0, -1, 4, 2.5, Number.NaN])('refuses a rank depth of %s', (depth) => {
    expect(setSpiritEchelonRankDepth(pantheonSnapshot, 0, depth)).toBe(pantheonSnapshot);
  });

  it('changes nothing for an index that holds no echelon, or a religion with no cosmology', () => {
    expect(setSpiritEchelonField(pantheonSnapshot, 99, 'summary', 'x')).toBe(pantheonSnapshot);
    expect(setSpiritEchelonField(pantheonSnapshot, -1, 'summary', 'x')).toBe(pantheonSnapshot);
    expect(setReligionCosmologySummary(godlessSnapshot, 'x')).toBe(godlessSnapshot);
    expect(setSpiritEchelonField(godlessSnapshot, 0, 'summary', 'x')).toBe(godlessSnapshot);
    expect(setSpiritEchelonRankDepth(godlessSnapshot, 0, 2)).toBe(godlessSnapshot);
    expect(setSpiritEchelonRankDepth(pantheonSnapshot, 99, 2)).toBe(pantheonSnapshot);
  });
});

describe('setDeityRelationshipDescription', () => {
  /** The pantheon that has one, since a relationship between gods is not guaranteed. */
  const related = pantheonSnapshot.religion.pantheon!.members.findIndex(
    (member) => member.relationships.length > 0,
  );

  it('has a pantheon with a relationship in it to edit', () => {
    expect(related).toBeGreaterThanOrEqual(0);
  });

  it('rewrites the copy on the god and the copy on the pantheon together', () => {
    const id = pantheonSnapshot.religion.pantheon!.members[related].relationships[0].id;
    const edited = setDeityRelationshipDescription(
      pantheonSnapshot,
      related,
      0,
      'They have not spoken since the flood.',
    );
    const pantheon = edited.religion.pantheon!;

    expect(pantheon.members[related].relationships[0].description).toBe(
      'They have not spoken since the flood.',
    );
    expect(pantheon.relationships.find((entry) => entry.id === id)?.description).toBe(
      'They have not spoken since the flood.',
    );
  });

  it('leaves every other relationship alone', () => {
    const before = pantheonSnapshot.religion.pantheon!.relationships;
    const edited = setDeityRelationshipDescription(pantheonSnapshot, related, 0, 'Changed.');
    const id = before.find(
      (entry) =>
        entry.id !== pantheonSnapshot.religion.pantheon!.members[related].relationships[0].id,
    )?.id;

    if (id === undefined) {
      // One relationship in the whole pantheon; there is nothing else that could have moved.
      expect(before).toHaveLength(1);
      return;
    }
    expect(edited.religion.pantheon!.relationships.find((entry) => entry.id === id)).toEqual(
      before.find((entry) => entry.id === id),
    );
  });

  it('changes nothing for a god or a relationship that is not there', () => {
    expect(setDeityRelationshipDescription(pantheonSnapshot, 99, 0, 'x')).toBe(pantheonSnapshot);
    expect(setDeityRelationshipDescription(pantheonSnapshot, related, 99, 'x')).toBe(
      pantheonSnapshot,
    );
    expect(setDeityRelationshipDescription(godlessSnapshot, 0, 0, 'x')).toBe(godlessSnapshot);
  });
});

describe('setDivineRealmField', () => {
  it('rewrites one realm and leaves the rest as they were', () => {
    const realms = pantheonSnapshot.religion.realms;
    const edited = setDivineRealmField(pantheonSnapshot, 0, 'name', 'The Long Dark');

    expect(edited.religion.realms[0].name).toBe('The Long Dark');
    expect(edited.religion.realms.slice(1)).toEqual(realms.slice(1));
  });

  it('changes nothing for an index no realm lives at', () => {
    expect(setDivineRealmField(pantheonSnapshot, 99, 'name', 'x')).toBe(pantheonSnapshot);
  });
});

describe('editing the pantheon', () => {
  it('renames one deity without disturbing the rest of the pantheon', () => {
    const members = pantheonSnapshot.religion.pantheon?.members ?? [];
    expect(members.length).toBeGreaterThan(1);

    const edited = setDeityField(pantheonSnapshot, 0, 'name', 'Vethra');

    expect(edited.religion.pantheon?.members[0].name).toBe('Vethra');
    expect(edited.religion.pantheon?.members.slice(1)).toEqual(members.slice(1));
    // The whole point of 4.4: the rest of the payload does not move.
    expect(edited.seed).toBe(pantheonSnapshot.seed);
    expect(edited.religion.realms).toEqual(pantheonSnapshot.religion.realms);
    expect(edited.religion.description).toBe(pantheonSnapshot.religion.description);
  });

  it('stores a cleared holy item as null rather than an empty string', () => {
    const edited = setDeityField(pantheonSnapshot, 0, 'holyItem', '   ');

    expect(edited.religion.pantheon?.members[0].holyItem).toBeNull();
  });

  it('keeps a holy symbol the user actually wrote', () => {
    const edited = setDeityField(pantheonSnapshot, 0, 'holySymbol', 'a broken wheel');

    expect(edited.religion.pantheon?.members[0].holySymbol).toBe('a broken wheel');
  });

  it('rewrites the pantheon description', () => {
    const edited = setPantheonDescription(pantheonSnapshot, 'Seven who quarrel.');

    expect(edited.religion.pantheon?.description).toBe('Seven who quarrel.');
  });

  it('changes nothing when there is no pantheon or no such deity', () => {
    expect(setDeityField(godlessSnapshot, 0, 'name', 'x')).toBe(godlessSnapshot);
    expect(setPantheonDescription(godlessSnapshot, 'x')).toBe(godlessSnapshot);
    expect(setDeityField(pantheonSnapshot, 99, 'name', 'x')).toBe(pantheonSnapshot);
    expect(setDeityField(pantheonSnapshot, 1.5, 'name', 'x')).toBe(pantheonSnapshot);
  });
});

describe('removeDeity', () => {
  it('takes the deity out and leaves the others in order', () => {
    const members = pantheonSnapshot.religion.pantheon?.members ?? [];
    const edited = removeDeity(pantheonSnapshot, 0);
    const remaining = edited.religion.pantheon?.members ?? [];

    expect(remaining).toHaveLength(members.length - 1);
    expect(remaining.map((member) => member.name)).toEqual(
      members.slice(1).map((member) => member.name),
    );
  });

  it('drops every relationship that named the deity, on the pantheon and on its members', () => {
    const removedId = pantheonSnapshot.religion.pantheon?.members[0].id;
    const edited = removeDeity(pantheonSnapshot, 0);
    const pantheon = edited.religion.pantheon;

    const named = (relationship: { originatorId: string; recipientId: string }) =>
      relationship.originatorId === removedId || relationship.recipientId === removedId;

    expect(pantheon?.relationships.some(named)).toBe(false);
    expect(pantheon?.members.some((member) => member.relationships.some(named))).toBe(false);
  });

  /** The leader is a position in the list, so removing anyone before it moves it. */
  it('follows the leader to its new position', () => {
    const withLeaderLast: ReligionSnapshot = {
      ...pantheonSnapshot,
      religion: {
        ...pantheonSnapshot.religion,
        pantheon: { ...pantheonSnapshot.religion.pantheon!, leader: 2 },
      },
    };

    expect(removeDeity(withLeaderLast, 0).religion.pantheon?.leader).toBe(1);
    expect(removeDeity(withLeaderLast, 2).religion.pantheon?.leader).toBe(-1);
  });

  it('leaves a pantheon emptied of its last deity with no leader', () => {
    const soleDeity: ReligionSnapshot = {
      ...pantheonSnapshot,
      religion: {
        ...pantheonSnapshot.religion,
        pantheon: {
          ...pantheonSnapshot.religion.pantheon!,
          members: pantheonSnapshot.religion.pantheon!.members.slice(0, 1),
          leader: 0,
        },
      },
    };
    const edited = removeDeity(soleDeity, 0);

    expect(edited.religion.pantheon?.members).toEqual([]);
    expect(edited.religion.pantheon?.leader).toBe(-1);
  });

  it('changes nothing when there is no pantheon or no such deity', () => {
    expect(removeDeity(godlessSnapshot, 0)).toBe(godlessSnapshot);
    expect(removeDeity(pantheonSnapshot, 99)).toBe(pantheonSnapshot);
  });
});

describe('setNonTheisticField', () => {
  it('rewrites the tradition prose of a religion that has no gods', () => {
    const edited = setNonTheisticField(
      godlessSnapshot,
      'mediationSummary',
      'The hearth-keeper speaks for the dead.',
    );

    expect(edited.religion.nonTheisticDetail?.mediationSummary).toBe(
      'The hearth-keeper speaks for the dead.',
    );
    expect(edited.religion.nonTheisticDetail?.pollutionOrPurityNotes).toBe(
      godlessSnapshot.religion.nonTheisticDetail?.pollutionOrPurityNotes,
    );
  });

  it('changes nothing for a religion that has a pantheon instead', () => {
    expect(setNonTheisticField(pantheonSnapshot, 'mediationSummary', 'x')).toBe(pantheonSnapshot);
  });
});
