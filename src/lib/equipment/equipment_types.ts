import type { Element, MagicSphere, MagicIntent } from '../magic';
import type { CombatProfile } from '$lib/combat_system/types';

export type Armor = Item & {
  defense: number; // e.g., AC bonus
  armorType: ArmorCategory;
};

export type ArmorCategory = 'light' | 'medium' | 'heavy';

export type ArmorType = {
  name: string;
  defense: number;
  armorType: ArmorCategory;
  description: string;
};

export type Container = Item & {
  maxWeight: number;
  maxVolume: number;
  currentWeight: number;
  currentVolume: number;
  isOpen: boolean;
  contents: string[]; // Array of item IDs
  lock?: Lock;
};

export type ContainerFilter = {
  minWeight?: number;
  maxWeight?: number;
  minVolume?: number;
  maxVolume?: number;
  canBeLocked?: boolean;
  canHoldItems?: boolean;
  canHoldLiquid?: boolean;
};

export type ContainerGeneratorConfig = {
  allowedContainerTypes?: ContainerType[];
  allowLockedContainers: boolean;
  allowUnlockedContainers: boolean;
  minWeightCapacity?: number;
  maxWeightCapacity?: number;
  minVolumeCapacity?: number;
  maxVolumeCapacity?: number;
  onlyItemContainers?: boolean;
  onlyLiquidContainers?: boolean;
};

export type ContainerType = {
  canBeLocked: boolean;
  canHoldLiquid: boolean;
  canHoldItems: boolean;
  defaultVolume: number;
  defaultWeight: number;
  description: string;
  name: string;
  value: number;
  weight: number;
};

export type ContainerVariation = {
  descriptionSuffix?: string;
  namePrefix?: string;
  nameSuffix?: string;
  volumeCapacityModifier?: number; // Multiplier
  weightCapacityModifier?: number; // Multiplier
  weightModifier?: number; // Multiplier
};

export type DamageType =
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'fire'
  | 'cold'
  | 'electricity'
  | 'poison'
  | 'acid'
  | 'darkness'
  | 'light'
  | 'earth'
  | 'water'
  | 'wind';

export type DensityCategory = 'dense' | 'standard' | 'bulky' | 'airy';

export const DENSITY_MAP: Record<DensityCategory, number> = {
  dense: 8.0,
  standard: 1.0,
  bulky: 0.3,
  airy: 0.05,
};

export type Item = {
  id: string;
  name: string;
  itemMajorType: string;
  itemMinorType?: string;
  description: string;
  value: ItemValue;
  rarity: Rarity;
  densityCategory: DensityCategory;
  manualVolume?: number; // Volume in liters, if manually specified
  weight: number; // Weight in kg
  properties: string[];
  containerId?: string; // The ID of the container holding this item
  combatProfile?: CombatProfile;
};

export type ItemValue = number; // Monetary value in copper coins

export type Lock = Item & {
  lockType: LockType;
  difficulty: number; // Difficulty level from 1 to 10
  isLocked: boolean;
};

export type LockGeneratorConfig = {
  allowedLockTypes?: LockType[];
  minDifficulty?: number;
  maxDifficulty?: number;
  chanceOfBeingLocked?: number; // 0 to 1
};

export type LockKey = {
  id: string;
  name: string;
  description: string;
  keyType: 'mechanical' | 'magical';
  locks: string[]; // Array of lock IDs this key can open
};

export type LockType = 'mechanical' | 'magical';

export type Material = {
  readonly name: string;
  readonly majorType: string;
  readonly minorType?: string;
  readonly densityCategory: DensityCategory;
  readonly weightMultiplier: number;
  readonly valueMultiplier: number;
  readonly rarity: Rarity;
  readonly statOffsets?: Record<string, number | string>;
  readonly tagsAdded?: string[];
};

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Weapon = Item & {
  damage: string; // e.g., "1d8"
  damageType: DamageType;
  additionalDamage?: { damage: string; type: DamageType }[];
  weaponType: 'melee' | 'ranged';
  range?: number; // Only for ranged weapons
  hands: number; // Number of hands required to wield
};

export type WeaponType = {
  name: string;
  damage: string;
  damageType: DamageType;
  weaponType: 'melee' | 'ranged';
  range?: number;
  hands: number;
  description: string;
};

export type Refinement = {
  name: string;
  description: string;
  weightMultiplier?: number;
  valueMultiplier?: number;
  statOffsets?: Record<string, number | string>;
  tagsAdded?: string[];
  tagsRequired?: string[];
  tagsExcluded?: string[];
};

export type Enchantment = {
  name: string;
  description: string;
  elements: Element[];
  spheres: MagicSphere[];
  intent: MagicIntent;
  magnitude: number;
  valueMultiplier?: number;
  valueAdder?: number;
  statOffsets?: Record<string, number | string>;
  additionalDamage?: string;
  additionalDamageType?: DamageType;
  tagsAdded?: string[];
  tagsRequired?: string[];
  tagsExcluded?: string[];
};

export type Decoration = {
  name: string;
  description: string;
  valueMultiplier?: number;
  tagsAdded?: string[];
  tagsRequired?: string[];
  tagsExcluded?: string[];
};
