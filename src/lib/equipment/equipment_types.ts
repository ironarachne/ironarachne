export type Armor = Item & {
  defense: number; // e.g., AC bonus
  armorType: ArmorCategory;
}

export type ArmorCategory = 'light' | 'medium' | 'heavy';

export type ArmorType = {
  name: string;
  defense: number;
  armorType: ArmorCategory;
  description: string;
}

export type Container = Item & {
  capacity: number;
  isOpen: boolean;
  contents: string[]; // Array of item IDs
  lock?: Lock;
}

export type ContainerType = {
  name: string;
  defaultCapacity: number;
  description: string;
  canBeLocked: boolean;
}

export type DamageType = 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold' | 'electricity' | 'poison' | 'acid' | 'darkness' | 'light' | 'earth' | 'water' | 'wind';

export type Item = {
  id: string;
  name: string;
  description: string;
  value: ItemValue;
  rarity: Rarity;
  properties: string[];
}

export type ItemValue = number; // Monetary value in copper coins

export type Lock = Item & {
  lockType: 'mechanical' | 'magical';
  difficulty: number; // Difficulty level from 1 to 10
  isLocked: boolean;
}

export type LockKey = {
  id: string;
  name: string;
  description: string;
  keyType: 'mechanical' | 'magical';
  locks: string[]; // Array of lock IDs this key can open
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Weapon = Item & {
  damage: string; // e.g., "1d8"
  damageType: DamageType;
  weaponType: 'melee' | 'ranged';
  range?: number; // Only for ranged weapons
  hands: number; // Number of hands required to wield
}

export type WeaponType = {
  name: string;
  damage: string;
  damageType: DamageType;
  weaponType: 'melee' | 'ranged';
  range?: number;
  hands: number;
  description: string;
}
