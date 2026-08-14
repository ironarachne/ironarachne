import { roundValue } from '$lib/equipment';
import type { Rarity } from '$lib/equipment';
import type { PotionCatalogEntry, PotionCatalogVariant, PotionEffect } from './potion_types';

const RARITY_BASE_VALUES: Record<Rarity, number> = {
  common: 5000,
  uncommon: 25000,
  rare: 150000,
  epic: 750000,
  legendary: 1500000,
};

export function getRarityBaseValue(rarity: Rarity): number {
  return RARITY_BASE_VALUES[rarity];
}

export function calculateLiquidValue(
  baseValue: number,
  magnitude: number,
  variantMultiplier = 1,
): number {
  const scaled = baseValue * variantMultiplier * (magnitude / 50);
  return roundValue(Math.max(scaled, 1));
}

export function calculateHomebrewLiquidValue(rarity: Rarity, magnitude: number): number {
  return calculateLiquidValue(getRarityBaseValue(rarity), magnitude);
}

export function resolveCatalogValue(
  entry: PotionCatalogEntry,
  variant: PotionCatalogVariant | undefined,
  effect: PotionEffect,
): number {
  const baseValue = variant?.baseValue ?? entry.baseValue;
  const magnitude = effect.magnitude;
  const variantMultiplier = variant ? variant.magnitude / entry.effectTemplate.magnitude : 1;
  return calculateLiquidValue(baseValue, magnitude, variantMultiplier);
}

export function calculateTotalValue(liquidValue: number, containerValue: number): number {
  return roundValue(liquidValue + containerValue);
}

export function resolveRarity(
  entry: PotionCatalogEntry,
  variant: PotionCatalogVariant | undefined,
): Rarity {
  return variant?.rarity ?? entry.rarity;
}
