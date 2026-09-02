import { describe, expect, it } from 'vitest';

import {
  removeCivilization,
  removeMoon,
  setCivilizationNumber,
  setCivilizationText,
  setMoonNumber,
  setMoonText,
  setPlanetFlag,
  setPlanetNumber,
  setPlanetText,
} from './planet_editing';
import { rollPlanet } from './planet_roll';
import { toPlanetSnapshot, type PlanetSnapshot } from './planet_snapshot';

function inhabitedSnapshot(): PlanetSnapshot {
  for (let index = 0; index < 60; index++) {
    const roll = rollPlanet(`editing-${index}`);
    if (roll.civilization !== undefined && roll.moons.length > 1) {
      return toPlanetSnapshot(roll);
    }
  }
  throw new Error('no seed in range produced an inhabited planet with two moons');
}

const snapshot = inhabitedSnapshot();

describe('editing a planet', () => {
  it('renames it without touching anything else', () => {
    const edited = setPlanetText(snapshot, 'name', 'Kesh');
    expect(edited.name).toEqual('Kesh');
    expect(edited.moons).toEqual(snapshot.moons);
    expect(edited.mass).toEqual(snapshot.mass);
  });

  it('leaves the original untouched', () => {
    const before = snapshot.name;
    setPlanetText(snapshot, 'name', 'somewhere else');
    expect(snapshot.name).toEqual(before);
  });

  it('rewrites its description and its type', () => {
    const typed = setPlanetText(snapshot, 'classification', 'shattered world');
    expect(setPlanetText(typed, 'description', 'A ruin.')).toMatchObject({
      classification: 'shattered world',
      description: 'A ruin.',
    });
  });

  it('sets a measurement without recomputing the ones derived from it', () => {
    // 4.2: `getGravityFromMassAndRadius` sits one import away, and calling it here would overrule a
    // gravity the referee set on purpose.
    const edited = setPlanetNumber(snapshot, 'mass', 12);
    expect(edited.mass).toEqual(12);
    expect(edited.gravity).toEqual(snapshot.gravity);
  });

  it('leaves a measurement alone when the control produced nothing', () => {
    expect(setPlanetNumber(snapshot, 'radius', Number.NaN).radius).toEqual(snapshot.radius);
  });

  it('sets whether it has an atmosphere and rings', () => {
    expect(setPlanetFlag(snapshot, 'has_atmosphere', true).has_atmosphere).toBe(true);
    expect(setPlanetFlag(snapshot, 'has_ring_system', false).has_ring_system).toBe(false);
  });
});

describe('editing one moon', () => {
  it('changes its words without disturbing its neighbours (4.4)', () => {
    const named = setMoonText(snapshot, 0, 'name', 'Little Sister');
    const edited = setMoonText(named, 0, 'classification', 'captured asteroid');
    expect(edited.moons[0].name).toEqual('Little Sister');
    expect(edited.moons[0].classification).toEqual('captured asteroid');
    expect(edited.moons.slice(1)).toEqual(snapshot.moons.slice(1));
  });

  it('changes its measurements', () => {
    expect(setMoonNumber(snapshot, 0, 'radius', 900).moons[0].radius).toEqual(900);
    expect(setMoonNumber(snapshot, 0, 'radius', Number.NaN).moons[0].radius).toEqual(
      snapshot.moons[0].radius,
    );
  });

  it('takes one out of the sky and leaves the rest', () => {
    const edited = removeMoon(snapshot, 0);
    expect(edited.moons.length).toEqual(snapshot.moons.length - 1);
    expect(edited.moons[0]).toEqual(snapshot.moons[1]);
  });

  it('ignores a moon that is not there', () => {
    expect(setMoonText(snapshot, 99, 'name', 'nowhere')).toEqual(snapshot);
    expect(setMoonNumber(snapshot, -1, 'mass', 1)).toEqual(snapshot);
    expect(removeMoon(snapshot, 99)).toEqual(snapshot);
  });
});

describe('editing the civilization', () => {
  it('renames it and rewrites what it is', () => {
    const named = setCivilizationText(snapshot, 'name', 'The Concord');
    expect(setCivilizationText(named, 'description', 'They keep to themselves.')).toMatchObject({
      civilization: { name: 'The Concord', description: 'They keep to themselves.' },
    });
  });

  it('sets its population and technology level', () => {
    expect(setCivilizationNumber(snapshot, 'population', 4200).civilization?.population).toEqual(
      4200,
    );
    expect(
      setCivilizationNumber(snapshot, 'technology_level', 9).civilization?.technology_level,
    ).toEqual(9);
  });

  it('empties the planet of whoever lived there, keeping the world', () => {
    const edited = removeCivilization(snapshot);
    expect(edited.civilization).toBeUndefined();
    expect('civilization' in edited).toBe(false);
    expect(edited.name).toEqual(snapshot.name);
  });

  it('does nothing to a planet nobody lives on', () => {
    const empty = removeCivilization(snapshot);
    expect(setCivilizationText(empty, 'name', 'nobody')).toEqual(empty);
    expect(setCivilizationNumber(empty, 'population', 1)).toEqual(empty);
  });
});
