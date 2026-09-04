import { describe, expect, it } from 'vitest';

import {
  formatSwnCredits,
  formatSwnStarshipFitting,
  formatSwnStarshipWeapon,
  swnStarshipDisplayName,
  swnStarshipFileStem,
  swnStarshipToDocument,
  swnStarshipToMarkdown,
  swnStarshipToText,
  SWN_CREW_COST_PER_YEAR,
} from './swn_starship_presentation';
import { rollSwnStarshipSnapshot } from './swn_starship_roll';
import type { SwnStarshipSnapshot } from './swn_starship_snapshot';

const SHIP = rollSwnStarshipSnapshot('presentation-seed');

function headings(ship: SwnStarshipSnapshot): string[] {
  return swnStarshipToDocument(ship).sections.map((entry) => entry.heading);
}

describe('swnStarshipToDocument', () => {
  it('prints the blocks a ship sheet is read from', () => {
    expect(headings(SHIP)).toEqual(
      expect.arrayContaining(['At a Glance', 'Budget', 'Hull', 'Crew and Cargo']),
    );
  });

  it('drops a section with nothing under it', () => {
    // Requirement 6.4, and the reason this module exists: `formatAsText` prints a Fittings, a
    // Weapons and a Defenses heading whether or not anything sits under any of them, so an unarmed
    // free merchant — most of what this generator rolls — exported two headings over nothing.
    const unarmed = { ...SHIP, weapons: [], defenses: [], fittings: [] };

    expect(headings(unarmed)).not.toContain('Weapons');
    expect(headings(unarmed)).not.toContain('Defenses');
    expect(headings(unarmed)).not.toContain('Fittings');
  });

  it('keeps a section that does have something under it', () => {
    const armed = {
      ...SHIP,
      weapons: [{ name: 'Reaper Battery', damage: '3d4', qualities: ['Clumsy'] }],
    } as unknown as SwnStarshipSnapshot;

    expect(headings(armed)).toContain('Weapons');
  });

  it('drops a blank line rather than printing an empty bullet', () => {
    const withBlank = {
      ...SHIP,
      fittings: [{ name: '   ', effect: '   ' }],
    } as unknown as SwnStarshipSnapshot;

    expect(headings(withBlank)).not.toContain('Fittings');
  });
});

describe('the lines', () => {
  it('prints a weapon with its qualities', () => {
    expect(
      formatSwnStarshipWeapon({ name: 'Torpedo Launcher', damage: '3d8', qualities: ['AP 20'] }),
    ).toBe('Torpedo Launcher: 3d8, AP 20');
  });

  it('prints a weapon with none, without a trailing comma', () => {
    expect(formatSwnStarshipWeapon({ name: 'Sandthrower', damage: '2d4', qualities: [] })).toBe(
      'Sandthrower: 2d4',
    );
  });

  it('says so when a weapon has no damage rather than printing a gap', () => {
    expect(formatSwnStarshipWeapon({ name: 'Ram', damage: '', qualities: [] })).toBe(
      'Ram: no damage listed',
    );
  });

  it('prints a fitting as its name when it has no effect', () => {
    expect(formatSwnStarshipFitting({ name: 'Cargo Space', effect: '' })).toBe('Cargo Space');
    expect(formatSwnStarshipFitting({ name: 'Cargo Space', effect: 'Holds things' })).toBe(
      'Cargo Space: Holds things',
    );
  });

  it('separates thousands in a price, as a sheet reads it out', () => {
    expect(formatSwnCredits(2_000_000)).toBe('2,000,000 credits');
    expect(SWN_CREW_COST_PER_YEAR).toBe(43800);
  });
});

describe('swnStarshipDisplayName', () => {
  it('is the ship name', () => {
    expect(swnStarshipDisplayName(SHIP)).toBe(SHIP.name);
  });

  it('falls back to what the ship is, and then to something', () => {
    expect(swnStarshipDisplayName({ ...SHIP, name: '' })).toBe(
      `${SHIP.ownerTypeName} ${SHIP.hullType.name}`,
    );
    expect(
      swnStarshipDisplayName({
        ...SHIP,
        name: '',
        ownerTypeName: '',
        hullType: { ...SHIP.hullType, name: '' },
      }),
    ).toBe('SWN Starship');
  });
});

describe('the exports', () => {
  it('writes Markdown headed by the ship name', () => {
    const markdown = swnStarshipToMarkdown(SHIP);

    expect(markdown.startsWith(`# ${SHIP.name}`)).toBe(true);
    expect(markdown).toContain('## Budget');
    expect(markdown).toContain(`- Owner type: ${SHIP.ownerTypeName}`);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the PDF body without the title the PDF draws itself', () => {
    const text = swnStarshipToText(SHIP);

    expect(text).not.toContain(`# ${SHIP.name}`);
    expect(text).toContain('Budget');
    expect(text).toContain(`  Owner type: ${SHIP.ownerTypeName}`);
  });

  it('names the file after the ship', () => {
    expect(swnStarshipFileStem({ ...SHIP, name: 'The Cold Star' })).toBe(
      'swn-starship-the-cold-star',
    );
  });

  it('has a filename for a ship whose name reduces to nothing', () => {
    expect(
      swnStarshipFileStem({
        ...SHIP,
        name: '???',
        ownerTypeName: '',
        hullType: { ...SHIP.hullType, name: '' },
      }),
    ).toBe('swn-starship');
  });
});
