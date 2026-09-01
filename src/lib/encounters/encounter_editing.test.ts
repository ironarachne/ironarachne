import { describe, expect, it } from 'vitest';

import {
  removeEncounterGroup,
  removeEncounterMob,
  setEncounterGroupName,
  setEncounterMobName,
  setEncounterName,
} from './encounter_editing.js';
import { rollEncounterSnapshot } from './encounter_roll.js';

/** Two groups, several mobs each, so "one at a time" is worth asserting. */
const encounter = rollEncounterSnapshot('editing-fixture', {
  templateName: 'necromancer and minions',
});

describe('editing an encounter', () => {
  it('has a fixture with more than one group and mob', () => {
    expect(encounter.groups.length).toBeGreaterThan(1);
    expect(encounter.groups[0].mobs.length + encounter.groups[1].mobs.length).toBeGreaterThan(1);
  });

  it('renames the encounter and leaves the groups alone', () => {
    const edited = setEncounterName(encounter, 'The crypt below the mill');

    expect(edited.name).toBe('The crypt below the mill');
    expect(edited.groups).toEqual(encounter.groups);
  });

  /** Requirement 4.4: one field at a time, and nothing else moves. */
  it('renames one group and leaves the others alone', () => {
    const edited = setEncounterGroupName(encounter, 1, 'the risen');

    expect(edited.groups[1].name).toBe('the risen');
    expect(edited.groups[1].mobs).toEqual(encounter.groups[1].mobs);
    expect(edited.groups[0]).toEqual(encounter.groups[0]);
  });

  it('renames one mob and leaves the rest of it, and its neighbours, alone', () => {
    const edited = setEncounterMobName(encounter, 0, 0, 'Old Tam');
    const before = encounter.groups[0].mobs[0];
    const after = edited.groups[0].mobs[0];

    expect(after.name).toBe('Old Tam');
    expect({ ...after, name: before.name }).toEqual(before);
    expect(edited.groups[0].mobs.slice(1)).toEqual(encounter.groups[0].mobs.slice(1));
    expect(edited.groups[1]).toEqual(encounter.groups[1]);
  });

  it('never writes into the snapshot it was given', () => {
    const before = structuredClone(encounter);
    setEncounterName(encounter, 'x');
    setEncounterGroupName(encounter, 0, 'x');
    setEncounterMobName(encounter, 0, 0, 'x');
    removeEncounterMob(encounter, 0, 0);
    removeEncounterGroup(encounter, 0);

    expect(encounter).toEqual(before);
  });

  it('removes a mob and leaves the rest in order', () => {
    const removed = removeEncounterMob(encounter, 1, 0);

    expect(removed.groups[1].mobs).toEqual(encounter.groups[1].mobs.slice(1));
    expect(removed.groups[0]).toEqual(encounter.groups[0]);
  });

  it('removes a group and leaves the rest in order', () => {
    const removed = removeEncounterGroup(encounter, 0);

    expect(removed.groups).toEqual(encounter.groups.slice(1));
  });

  it('can empty an encounter, which is an ordinary state', () => {
    let current = encounter;
    while (current.groups.length > 0) {
      current = removeEncounterGroup(current, 0);
    }

    expect(current.groups).toEqual([]);
    expect(current.name).toBe(encounter.name);
  });

  /** An index nothing is at is a no-op, not a throw: the editor is driven by a live list. */
  it('ignores an index that is not there', () => {
    expect(setEncounterGroupName(encounter, 99, 'x')).toBe(encounter);
    expect(setEncounterGroupName(encounter, -1, 'x')).toBe(encounter);
    expect(setEncounterMobName(encounter, 99, 0, 'x')).toBe(encounter);
    expect(setEncounterMobName(encounter, 0, 99, 'x')).toEqual(encounter);
    expect(removeEncounterMob(encounter, 0, 99)).toEqual(encounter);
    expect(removeEncounterMob(encounter, 0.5, 0)).toBe(encounter);
    expect(removeEncounterGroup(encounter, 99)).toBe(encounter);
  });
});
