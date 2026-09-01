import { describe, expect, it } from 'vitest';

import { rollUwCharacterSnapshot } from './uw_character_roll.js';
import {
  addUwCharacterAsset,
  addUwCharacterRow,
  addUwCharacterUpgrade,
  removeUwCharacterAsset,
  removeUwCharacterRow,
  removeUwCharacterUpgrade,
  setUwCharacterAssetClass,
  setUwCharacterAssetText,
  setUwCharacterAssetTypeName,
  setUwCharacterRowListName,
  setUwCharacterRowName,
  setUwCharacterStat,
  setUwCharacterText,
  setUwCharacterUpgradeText,
} from './uw_character_editing.js';
import { uwCharacterFromSnapshot } from './uw_character_snapshot.js';

const character = rollUwCharacterSnapshot('editing-fixture');

describe('editing an Uncharted Worlds character', () => {
  /** Requirement 4.4: one field at a time, and nothing else moves. */
  it('changes one field and leaves the rest alone', () => {
    const renamed = setUwCharacterText(character, 'firstName', 'Sabra');

    expect(renamed.firstName).toBe('Sabra');
    expect({ ...renamed, firstName: character.firstName }).toEqual(character);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(character);
    setUwCharacterStat(character, 'physique', 9);
    setUwCharacterAssetText(character, 0, 'name', 'Something else');

    expect(character).toEqual(before);
  });

  it('refuses a number a user has emptied rather than storing NaN', () => {
    expect(setUwCharacterStat(character, 'mettle', Number.NaN)).toBe(character);
    expect(setUwCharacterAssetClass(character, 0, Number.NaN)).toBe(character);
  });

  it('edits a stat without disturbing the others', () => {
    const edited = setUwCharacterStat(character, 'interface', 3);

    expect(edited.stats.interface).toBe(3);
    expect({ ...edited.stats, interface: character.stats.interface }).toEqual(character.stats);
  });

  /**
   * Decision 3, as a test: a career is stored by name, so changing the name changes which career
   * the character has and the prose follows on read.
   */
  it('changes which career a character took, and the prose follows', () => {
    const edited = setUwCharacterRowListName(character, 'careers', 0, 'Explorer');

    expect(edited.careers[0]).toEqual({ name: 'Explorer' });
    expect(uwCharacterFromSnapshot(edited).careers[0].skills.length).toBeGreaterThan(0);
  });

  it('changes which skill a character has, and the description follows', () => {
    const edited = setUwCharacterRowListName(character, 'skills', 0, 'Leadership');
    const live = uwCharacterFromSnapshot(edited);

    expect(live.skills[0].name).toBe('Leadership');
    expect(live.skills[0].description).not.toBe('');
  });

  it('adds and removes a career or a skill', () => {
    for (const list of ['careers', 'skills'] as const) {
      const added = addUwCharacterRow(character, list);
      expect(added[list]).toHaveLength(character[list].length + 1);
      expect(added[list][added[list].length - 1]).toEqual({ name: '' });

      expect(removeUwCharacterRow(added, list, added[list].length - 1)[list]).toEqual(
        character[list],
      );
    }
  });

  it('sets the origin and the workspace by name', () => {
    expect(setUwCharacterRowName(character, 'origin', 'Frontier').origin).toEqual({
      name: 'Frontier',
    });
    expect(setUwCharacterRowName(character, 'workspace', 'A Shed').workspace).toEqual({
      name: 'A Shed',
    });
  });

  it('edits every part of an asset, because nothing else owns its text', () => {
    const renamed = setUwCharacterAssetText(character, 0, 'name', 'The Kestrel');
    const described = setUwCharacterAssetText(renamed, 0, 'description', 'Scarred but reliable');
    const typed = setUwCharacterAssetTypeName(described, 0, 'Freighter');
    const classed = setUwCharacterAssetClass(typed, 0, 3);

    expect(classed.assets[0]).toMatchObject({
      name: 'The Kestrel',
      description: 'Scarred but reliable',
      assetClass: 3,
      type: { name: 'Freighter' },
    });
    expect(classed.assets.slice(1)).toEqual(character.assets.slice(1));
  });

  it('adds and removes an asset', () => {
    const added = addUwCharacterAsset(character);

    expect(added.assets).toHaveLength(character.assets.length + 1);
    expect(added.assets[added.assets.length - 1]).toMatchObject({ name: '', assetClass: 0 });
    expect(removeUwCharacterAsset(added, added.assets.length - 1).assets).toEqual(character.assets);
  });

  it('edits, adds and removes an upgrade on one asset only', () => {
    const withUpgrade = addUwCharacterUpgrade(character, 0);
    const index = withUpgrade.assets[0].upgrades.length - 1;
    const named = setUwCharacterUpgradeText(withUpgrade, 0, index, 'name', 'Reinforced hull');
    const described = setUwCharacterUpgradeText(named, 0, index, 'description', 'It holds');

    expect(described.assets[0].upgrades[index]).toMatchObject({
      name: 'Reinforced hull',
      description: 'It holds',
    });
    expect(described.assets[1]).toEqual(character.assets[1]);
    expect(removeUwCharacterUpgrade(described, 0, index).assets[0].upgrades).toEqual(
      character.assets[0].upgrades,
    );
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setUwCharacterRowListName(character, 'skills', 99, 'Whistling')).toBe(character);
    expect(setUwCharacterRowListName(character, 'careers', -1, 'Explorer')).toBe(character);
    expect(removeUwCharacterRow(character, 'skills', 99)).toBe(character);
    expect(setUwCharacterAssetText(character, 99, 'name', 'nothing')).toBe(character);
    expect(setUwCharacterAssetTypeName(character, 99, 'nothing')).toBe(character);
    expect(removeUwCharacterAsset(character, 99)).toBe(character);
    expect(addUwCharacterUpgrade(character, 99)).toBe(character);
    expect(setUwCharacterUpgradeText(character, 99, 0, 'name', 'nothing')).toBe(character);
    expect(setUwCharacterUpgradeText(character, 0, 99, 'name', 'nothing')).toBe(character);
    expect(removeUwCharacterUpgrade(character, 99, 0)).toBe(character);
    expect(removeUwCharacterUpgrade(character, 0, 99)).toBe(character);
  });
});
