import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';

import {
  addCultureTaboo,
  redescribeCultureOrganization,
  removeCultureTaboo,
  renameCulture,
  setCultureOrganizationField,
  setCultureReligionField,
  setCultureTaboo,
  setCultureTrait,
} from './culture_editing';
import { generateCulture, getDefaultCultureGenerationConfig } from './culture_generation';
import { toCultureSnapshot, type CultureSnapshot } from './culture_snapshot';
import { getFantasyNameGeneratorSet } from '$lib/names';

function sampleSnapshot(religionSource: 'generate' | 'reference' = 'generate'): CultureSnapshot {
  const config = getDefaultCultureGenerationConfig();
  config.nameGenerators = getFantasyNameGeneratorSet('dwarf', new RNG('culture-editing'));
  config.religionSource = religionSource;
  return toCultureSnapshot(generateCulture('culture-editing', config));
}

describe('culture editing', () => {
  it('renames a culture without disturbing anything else', () => {
    const before = sampleSnapshot();
    const after = renameCulture(before, 'The Saltmarch');

    expect(after.name).toBe('The Saltmarch');
    expect(after.taboos).toEqual(before.taboos);
    expect(after.organization).toEqual(before.organization);
    // The stored snapshot is not touched: the framework decides whether there is anything to save
    // by comparing what an editor hands back against what it read.
    expect(before.name).not.toBe('The Saltmarch');
  });

  it('rewrites one prose trait at a time', () => {
    const before = sampleSnapshot();
    const after = setCultureTrait(before, 'greeting', 'They touch foreheads.');

    expect(after.greeting).toBe('They touch foreheads.');
    expect(after.musicStyle).toBe(before.musicStyle);
    expect(after.eatingTrait).toBe(before.eatingTrait);
  });

  it('rewrites one organization field at a time, leaving the description alone', () => {
    const before = sampleSnapshot();
    const after = setCultureOrganizationField(before, 'dominantProfession', 'cartographers');

    expect(after.organization.dominantProfession).toBe('cartographers');
    expect(after.organization.description).toBe(before.organization.description);
    expect(after.organization.socialMobility).toBe(before.organization.socialMobility);
  });

  it('recomposes the description from the attributes only when asked', () => {
    const edited = setCultureOrganizationField(
      setCultureOrganizationField(sampleSnapshot(), 'dominantProfession', 'cartographers'),
      'description',
      'Something a user wrote by hand.',
    );

    expect(edited.organization.description).toBe('Something a user wrote by hand.');

    const rewritten = redescribeCultureOrganization(edited);
    expect(rewritten.organization.description).toContain('Cartographers');
    expect(rewritten.organization.description).not.toBe(edited.organization.description);
  });

  it('edits one taboo without touching the others', () => {
    const before = addCultureTaboo(addCultureTaboo(sampleSnapshot(), 'First'), 'Second');
    const after = setCultureTaboo(before, before.taboos.length - 2, 'Rewritten');

    expect(after.taboos.at(-2)).toBe('Rewritten');
    expect(after.taboos.at(-1)).toBe('Second');
    expect(after.taboos).toHaveLength(before.taboos.length);
  });

  it('adds a taboo, blank by default, and removes one by position', () => {
    const before = sampleSnapshot();
    const added = addCultureTaboo(before);

    expect(added.taboos).toHaveLength(before.taboos.length + 1);
    expect(added.taboos.at(-1)).toBe('');

    const removed = removeCultureTaboo(added, added.taboos.length - 1);
    expect(removed.taboos).toEqual(before.taboos);
  });

  it('changes nothing when a taboo index names no taboo', () => {
    const before = sampleSnapshot();

    expect(setCultureTaboo(before, before.taboos.length, 'nowhere')).toBe(before);
    expect(setCultureTaboo(before, -1, 'nowhere')).toBe(before);
    expect(setCultureTaboo(before, 1.5, 'nowhere')).toBe(before);
    expect(removeCultureTaboo(before, before.taboos.length)).toBe(before);
    expect(removeCultureTaboo(before, -1)).toBe(before);
  });

  it('edits the religion a culture owns', () => {
    const before = sampleSnapshot();
    const after = setCultureReligionField(before, 'name', 'The Ashen Path');

    expect(after.religion?.name).toBe('The Ashen Path');
    expect(after.religion?.description).toBe(before.religion?.description);
  });

  /**
   * A referenced religion is a separate artifact with its own editor. Writing to it from here
   * would either edit that artifact through a window or, worse, quietly grow a copy inside the
   * culture — the copy the reference exists to avoid.
   */
  it('refuses to write a religion into a culture that references one', () => {
    const referenced = sampleSnapshot('reference');
    expect(referenced.religion).toBeNull();

    expect(setCultureReligionField(referenced, 'name', 'The Ashen Path')).toBe(referenced);
    expect(setCultureReligionField(referenced, 'description', 'Anything')).toBe(referenced);
  });
});
