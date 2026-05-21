import type * as RNG from '@ironarachne/rng';
import type ADNDCharacter from './adndcharacter.js';
import type ADNDClass from './adndclass.js';
import type ADNDSpell from './adndspell.js';
import * as Spells from './spells.js';

export type AdndStartingSpellChoiceGroup = {
  count: number;
  candidates: ADNDSpell[];
};

/** Same random spell picks as historical class `apply` implementations (used by the full generator). */
export function assignRandomStartingSpellsForClass(
  cls: ADNDClass,
  character: ADNDCharacter,
  rng: RNG.RNG,
): void {
  const allSpells = Spells.getAll();
  for (let i = 0; i < cls.spellList.length; i++) {
    let filteredSpells = Spells.getFilteredSpells(cls.spellList[i].filter, allSpells);
    filteredSpells = rng.shuffle(filteredSpells);
    for (let j = 0; j < cls.spellList[i].count; j++) {
      const filteredSpell = filteredSpells.pop();
      if (filteredSpell === undefined) {
        throw new Error('Spell is undefined.');
      }
      character.spells.push(filteredSpell);
    }
  }
}

/** Eligible spells per {@link ADNDClass#spellList} entry (sorted by name) for UI selection. */
export function getStartingSpellChoiceGroups(cls: ADNDClass): AdndStartingSpellChoiceGroup[] {
  if (!cls.hasSpells || cls.spellList.length === 0) return [];
  const allSpells = Spells.getAll();
  return cls.spellList.map((entry) => {
    const candidates = [...Spells.getFilteredSpells(entry.filter, allSpells)];
    candidates.sort((a, b) => a.name.localeCompare(b.name));
    return { count: entry.count, candidates };
  });
}

export function starterSpellSelectionIsComplete(cls: ADNDClass, picks: string[][]): boolean {
  const groups = getStartingSpellChoiceGroups(cls);
  if (groups.length === 0) return true;
  for (let i = 0; i < groups.length; i++) {
    const row = picks[i];
    if (!row || row.length !== groups[i].count) return false;
    const seen = new Set<string>();
    for (let j = 0; j < groups[i].count; j++) {
      const name = row[j];
      if (!name) return false;
      if (!groups[i].candidates.some((s) => s.name === name)) return false;
      if (seen.has(name)) return false;
      seen.add(name);
    }
  }
  return true;
}

/** Builds the spellbook from parallel {@link starterSpellSelectionIsComplete valid} picks. */
export function startingSpellsFromPicks(cls: ADNDClass, picks: string[][]): ADNDSpell[] {
  const groups = getStartingSpellChoiceGroups(cls);
  const out: ADNDSpell[] = [];
  for (let i = 0; i < groups.length; i++) {
    const row = picks[i];
    if (!row || row.length !== groups[i].count) {
      throw new Error('Incomplete starter spell picks.');
    }
    const seen = new Set<string>();
    for (let j = 0; j < groups[i].count; j++) {
      const name = row[j];
      const chosen = groups[i].candidates.find((s) => s.name === name);
      if (!chosen) {
        throw new Error(`Invalid spell pick: ${name}`);
      }
      if (seen.has(name)) {
        throw new Error('Duplicate spell in starter group.');
      }
      seen.add(name);
      out.push(chosen);
    }
  }
  return out;
}
