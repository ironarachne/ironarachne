import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import { distributePoints, modifyForDexterity, modifyForRace } from './adndthiefskills.js';
import type { ThiefSkillRow } from './adndthiefskills.js';

function thiefRows(): ThiefSkillRow[] {
  return [
    { name: 'Pick Pockets', value: 15, points: 0 },
    { name: 'Open Locks', value: 10, points: 0 },
    { name: 'Find/Remove Traps', value: 5, points: 0 },
    { name: 'Move Silently', value: 10, points: 0 },
    { name: 'Hide in Shadows', value: 5, points: 0 },
    { name: 'Detect Noise', value: 15, points: 0 },
    { name: 'Climb Walls', value: 60, points: 0 },
    { name: 'Read Languages', value: 0, points: 0 },
  ];
}

describe('distributePoints', () => {
  it('spends the budget exactly, over many seeds', () => {
    // The regression this exists for: the award used to be drawn against the per-skill headroom
    // alone and subtracted afterwards, so the last one overshot. A single seed hides that — 14% of
    // rolls happened to land exactly — so this sweeps enough of them to catch it.
    for (let seed = 0; seed < 200; seed++) {
      const rows = distributePoints(thiefRows(), 60, new RNG(`pool-${seed}`));
      const dealt = rows.reduce((sum, row) => sum + row.points, 0);

      expect(dealt).toBe(60);
    }
  });

  it('never puts more than 30 points into one skill', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rows = distributePoints(thiefRows(), 60, new RNG(`cap-${seed}`));

      expect(rows.every((row) => row.points <= 30)).toBe(true);
    }
  });

  it('spends a bard budget exactly too', () => {
    const rows = distributePoints(
      [
        { name: 'Pick Pockets', value: 10, points: 0 },
        { name: 'Detect Noise', value: 20, points: 0 },
        { name: 'Climb Walls', value: 50, points: 0 },
        { name: 'Read Languages', value: 5, points: 0 },
      ],
      20,
      new RNG('bard-pool'),
    );

    expect(rows.reduce((sum, row) => sum + row.points, 0)).toBe(20);
  });

  it('leaves the base values alone', () => {
    const rows = distributePoints(thiefRows(), 60, new RNG('values'));

    expect(rows.find((row) => row.name === 'Climb Walls')?.value).toBe(60);
  });
});

describe('modifyForDexterity', () => {
  it('adds the dexterity adjustment to each base', () => {
    const rows = modifyForDexterity(thiefRows(), 18);

    expect(rows.find((row) => row.name === 'Pick Pockets')?.value).toBe(15 + 10);
    expect(rows.find((row) => row.name === 'Open Locks')?.value).toBe(10 + 15);
  });

  it('penalises a low dexterity', () => {
    const rows = modifyForDexterity(thiefRows(), 9);

    expect(rows.find((row) => row.name === 'Move Silently')?.value).toBe(10 - 20);
  });
});

describe('modifyForRace', () => {
  it('applies the racial adjustment', () => {
    const rows = modifyForRace(thiefRows(), 'dwarf');

    expect(rows.find((row) => row.name === 'Find/Remove Traps')?.value).toBe(5 + 15);
    expect(rows.find((row) => row.name === 'Climb Walls')?.value).toBe(60 - 10);
  });

  it('leaves a human unchanged', () => {
    const rows = modifyForRace(thiefRows(), 'human');

    expect(rows.map((row) => row.value)).toEqual(thiefRows().map((row) => row.value));
  });
});
