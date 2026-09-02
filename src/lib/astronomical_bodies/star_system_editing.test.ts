import { describe, expect, it } from 'vitest';

import {
  removeSystemBody,
  setStarSystemText,
  setSystemBodyNumber,
  setSystemBodyText,
} from './star_system_editing';
import { rollStarSystemSnapshot } from './star_system_roll';

const snapshot = rollStarSystemSnapshot('editing-seed', { planetCount: 4 });

describe('the fixture these edits are made against', () => {
  it('has the stars and planets the edits below address', () => {
    expect(snapshot.stars.length).toBeGreaterThan(0);
    expect(snapshot.planets.length).toBeGreaterThan(1);
  });
});

describe('editing a star system', () => {
  it('renames it without touching its bodies', () => {
    const edited = setStarSystemText(snapshot, 'name', 'Tannhauser');
    expect(edited.name).toEqual('Tannhauser');
    expect(edited.stars).toEqual(snapshot.stars);
    expect(edited.planets).toEqual(snapshot.planets);
  });

  it('rewrites its description', () => {
    expect(setStarSystemText(snapshot, 'description', 'Nobody goes there.').description).toEqual(
      'Nobody goes there.',
    );
  });

  it('leaves the original untouched', () => {
    const before = snapshot.name;
    setStarSystemText(snapshot, 'name', 'somewhere else');
    expect(snapshot.name).toEqual(before);
  });
});

describe('editing one body', () => {
  it('changes a planet without disturbing its neighbours (4.4)', () => {
    const named = setSystemBodyText(snapshot, 'planets', 0, 'name', 'Cinder');
    const edited = setSystemBodyText(named, 'planets', 0, 'classification', 'ash world');
    expect(edited.planets[0].name).toEqual('Cinder');
    expect(edited.planets[0].classification).toEqual('ash world');
    expect(edited.planets.slice(1)).toEqual(snapshot.planets.slice(1));
    expect(edited.stars).toEqual(snapshot.stars);
  });

  it('changes a star without disturbing the planets', () => {
    const edited = setSystemBodyText(snapshot, 'stars', 0, 'description', 'It is very old.');
    expect(edited.stars[0].description).toEqual('It is very old.');
    expect(edited.planets).toEqual(snapshot.planets);
  });

  it('sets a measurement', () => {
    expect(setSystemBodyNumber(snapshot, 'stars', 0, 'luminosity', 3).stars[0].luminosity).toEqual(
      3,
    );
    expect(setSystemBodyNumber(snapshot, 'planets', 0, 'mass', 12).planets[0].mass).toEqual(12);
  });

  it('leaves a measurement alone when the control produced nothing', () => {
    expect(
      setSystemBodyNumber(snapshot, 'planets', 0, 'radius', Number.NaN).planets[0].radius,
    ).toEqual(snapshot.planets[0].radius);
  });

  it('does not re-sort the planets when an orbit moves', () => {
    // 4.2, and a usability point: re-sorting under a referee who has just typed would move the row
    // they were working in.
    const edited = setSystemBodyNumber(snapshot, 'planets', 0, 'orbital_distance', 999);
    expect(edited.planets.map((planet) => planet.name)).toEqual(
      snapshot.planets.map((planet) => planet.name),
    );
  });

  it('takes a body out of either list and leaves the rest', () => {
    const edited = removeSystemBody(snapshot, 'planets', 0);
    expect(edited.planets.length).toEqual(snapshot.planets.length - 1);
    expect(edited.planets[0]).toEqual(snapshot.planets[1]);
    expect(removeSystemBody(snapshot, 'stars', 0).stars.length).toEqual(snapshot.stars.length - 1);
  });

  it('ignores an index that is not there', () => {
    expect(setSystemBodyText(snapshot, 'planets', 99, 'name', 'nowhere')).toEqual(snapshot);
    expect(setSystemBodyNumber(snapshot, 'stars', -1, 'mass', 1)).toEqual(snapshot);
    expect(removeSystemBody(snapshot, 'planets', 99)).toEqual(snapshot);
  });
});
