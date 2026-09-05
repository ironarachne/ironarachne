export const ADND_2E_DAMAGE_TYPES = ['bludgeoning', 'piercing', 'slashing'] as const;
export type Adnd2eDamageType = (typeof ADND_2E_DAMAGE_TYPES)[number];

export type Adnd2eSavingThrows = {
  paralyzationPoisonDeath: number;
  rodStaffWand: number;
  petrificationPolymorph: number;
  breathWeapon: number;
  spell: number;
};

export type Adnd2eActorMechanics = {
  armorClass: number;
  thaco: number;
  hitPoints: number;
  savingThrows: Adnd2eSavingThrows;
};

export type Adnd2eWeaponMechanics = {
  kind: 'weapon';
  valueCopper: number;
  damageType: Adnd2eDamageType;
  damageSmallMedium: string;
  damageLarge: string;
  speedFactor: number;
};

export type Adnd2eArmorMechanics = {
  kind: 'armor';
  valueCopper: number;
  armorClass: number;
};

export const ADND_2E_VALUABLE_CATEGORIES = [
  'coin',
  'gem',
  'jewelry',
  'art-object',
  'trade-good',
  'other',
] as const;
export type Adnd2eValuableCategory = (typeof ADND_2E_VALUABLE_CATEGORIES)[number];

export type Adnd2eValuableMechanics = {
  kind: 'valuable';
  category: Adnd2eValuableCategory;
  valueCopper: number;
  magical: boolean;
};

export type Adnd2eItemMechanics =
  | Adnd2eWeaponMechanics
  | Adnd2eArmorMechanics
  | Adnd2eValuableMechanics;

/**
 * The hoard generator owns table selection; this context carries the result across the package
 * boundary. A range makes the package's final value roll deterministic through the supplied RNG.
 */
export type Adnd2eTreasureItemContext =
  | {
      kind: 'valuable';
      category: Adnd2eValuableCategory;
      minimumValueCopper: number;
      maximumValueCopper: number;
      magical?: boolean;
    }
  | (Omit<Adnd2eWeaponMechanics, 'valueCopper'> & {
      minimumValueCopper: number;
      maximumValueCopper: number;
    })
  | (Omit<Adnd2eArmorMechanics, 'valueCopper'> & {
      minimumValueCopper: number;
      maximumValueCopper: number;
    });
