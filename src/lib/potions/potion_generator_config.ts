import type { ContainerGeneratorConfig, Rarity } from '$lib/equipment/equipment_types';
import type { PotionCatalogEntry, PotionForm } from './potion_types';

export type PotionGeneratorConfig = {
  allowedCatalogIds?: string[];
  allowedRarities?: Rarity[];
  allowedForms?: PotionForm[];
  allowHomebrew: boolean;
  allowProceduralNames: boolean;
  containerConfig: ContainerGeneratorConfig;
};

export function getDefaultPotionConfig(): PotionGeneratorConfig {
  return {
    allowHomebrew: false,
    allowProceduralNames: false,
    containerConfig: {
      allowLockedContainers: false,
      allowUnlockedContainers: true,
      onlyLiquidContainers: true,
    },
  };
}

export function filterCatalogEntries(
  entries: PotionCatalogEntry[],
  config: PotionGeneratorConfig,
): PotionCatalogEntry[] {
  return entries.filter((entry) => matchesCatalogFilters(entry, config));
}

function matchesCatalogFilters(entry: PotionCatalogEntry, config: PotionGeneratorConfig): boolean {
  if (config.allowedCatalogIds?.length && !config.allowedCatalogIds.includes(entry.id)) {
    return false;
  }
  if (config.allowedRarities?.length && !config.allowedRarities.includes(entry.rarity)) {
    return false;
  }
  if (config.allowedForms?.length && !config.allowedForms.includes(entry.form)) {
    return false;
  }
  return true;
}
