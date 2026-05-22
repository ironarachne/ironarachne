import * as RNG from '@ironarachne/rng';
import type ADNDCharacter from './adndcharacter.js';
import { adndKitRows, type AdndKitRow } from './adnd_kits_data.js';

function meetsMinStats(c: ADNDCharacter, row: AdndKitRow): boolean {
  if (row.minStrength !== undefined && c.strength < row.minStrength) {
    return false;
  }
  if (row.minDexterity !== undefined && c.dexterity < row.minDexterity) {
    return false;
  }
  if (row.minConstitution !== undefined && c.constitution < row.minConstitution) {
    return false;
  }
  if (row.minIntelligence !== undefined && c.intelligence < row.minIntelligence) {
    return false;
  }
  if (row.minWisdom !== undefined && c.wisdom < row.minWisdom) {
    return false;
  }
  if (row.minCharisma !== undefined && c.charisma < row.minCharisma) {
    return false;
  }
  return true;
}

export function filterKitsForCharacter(c: ADNDCharacter, rows: AdndKitRow[] = adndKitRows): AdndKitRow[] {
  return rows.filter((row) => row.className === c.class.name && meetsMinStats(c, row));
}

/**
 * Picks a random kit from rows that match the character’s class and minimum stats, or `null` if none qualify.
 */
export function selectRandomKit(
  c: ADNDCharacter,
  rng: RNG.RNG,
  rows: AdndKitRow[] = adndKitRows,
): { name: string; features: string[] } | null {
  const candidates = filterKitsForCharacter(c, rows);
  if (candidates.length === 0) {
    return null;
  }
  const row = rng.item(candidates);
  return { name: row.name, features: row.features };
}
