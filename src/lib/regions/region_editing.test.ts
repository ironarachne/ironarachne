import { describe, expect, it } from 'vitest';

import {
  removeRegionPlace,
  setRealmText,
  setRegionMainRealm,
  setRegionPlaceText,
  setRegionText,
} from './region_editing';
import { rollRegionSnapshot } from './region_roll';

const snapshot = rollRegionSnapshot('editing-seed');

describe('the fixture these edits are made against', () => {
  it('has the realms and settlements the edits below address', () => {
    expect(snapshot.realms.length).toBeGreaterThan(1);
    expect(snapshot.settlements.length).toBeGreaterThan(1);
  });
});

describe('editing a region', () => {
  it('renames it without touching what is on it', () => {
    const edited = setRegionText(snapshot, 'name', 'The Cold Marches');
    expect(edited.name).toEqual('The Cold Marches');
    expect(edited.realms).toEqual(snapshot.realms);
    expect(edited.settlements).toEqual(snapshot.settlements);
    expect(edited.map).toEqual(snapshot.map);
  });

  it('rewrites its description', () => {
    expect(setRegionText(snapshot, 'description', 'Nobody farms here.').description).toEqual(
      'Nobody farms here.',
    );
  });

  it('leaves the original untouched', () => {
    const before = snapshot.name;
    setRegionText(snapshot, 'name', 'somewhere else');
    expect(snapshot.name).toEqual(before);
  });

  it('moves the seat to another realm', () => {
    const other = snapshot.mainRealm === 0 ? 1 : 0;
    expect(setRegionMainRealm(snapshot, other).mainRealm).toEqual(other);
  });

  it('does not rewrite the prose that mentions the old seat', () => {
    // 4.2: the description may have been rewritten by hand, and a generator that quietly corrects
    // it is regenerating over the user's work.
    const other = snapshot.mainRealm === 0 ? 1 : 0;
    expect(setRegionMainRealm(snapshot, other).description).toEqual(snapshot.description);
  });

  it('ignores a seat that is not a realm it has', () => {
    expect(setRegionMainRealm(snapshot, 99)).toEqual(snapshot);
    expect(setRegionMainRealm(snapshot, -1)).toEqual(snapshot);
  });
});

describe('editing one realm', () => {
  it('changes its words without disturbing its neighbours (4.4)', () => {
    const named = setRealmText(snapshot, 0, 'name', 'Ashmarch');
    const edited = setRealmText(named, 0, 'adjective', 'Ashmarcher');
    expect(edited.realms[0].name).toEqual('Ashmarch');
    expect(edited.realms[0].adjective).toEqual('Ashmarcher');
    expect(edited.realms.slice(1)).toEqual(snapshot.realms.slice(1));
  });

  it('leaves its arms, its ruler and its tiles alone', () => {
    const edited = setRealmText(snapshot, 0, 'description', 'A cold place.');
    expect(edited.realms[0].heraldry).toEqual(snapshot.realms[0].heraldry);
    expect(edited.realms[0].authority).toEqual(snapshot.realms[0].authority);
    expect(edited.realms[0].tiles).toEqual(snapshot.realms[0].tiles);
  });

  it('ignores a realm that is not there', () => {
    expect(setRealmText(snapshot, 99, 'name', 'nowhere')).toEqual(snapshot);
    expect(setRealmText(snapshot, -1, 'name', 'nowhere')).toEqual(snapshot);
  });
});

describe('editing the settlements and organizations', () => {
  it('renames one settlement and leaves the rest', () => {
    const edited = setRegionPlaceText(snapshot, 'settlements', 0, 'name', 'Coldwater');
    expect(edited.settlements[0].name).toEqual('Coldwater');
    expect(edited.settlements.slice(1)).toEqual(snapshot.settlements.slice(1));
    expect(edited.organizations).toEqual(snapshot.organizations);
  });

  it('rewrites a description without touching the name', () => {
    const edited = setRegionPlaceText(snapshot, 'settlements', 0, 'description', 'A mill town.');
    expect(edited.settlements[0].description).toEqual('A mill town.');
    expect(edited.settlements[0].name).toEqual(snapshot.settlements[0].name);
  });

  it('takes one out and leaves the rest', () => {
    const edited = removeRegionPlace(snapshot, 'settlements', 0);
    expect(edited.settlements).toHaveLength(snapshot.settlements.length - 1);
    expect(edited.settlements[0]).toEqual(snapshot.settlements[1]);
  });

  it('ignores an index that is not there', () => {
    expect(setRegionPlaceText(snapshot, 'organizations', 99, 'name', 'nowhere')).toEqual(snapshot);
    expect(removeRegionPlace(snapshot, 'settlements', 99)).toEqual(snapshot);
  });
});
