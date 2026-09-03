/**
 * The single path from a seed to a magic weapon, and the record of how it was rolled.
 *
 * `/fantasy/weapon` is `/fantasy/equipment-generator` with the major type fixed and the
 * enchantment and decoration tables narrowed to one religious domain — which is why the two share
 * the kind `item`, per decision 1 of docs/readiness-objects.md, and why they need two roll modules
 * rather than one. Their controls are different: this tool asks for a theme and a range category,
 * that one asks for a major type and three switches.
 *
 * **The `$lib/weapons` question the issue raises answers itself, and the answer is in this file's
 * absence of an import.** `WeaponGenerator.svelte` never imported that library — it uses
 * `$lib/equipment` and `domains` from `$lib/religion`. The only importer of `$lib/weapons` anywhere
 * is `$lib/arms_manufacturer`, which is tagged `scifi` already. Nothing science-fictional is
 * reachable from this route, so the `fantasy` tag is right as it stands and the sci-fi code is not
 * dead, it belongs to another tool.
 *
 * **The theme is resolved from the seed and then recorded**, rather than drawn from the page's own
 * stream. The page drew a random domain from its RNG when the control read "any", which made the
 * roll depend on something the provenance did not record — requirement 2.2 failing one level up
 * from the usual place. What is stored is the domain that was actually used, which is what 3.6 asks
 * for and what `character_roll.ts` does with its own resolved values.
 *
 * **The domain list is a parameter, not an import.** `$lib/religion` reaches `$lib/characters`,
 * which reaches `$lib/archetypes`, which reaches back here for its equipment configs — so importing
 * religion from this file is a cycle, and the symptom is every archetype table coming back
 * `undefined` at module load in seventeen unrelated test files. The caller passes the names in; this
 * module never needs to know where they came from.
 */

import { RNG } from '@ironarachne/rng';

import { DECORATIONS } from './decorations.js';
import { filterDecorationsByTags } from './decorator.js';
import { ENCHANTMENTS } from './enchantments.js';
import { filterEnchantmentsByTags } from './enchanter.js';
import { generateItem, getDefaultGenerationConfig } from './generation.js';
import type { EquipmentGenerationConfig } from './generation.js';
import { toItemSnapshot, type ItemSnapshot, type RolledItem } from './item_snapshot.js';

/** The tool path whose provenance this module reads. */
export const WEAPON_TOOL_PATH = '/fantasy/weapon';

/** The generator's own value for "let the seed choose", in both of its selects. */
export const WEAPON_ANY = 'any' as const;

/** What the range-category control offers. */
export const WEAPON_RANGE_CHOICES = ['any', 'melee', 'ranged'] as const;

export type WeaponRangeChoice = (typeof WEAPON_RANGE_CHOICES)[number];

/**
 * What the generator records about how it rolled, and what a re-roll reads back.
 *
 * Stated as a type so the two ends — what is written as provenance and what a re-roll expects to
 * find — are in one place and drift loudly instead of quietly. It is the page's two selects.
 */
export type WeaponGeneratorConfigRecord = {
  /** A religious domain by name, or `any` to let the seed choose one. */
  theme: string;
  rangeCategory: WeaponRangeChoice;
};

/** The settings a page opens on, and what an unreadable provenance record falls back to. */
export function defaultWeaponGeneratorConfigRecord(): WeaponGeneratorConfigRecord {
  return { theme: WEAPON_ANY, rangeCategory: WEAPON_ANY };
}

function isRangeChoice(value: unknown): value is WeaponRangeChoice {
  return typeof value === 'string' && (WEAPON_RANGE_CHOICES as readonly string[]).includes(value);
}

/**
 * Read a stored provenance config back into the settings a roll needs.
 *
 * A theme this build no longer has is kept rather than dropped: it still narrows the enchantment
 * tables by tag, and the tag may outlive the domain that named it. What a re-roll does with a theme
 * that matches nothing is `resolveWeaponTheme`'s business.
 */
export function readWeaponGeneratorConfig(
  config: Record<string, unknown>,
): WeaponGeneratorConfigRecord {
  const defaults = defaultWeaponGeneratorConfigRecord();
  return {
    theme: typeof config.theme === 'string' && config.theme !== '' ? config.theme : defaults.theme,
    rangeCategory: isRangeChoice(config.rangeCategory)
      ? config.rangeCategory
      : defaults.rangeCategory,
  };
}

/**
 * The domain a roll themes on: the one asked for, or one drawn from the seed.
 *
 * Derived from the seed rather than from the page's own stream, and the caller records what comes
 * back — so a saved weapon's provenance names a concrete domain and a re-roll needs no domain list
 * at all. That was the second half of this tool's 2.2 failure and the harder half to see: the seed
 * control worked, and the theme behind it did not come from the seed.
 *
 * An `any` that reaches a roll anyway — an older provenance, or an empty list — means no tag
 * filter, which is the honest reading of "any theme" and is what `toWeaponGenerationConfig` does
 * with it.
 */
export function resolveWeaponTheme(seed: string, theme: string, themes: string[]): string {
  if (theme !== WEAPON_ANY) {
    return theme;
  }
  return themes.length === 0 ? WEAPON_ANY : new RNG(`${seed}-theme`).item(themes);
}

/** The settings as the whole generation config the library's own roller takes. */
export function toWeaponGenerationConfig(
  config: WeaponGeneratorConfigRecord,
): EquipmentGenerationConfig {
  const full = getDefaultGenerationConfig();

  full.itemMajorType = 'weapon';
  // `any` means no tag filter: the whole table, which is what "any theme" says.
  if (config.theme !== WEAPON_ANY) {
    full.enchantments = filterEnchantmentsByTags([config.theme], ENCHANTMENTS);
    full.decorations = filterDecorationsByTags([config.theme], DECORATIONS);
  }
  full.enchantmentChance = 100;
  full.decorationChance = 100;
  full.useUniqueNames = true;
  if (config.rangeCategory !== WEAPON_ANY) {
    full.weaponRangeCategory = config.rangeCategory;
  }

  return full;
}

/**
 * Roll a magic weapon — the one path the generator page and a re-roll both take.
 *
 * The config's theme is the one that was used, not the one that was asked for: the page resolves
 * `any` before it rolls and records what came back.
 */
export function rollWeapon(seed: string, config: WeaponGeneratorConfigRecord): RolledItem {
  return generateItem(seed, toWeaponGenerationConfig(config));
}

/**
 * Roll a fresh weapon as a snapshot — the destructive half of editing (requirement 4.3), and what
 * `ARTIFACT_EDITORS` reaches for when an `item`'s provenance names this tool.
 */
export function rollWeaponSnapshot(
  seed: string,
  config: WeaponGeneratorConfigRecord,
): ItemSnapshot {
  return toItemSnapshot(rollWeapon(seed, config));
}
