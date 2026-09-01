/**
 * Writing an Uncharted Worlds character snapshot, and reading one back.
 *
 * **Nothing in this library is function-typed** — the search for a closure on a `UWCharacter`
 * returns nothing — so unlike the DCC character there is no handler to strip and put back. What
 * this codec does instead is decide which prose belongs to the character and which belongs to the
 * rulebook, and store only the first.
 *
 * **The rulebook rows travel by name, and their prose is derived on read.** That is decision 3 of
 * docs/readiness-characters.md, applied to every table row rather than only to a skill: a career, an
 * origin, a workspace and a skill are all rows a character *points at*, and each carries text this
 * library owns. Storing the text would freeze it — a wording fix would reach a character generated
 * tomorrow and never one saved last month — and it would put several kilobytes of rulebook into
 * every artifact. Deriving it is safe here in a way it would not be elsewhere, because the
 * derivation is a lookup: no RNG, no user input, no dice.
 *
 * **The question #48 and #49 left is answered cleanly here: nothing writes to a row after it is
 * drawn.** The DCC farmer's own handler rewrites its occupation's name, and a SWN lucky sign
 * carries the character's own modifier, so neither could be rebuilt from a name. Uncharted Worlds
 * generation copies each row it uses and then only ever *reads* it — `rng.shuffle` reorders the
 * copied origin's skill list, and the order of a list of options is not data. So a name is enough.
 *
 * **The assets are the exception, and they are stored in full.** An asset is not a table row: it is
 * a class, a type and a hand of upgrades drawn and assembled at generation time, with a name
 * composed from the parts. There is nothing to look it up by, and it is the most characterful thing
 * a character owns.
 *
 * A row this build no longer has rebuilds as a placeholder carrying the stored name and nothing
 * else, rather than throwing or quarantining the character. A character whose career was renamed is
 * still that character, and their stats, assets and skills are all still on the sheet.
 */

import type { RNG } from '@ironarachne/rng';

import { CAREERS } from './career_data.js';
import { ORIGINS } from './origin_data.js';
import type {
  Asset,
  Career,
  Origin,
  Skill,
  StatBlock,
  UWCharacter,
  Workspace,
} from './character.js';

/** A rulebook row as it is stored: the name it was drawn under, and nothing else. */
export type StoredUwRow = {
  name: string;
};

/** An Uncharted Worlds character as it is stored. */
export type UwCharacterSnapshot = {
  firstName: string;
  lastName: string;
  descriptors: string;
  stats: StatBlock;
  careers: StoredUwRow[];
  origin: StoredUwRow;
  workspace: StoredUwRow;
  skills: StoredUwRow[];
  advancement: string;
  assets: Asset[];
};

function storedRow(row: { name: string }): StoredUwRow {
  return { name: row.name };
}

export function toUwCharacterSnapshot(character: UWCharacter): UwCharacterSnapshot {
  return {
    firstName: character.firstName,
    lastName: character.lastName,
    descriptors: character.descriptors,
    stats: { ...character.stats },
    careers: character.careers.map(storedRow),
    origin: storedRow(character.origin),
    workspace: storedRow(character.workspace),
    skills: character.skills.map(storedRow),
    advancement: character.advancement,
    assets: structuredClone(character.assets),
  };
}

/**
 * Every skill this build has, from both tables, by name.
 *
 * Four names appear in a career and in an origin with descriptions that differ — by trailing
 * whitespace, and by nothing else — so which one wins is not a decision worth making carefully. The
 * career table is read first because it is the larger of the two.
 */
function skillDescriptions(): Map<string, string> {
  const descriptions = new Map<string, string>();
  for (const career of CAREERS) {
    for (const skill of career.skills) {
      descriptions.set(skill.name, skill.description);
    }
  }
  for (const origin of ORIGINS) {
    for (const skill of origin.skills) {
      if (!descriptions.has(skill.name)) {
        descriptions.set(skill.name, skill.description);
      }
    }
  }
  return descriptions;
}

/** Every workspace this build has. A workspace belongs to the careers that offer it. */
function workspaceDescriptions(): Map<string, string> {
  const descriptions = new Map<string, string>();
  for (const career of CAREERS) {
    for (const workspace of career.workspaces) {
      descriptions.set(workspace.name, workspace.description);
    }
  }
  return descriptions;
}

/** Whether this build's tables still have a career of that name. */
export function isUnknownUwCareerName(name: string): boolean {
  return !CAREERS.some((career) => career.name === name);
}

/** Whether this build's tables still have an origin of that name. */
export function isUnknownUwOriginName(name: string): boolean {
  return !ORIGINS.some((origin) => origin.name === name);
}

/** Whether this build knows what a skill of that name does. */
export function isUnknownUwSkillName(name: string): boolean {
  return !skillDescriptions().has(name);
}

/**
 * The career of that name, or a placeholder wearing it.
 *
 * A placeholder rather than a throw, and a placeholder rather than a substitute: a career this
 * build has dropped is still the career the user's notes say they took, and the skills it granted
 * are on the character already. What is empty is only what a *further* draw would need — the
 * descriptors, workspaces and advancements nobody is drawing from a saved character.
 */
function careerFor(name: string): Career {
  const found = CAREERS.find((career) => career.name === name);
  return found === undefined
    ? { name, descriptors: [], workspaces: [], advancements: [], skills: [] }
    : structuredClone(found);
}

function originFor(name: string): Origin {
  const found = ORIGINS.find((origin) => origin.name === name);
  return found === undefined ? { name, descriptors: [], skills: [] } : structuredClone(found);
}

function workspaceFor(name: string, descriptions: Map<string, string>): Workspace {
  return { name, description: descriptions.get(name) ?? '' };
}

function skillFor(name: string, descriptions: Map<string, string>): Skill {
  return { name, description: descriptions.get(name) ?? '' };
}

/**
 * A stored character back into the live one the library works with.
 *
 * The character's own decisions — the stats, the descriptors, the advancement, the assets, and
 * which rows they took — come back exactly as they were stored. The rulebook's prose comes back
 * from this build's tables, which is the whole point: a description corrected today is corrected on
 * every character who ever took that skill.
 */
export function uwCharacterFromSnapshot(snapshot: UwCharacterSnapshot): UWCharacter {
  const skills = skillDescriptions();
  const workspaces = workspaceDescriptions();

  return {
    firstName: snapshot.firstName,
    lastName: snapshot.lastName,
    descriptors: snapshot.descriptors,
    stats: { ...snapshot.stats },
    careers: snapshot.careers.map((career) => careerFor(career.name)),
    origin: originFor(snapshot.origin.name),
    workspace: workspaceFor(snapshot.workspace.name, workspaces),
    skills: snapshot.skills.map((skill) => skillFor(skill.name, skills)),
    advancement: snapshot.advancement,
    assets: structuredClone(snapshot.assets),
  };
}

/**
 * The codec's reading half, with the signature the registry hands it.
 *
 * The RNG is unused, and that is the correct amount of use for it. It exists for kinds that rebuild
 * name generators; a character is finished when it is stored, and drawing anything from a seed on
 * the way back would be regenerating over the user's edits.
 */
export function uwCharacterFromSnapshotWithRng(
  snapshot: UwCharacterSnapshot,
  _rng: RNG,
): UWCharacter {
  return uwCharacterFromSnapshot(snapshot);
}
