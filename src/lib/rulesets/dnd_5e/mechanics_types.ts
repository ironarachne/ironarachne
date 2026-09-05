export const DND_5E_DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
] as const;
export type Dnd5eDamageType = (typeof DND_5E_DAMAGE_TYPES)[number];

export type Dnd5eSavingThrows = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export type Dnd5eActorMechanics = {
  armorClass: number;
  hitPoints: number;
  proficiencyBonus: number;
  savingThrows: Dnd5eSavingThrows;
};

export const DND_5E_RARITIES = ['common', 'uncommon', 'rare', 'very-rare', 'legendary'] as const;
export type Dnd5eRarity = (typeof DND_5E_RARITIES)[number];

export const DND_5E_VALUABLE_CATEGORIES = [
  'coin',
  'gem',
  'jewelry',
  'art-object',
  'trade-good',
  'other',
] as const;
export type Dnd5eValuableCategory = (typeof DND_5E_VALUABLE_CATEGORIES)[number];

export type Dnd5eItemBase = {
  valueCopper: number;
  magical: boolean;
  rarity?: Dnd5eRarity;
  requiresAttunement?: boolean;
};

export type Dnd5eWeaponMechanics = Dnd5eItemBase & {
  kind: 'weapon';
  damage: string;
  damageType: Dnd5eDamageType;
  properties: string[];
};

export type Dnd5eArmorMechanics = Dnd5eItemBase & {
  kind: 'armor';
  armorClass: number;
  maximumDexterityBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
};

export type Dnd5eValuableMechanics = Dnd5eItemBase & {
  kind: 'valuable';
  category: Dnd5eValuableCategory;
};

export type Dnd5eItemMechanics =
  | Dnd5eWeaponMechanics
  | Dnd5eArmorMechanics
  | Dnd5eValuableMechanics;

type Dnd5eTreasureValueRange = {
  minimumValueCopper: number;
  maximumValueCopper: number;
  magical?: boolean;
  rarity?: Dnd5eRarity;
  requiresAttunement?: boolean;
};

/** The future hoard tables own selection; this context carries their selected result. */
export type Dnd5eTreasureItemContext =
  | (Dnd5eTreasureValueRange & {
      kind: 'valuable';
      category: Dnd5eValuableCategory;
    })
  | (Dnd5eTreasureValueRange & Omit<Dnd5eWeaponMechanics, keyof Dnd5eItemBase>)
  | (Dnd5eTreasureValueRange & Omit<Dnd5eArmorMechanics, keyof Dnd5eItemBase>);
