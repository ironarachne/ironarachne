import * as RNG from '@ironarachne/rng';
import type ADNDClass from './adndclass.js';
import type ADNDWeapon from './adndweapon.js';

export type NonweaponByClassGroup = Record<string, string[]>;

/** Curated nonweapon proficiency names by class group (PHB-style). */
export const nonweaponOptionsByClassGroup: NonweaponByClassGroup = {
  priest: [
    'Agriculture',
    'Animal handling',
    'Astrology',
    'Carpentry',
    'Herbalism',
    'Hunting',
    'Languages (extra)',
    'Local history',
    'Religion',
    'Rope use',
    'Survival',
    'Swimming',
    'Teaching',
    'Weather sense',
  ],
  warrior: [
    'Animal handling',
    'Armorer',
    'Blacksmithing',
    'Bowyer/fletcher',
    'Fishing',
    'Hunting',
    'Mountaineering',
    'Navigation',
    'Riding (land)',
    'Rope use',
    'Survival',
    'Swimming',
    'Tracking',
    'Weaponsmithing',
  ],
  rogue: [
    'Ancient history',
    'Appraising',
    'Blind-fighting',
    'Disguise',
    'Etiquette',
    'Forgery',
    'Gambling',
    'Jumping',
    'Local history',
    'Mountaineering',
    'Riding (land)',
    'Rope use',
    'Tightrope walking',
    'Tumbling',
  ],
  wizard: [
    'Ancient history',
    'Astrology',
    'Engineering',
    'Etiquette',
    'Fire-building',
    'Heraldry',
    'Herbalism',
    'Languages (extra)',
    'Local history',
    'Mountaineering',
    'Navigation',
    'Reading/writing (extra languages)',
    'Religion',
    'Spellcraft',
  ],
};

const WEAPON_NAME_ALIASES: Record<string, string> = {
  'hand crossbow': 'crossbow, hand',
  staff: 'quarterstaff',
  lasso: 'whip',
};

/**
 * Map from equipment weapon `name` (lowercase) to `category` for lookup from class `allowedWeapons` names.
 */
export function buildWeaponNameToCategory(weapons: ADNDWeapon[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const w of weapons) {
    m.set(w.name.toLowerCase(), w.category);
  }
  return m;
}

function categoryForClassWeaponToken(
  token: string,
  nameToCategory: Map<string, string>,
): string | undefined {
  const t = token.toLowerCase();
  if (nameToCategory.has(t)) {
    return nameToCategory.get(t);
  }
  const alias = WEAPON_NAME_ALIASES[t];
  if (alias && nameToCategory.has(alias.toLowerCase())) {
    return nameToCategory.get(alias.toLowerCase());
  }
  return undefined;
}

/**
 * Eligible weapon proficiency groups (matches `ADNDWeapon.category`) for this class.
 */
export function getEligibleWeaponGroups(cls: ADNDClass, allWeapons: ADNDWeapon[]): string[] {
  const nameToCategory = buildWeaponNameToCategory(allWeapons);
  if (cls.allowedWeapons.includes('any')) {
    return uniqueCategoriesFromWeapons(allWeapons);
  }

  if (cls.allowedWeapons.includes('bludgeoning')) {
    return uniqueSorted(
      allWeapons.filter((w) => w.damageType.includes('bludgeoning')).map((w) => w.category),
    );
  }

  const groups: string[] = [];
  for (const token of cls.allowedWeapons) {
    const c = categoryForClassWeaponToken(token, nameToCategory);
    if (c) {
      groups.push(c);
    }
  }
  return uniqueSorted(groups);
}

function uniqueCategoriesFromWeapons(weapons: ADNDWeapon[]): string[] {
  return uniqueSorted(weapons.map((w) => w.category));
}

function uniqueSorted(categories: string[]): string[] {
  return Array.from(new Set(categories)).sort();
}

/**
 * Picks `initialWP` weapon groups: first group matches `equippedWeapon.category` when it is in `eligible`, otherwise a random group from `eligible`.
 * Remaining slots prefer unused groups, then allow repeats.
 */
export function selectWeaponProficiencyGroups(
  initialWp: number,
  eligible: string[],
  preferredCategory: string | undefined,
  rng: RNG.RNG,
): string[] {
  if (initialWp < 1 || eligible.length === 0) {
    return [];
  }

  const out: string[] = [];
  if (preferredCategory && eligible.includes(preferredCategory)) {
    out.push(preferredCategory);
  } else {
    out.push(rng.item(eligible));
  }

  for (let i = 1; i < initialWp; i++) {
    const used = new Set(out);
    const notUsed = eligible.filter((g) => !used.has(g));
    if (notUsed.length > 0) {
      out.push(rng.item(notUsed));
    } else {
      out.push(rng.item(eligible));
    }
  }

  return out;
}

/**
 * Picks up to `count` nonweapon proficiencies, no duplicates, from the list for this class `group`.
 * Falls back to a merged list if the group is missing.
 */
export function selectNonweaponProficiencies(
  classGroup: string,
  count: number,
  rng: RNG.RNG,
  options: NonweaponByClassGroup = nonweaponOptionsByClassGroup,
): string[] {
  if (count < 1) {
    return [];
  }

  let list = options[classGroup];
  if (!list || list.length === 0) {
    list = uniqueSorted(Object.values(options).flat());
  }
  if (list.length === 0) {
    return [];
  }

  const shuffled = rng.shuffle([...list]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
