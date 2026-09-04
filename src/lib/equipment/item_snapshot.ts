/**
 * Writing an item for storage, and reading one back.
 *
 * **The composition is stored, not just the prose.** #66 asks for this explicitly and
 * `docs/readiness-objects.md` settles it: an item's material, refinement, enchantment and
 * decoration are composed at generation time, and `generateDescription` folds all four into one
 * paragraph. Storing only the paragraph would leave an editor able to rewrite prose and nothing
 * else — a user could not change what an item is made of, only what it says it is made of.
 *
 * That is a departure from the treatment the pass gives species, archetypes and drug types, which
 * are stored by name and resolved on read. The reason it is right here and wrong there: those are
 * table rows a payload *refers* to, where an item's four parts have already been **applied** — the
 * material's multipliers are baked into the weight and the value, the enchantment's bonus damage
 * into the combat profile. The record is what was applied, which a name could not tell you after
 * the table changed, and it is a decision the user may edit.
 *
 * **What is not stored, and why.** `allowedMaterialTypes` is the base type's list of materials the
 * generator was allowed to draw from, `manualVolume` is unset by every path that makes an item, and
 * `containerId` belongs to a container that is not part of this artifact. All three are inputs to
 * generation or to something else's bookkeeping rather than facts about the item a user keeps.
 *
 * **`weaponType` and `armorType` are not stored either**, and this is the one place the name
 * treatment does apply: everything the page shows from them is already a field of its own —
 * `itemMinorType` is the type's name, the armour's defence is in the combat profile, and the
 * weapon's attacks are in `actions`. Keeping the row whole would copy a table into every sword.
 */

import type {
  CombatAction,
  CombatProfile,
  DamageType as CombatDamageType,
} from '$lib/combat_system';
import { withLegacyItemMechanics, type MechanicsSet } from '$lib/rulesets';

import type {
  DensityCategory,
  Decoration,
  Enchantment,
  Item,
  Material,
  Rarity,
  Refinement,
} from './equipment_types';

/**
 * An item as the generator hands it over.
 *
 * `generateItem` returns an `Item`, a `Weapon` or an `Armor`, and only the weapon carries
 * `actions`. Naming that here is what lets `toItemSnapshot` read the attacks without a cast at
 * every call site.
 */
export type RolledItem = Item & { actions?: CombatAction[] };

/**
 * An item as it is stored.
 *
 * The live shape minus what generation used to build it. It is also the shape the editor and the
 * presentation both work in, so a saved item and a rolled one are read by the same code.
 */
export type ItemSnapshot = {
  id: string;
  name: string;
  uniqueName?: string;
  itemMajorType: string;
  itemMinorType?: string;
  description: string;
  value: number;
  rarity: Rarity;
  densityCategory: DensityCategory;
  weight: number;
  properties: string[];
  mechanics: MechanicsSet;
  combatProfile?: CombatProfile;
  /** A weapon's attacks. Absent on armour and on anything else. */
  actions?: CombatAction[];
  material?: Material;
  refinement?: Refinement;
  enchantment?: Enchantment;
  decoration?: Decoration;
};

/** Every rarity, in ascending order, for a validator and for an editor's select. */
export const ITEM_RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

/** Every density category, for the same two readers. */
export const ITEM_DENSITY_CATEGORIES: DensityCategory[] = ['dense', 'standard', 'bulky', 'airy'];

/** What an item with no rarity is read as. */
export const DEFAULT_ITEM_RARITY: Rarity = 'common';

/** What an item with no density is read as. */
export const DEFAULT_ITEM_DENSITY: DensityCategory = 'standard';

export function toItemSnapshot(item: RolledItem): ItemSnapshot {
  return withLegacyItemMechanics(
    {
      id: item.id,
      name: item.name,
      ...(item.uniqueName === undefined ? {} : { uniqueName: item.uniqueName }),
      itemMajorType: item.itemMajorType,
      ...(item.itemMinorType === undefined ? {} : { itemMinorType: item.itemMinorType }),
      description: item.description,
      value: item.value,
      rarity: item.rarity,
      densityCategory: item.densityCategory,
      weight: item.weight,
      properties: [...item.properties],
      ...(item.combatProfile === undefined ? {} : { combatProfile: { ...item.combatProfile } }),
      ...(item.actions === undefined ? {} : { actions: item.actions.map(copyAction) }),
      ...(item.material === undefined ? {} : { material: { ...item.material } }),
      ...(item.refinement === undefined ? {} : { refinement: { ...item.refinement } }),
      ...(item.enchantment === undefined ? {} : { enchantment: { ...item.enchantment } }),
      ...(item.decoration === undefined ? {} : { decoration: { ...item.decoration } }),
    },
    'generated',
  ) as ItemSnapshot;
}

function copyAction(action: CombatAction): CombatAction {
  return {
    ...action,
    ...(action.bonusDamage === undefined
      ? {}
      : {
          bonusDamage: action.bonusDamage.map((damage) => ({
            power: damage.power,
            type: damage.type as CombatDamageType,
          })),
        }),
  };
}

/**
 * Nothing is recomputed on read.
 *
 * A stored item is finished, and rebuilding its value from the material's multiplier would
 * overwrite whatever the user changed — requirement 4.2 exactly. The copy is deep enough that an
 * editor mutating what it was handed cannot reach back into the store's own record.
 */
export function itemFromSnapshot(snapshot: ItemSnapshot): ItemSnapshot {
  return toItemSnapshot(snapshot);
}

/** The codec's reading half, with the signature the registry hands it. The RNG is unused. */
export function itemFromSnapshotWithRng(snapshot: ItemSnapshot, _rng: unknown): ItemSnapshot {
  return itemFromSnapshot(snapshot);
}
