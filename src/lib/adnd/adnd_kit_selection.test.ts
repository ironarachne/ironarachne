import { RNG } from '@ironarachne/rng';
import { describe, expect, it } from 'vitest';
import ADNDCharacter from './adndcharacter';
import { filterKitsForCharacter, selectRandomKit } from './adnd_kit_selection';
import { adndKitRows } from './adnd_kits_data';
import paladin from './classes/paladin';

describe('filterKitsForCharacter', () => {
  it('excludes rows when a minimum stat is not met', () => {
    const c = new ADNDCharacter();
    c.class = paladin;
    c.strength = 10;
    c.dexterity = 10;
    c.constitution = 10;
    c.intelligence = 10;
    c.wisdom = 10;
    c.charisma = 12;
    const rows = adndKitRows.filter((r) => r.className === 'paladin' && r.name === 'Hospitaler');
    const ok = filterKitsForCharacter(c, rows);
    expect(ok).toHaveLength(0);
  });

  it('includes rows when all minimum stats are met', () => {
    const c = new ADNDCharacter();
    c.class = paladin;
    c.strength = 10;
    c.dexterity = 10;
    c.constitution = 10;
    c.intelligence = 10;
    c.wisdom = 10;
    c.charisma = 16;
    const rows = adndKitRows.filter((r) => r.className === 'paladin' && r.name === 'Hospitaler');
    const ok = filterKitsForCharacter(c, rows);
    expect(ok).toHaveLength(1);
  });
});

describe('selectRandomKit', () => {
  it('returns null when the candidate list is empty', () => {
    const c = new ADNDCharacter();
    c.class = paladin;
    c.charisma = 8;
    const rng = new RNG('kit-empty-1');
    const rows = adndKitRows.filter((r) => r.className === 'paladin' && (r.minCharisma ?? 0) > 8);
    const kit = selectRandomKit(c, rng, rows);
    expect(kit).toBeNull();
  });

  it('returns a kit from qualifying rows with stable seeded RNG', () => {
    const c = new ADNDCharacter();
    c.class = paladin;
    c.charisma = 18;
    c.strength = 10;
    c.dexterity = 10;
    c.constitution = 10;
    c.intelligence = 10;
    c.wisdom = 10;
    const rows = adndKitRows.filter((r) => r.className === 'paladin');
    const rng = new RNG('kit-pick-1');
    const kit = selectRandomKit(c, rng, rows);
    expect(kit).not.toBeNull();
    expect(kit?.name).toMatch(/Hospitaler|Avenger/);
  });
});
