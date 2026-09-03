/**
 * The single path from a seed to an item, and the record of how it was rolled.
 *
 * `generateItem` was already a pure function of seed and config — this library is the rare one in
 * the pass where requirement 2.2 was met by the generator and broken only by the page around it.
 * `EquipmentGenerator.svelte` drew each new seed from `new RNG(Date.now())` and, worse, called
 * `rng.setSeed(seed)` inside an `$effect`, so typing in the seed field reseeded the page's own
 * stream: the next press produced a seed that depended on the previous one's text. Pressing
 * Generate draws a fresh seed from the page's RNG now, and the roll is this function.
 *
 * **A page press rolls a list; an artifact is one item.** The kind is `item` and each card is
 * saved on its own, so each needs a seed that reproduces *that* item rather than the list it came
 * in. `itemSeed` is the derivation, and it is public because the page and a re-roll both need to
 * agree on it.
 *
 * `getDefaultGenerationConfig` does not read the clock, contrary to the blanket note in
 * `docs/tool-readiness.md` about fifteen `getDefault*Config` helpers. It builds four tables from
 * module constants and takes no RNG at all.
 */

import { generateItem, getDefaultGenerationConfig } from './generation.js';
import type { EquipmentGenerationConfig } from './generation.js';
import { toItemSnapshot, type ItemSnapshot, type RolledItem } from './item_snapshot.js';

/** What the item generator's major-type control offers. */
export const ITEM_MAJOR_TYPE_CHOICES = ['any', 'weapon', 'armor'] as const;

export type ItemMajorTypeChoice = (typeof ITEM_MAJOR_TYPE_CHOICES)[number];

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's four controls
 * that change the item, and not the fifth: the display system chooses between D&D dice and this
 * site's own numbers for the *same* rolled item, so it is a reading preference rather than part of
 * the roll.
 */
export type EquipmentGeneratorConfigRecord = {
  itemMajorType: ItemMajorTypeChoice;
  useRefine: boolean;
  useEnchant: boolean;
  useDecorate: boolean;
};

/** The settings a page opens on, and what an unreadable provenance record falls back to. */
export function defaultEquipmentGeneratorConfig(): EquipmentGeneratorConfigRecord {
  return { itemMajorType: 'any', useRefine: true, useEnchant: true, useDecorate: true };
}

function isMajorTypeChoice(value: unknown): value is ItemMajorTypeChoice {
  return (
    typeof value === 'string' && (ITEM_MAJOR_TYPE_CHOICES as readonly string[]).includes(value)
  );
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * Anything unrecognisable falls back to the default rather than being coerced: a config written by
 * a build that spelled these differently should re-roll the ordinary way, not from a field it
 * misread.
 */
export function readEquipmentGeneratorConfig(
  config: Record<string, unknown>,
): EquipmentGeneratorConfigRecord {
  const defaults = defaultEquipmentGeneratorConfig();
  return {
    itemMajorType: isMajorTypeChoice(config.itemMajorType)
      ? config.itemMajorType
      : defaults.itemMajorType,
    useRefine: typeof config.useRefine === 'boolean' ? config.useRefine : defaults.useRefine,
    useEnchant: typeof config.useEnchant === 'boolean' ? config.useEnchant : defaults.useEnchant,
    useDecorate:
      typeof config.useDecorate === 'boolean' ? config.useDecorate : defaults.useDecorate,
  };
}

/** The settings as the whole generation config the library's own roller takes. */
export function toEquipmentGenerationConfig(
  config: EquipmentGeneratorConfigRecord,
): EquipmentGenerationConfig {
  const full = getDefaultGenerationConfig();
  full.itemMajorType = config.itemMajorType;
  full.useRefine = config.useRefine;
  full.useEnchant = config.useEnchant;
  full.useDecorate = config.useDecorate;
  return full;
}

/**
 * The seed of the nth item of a press.
 *
 * One press produces a list from one seed, and each item needs its own so that saving the third
 * sword records a seed that rolls the third sword. Derived rather than drawn, so the whole list is
 * still a pure function of the one seed the user sees.
 */
export function itemSeed(seed: string, index: number): string {
  return `${seed}-item-${index}`;
}

/** Roll one item — the one path the generator page and a re-roll both take. */
export function rollItem(seed: string, config: EquipmentGeneratorConfigRecord): RolledItem {
  return generateItem(seed, toEquipmentGenerationConfig(config));
}

/**
 * Roll a fresh item as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollItemSnapshot(
  seed: string,
  config: EquipmentGeneratorConfigRecord,
): ItemSnapshot {
  return toItemSnapshot(rollItem(seed, config));
}

/** One press: `count` items, each from its own derived seed. */
export function rollItems(
  seed: string,
  count: number,
  config: EquipmentGeneratorConfigRecord,
): RolledItem[] {
  const generationConfig = toEquipmentGenerationConfig(config);
  const items: RolledItem[] = [];
  for (let index = 0; index < count; index++) {
    items.push(generateItem(itemSeed(seed, index), generationConfig));
  }
  return items;
}
