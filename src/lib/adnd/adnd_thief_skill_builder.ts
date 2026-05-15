import type ADNDCharacter from './adndcharacter.js';
import * as ThiefSkills from './adndthiefskills.js';
import type { ThiefSkillRow } from './adndthiefskills.js';

export type AdndThiefSkillBuildKind = 'thief' | 'bard';

/** Matches {@link ThiefSkills.distributePoints} per-skill cap on discretionary points. */
export const ADND_THIEF_SKILL_BONUS_CAP = 30;

export function getThiefSkillBuildKindForClass(className: string): AdndThiefSkillBuildKind | null {
  if (className === 'thief') return 'thief';
  if (className === 'bard') return 'bard';
  return null;
}

export function getThiefSkillPointPool(kind: AdndThiefSkillBuildKind): number {
  return kind === 'bard' ? 20 : 60;
}

function cloneRows(rows: ThiefSkillRow[]): ThiefSkillRow[] {
  return rows.map((r) => ({ ...r }));
}

/** Base rows before Dex / race (same as class `apply`). */
export function getBaseThiefSkillRows(kind: AdndThiefSkillBuildKind): ThiefSkillRow[] {
  if (kind === 'bard') {
    return cloneRows([
      { name: 'Pick Pockets', value: 10, points: 0 },
      { name: 'Detect Noise', value: 20, points: 0 },
      { name: 'Climb Walls', value: 50, points: 0 },
      { name: 'Read Languages', value: 5, points: 0 },
    ]);
  }
  return cloneRows([
    { name: 'Pick Pockets', value: 15, points: 0 },
    { name: 'Open Locks', value: 10, points: 0 },
    { name: 'Find/Remove Traps', value: 5, points: 0 },
    { name: 'Move Silently', value: 10, points: 0 },
    { name: 'Hide in Shadows', value: 5, points: 0 },
    { name: 'Detect Noise', value: 15, points: 0 },
    { name: 'Climb Walls', value: 60, points: 0 },
    { name: 'Read Languages', value: 0, points: 0 },
  ]);
}

function resolveThiefRaceKey(character: ADNDCharacter): string {
  let raceName = character.race.name;
  if (character.race.name.includes('halfling')) {
    raceName = 'halfling';
  }
  return raceName;
}

/** Rows after Dex and racial modifiers; discretionary points not applied. */
export function prepareThiefSkillRowsForCharacter(
  kind: AdndThiefSkillBuildKind,
  character: ADNDCharacter,
): ThiefSkillRow[] {
  const rows = getBaseThiefSkillRows(kind);
  ThiefSkills.modifyForDexterity(rows, character.dexterity);
  ThiefSkills.modifyForRace(rows, resolveThiefRaceKey(character));
  return rows;
}

export function sumThiefSkillBonuses(bonuses: Record<string, number>): number {
  let s = 0;
  for (const v of Object.values(bonuses)) {
    s += v;
  }
  return s;
}

export function thiefSkillBonusesAreValid(
  kind: AdndThiefSkillBuildKind,
  bonuses: Record<string, number>,
  skillNames: string[],
): boolean {
  const pool = getThiefSkillPointPool(kind);
  let sum = 0;
  for (const name of skillNames) {
    const n = bonuses[name];
    if (typeof n !== 'number' || !Number.isFinite(n) || !Number.isInteger(n)) {
      return false;
    }
    if (n < 0 || n > ADND_THIEF_SKILL_BONUS_CAP) {
      return false;
    }
    sum += n;
  }
  return sum === pool;
}

/** Pushes thief skill lines onto `character.abilities` (builder path). */
export function appendThiefSkillAbilityLines(
  character: ADNDCharacter,
  kind: AdndThiefSkillBuildKind,
  bonuses: Record<string, number>,
): void {
  const rows = prepareThiefSkillRowsForCharacter(kind, character);
  for (const row of rows) {
    const bonus = bonuses[row.name] ?? 0;
    character.abilities.push(`${row.name}: ${row.value + bonus}%`);
  }
}
