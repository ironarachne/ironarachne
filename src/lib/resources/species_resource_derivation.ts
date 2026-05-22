import allSpecies from '$lib/species/all';
import type { CarcassBodyPlan } from '$lib/species/carcass_body_plan';
import type Species from '$lib/species/species';
import type { Resource } from './resource_types';
import {
  SPECIES_PRODUCT_OVERRIDES,
  type SpeciesProductOverride,
} from './species_product_overrides';

const RESOURCE_DERIVABLE_TAG = 'resource_derivable';

const EXCLUDED_CREATURE_TYPES = new Set(['undead', 'ooze', 'elemental', 'fiend']);
const ALLOWED_CREATURE_TYPES = new Set(['beast', 'dragon', 'monstrosity']);

export type { CarcassBodyPlan } from '$lib/species/carcass_body_plan';

function collectPhysicalTraitTagSet(species: Species): Set<string> {
  const out = new Set<string>();
  for (const config of species.physicalTraitGeneratorConfigs) {
    for (const t of config.tags) {
      out.add(t);
    }
  }
  return out;
}

/**
 * Infers furred / avian / scaled / chitin from physical traits and optional species tags.
 * `Species.carcassBodyPlan` wins when the default guess would be wrong (e.g. owlbear).
 */
export function inferCarcassBodyPlan(species: Species): CarcassBodyPlan {
  if (species.carcassBodyPlan) {
    return species.carcassBodyPlan;
  }
  if (species.tags.includes('insect') || species.tags.includes('arachnid')) {
    return 'chitinous';
  }
  const traitTags = collectPhysicalTraitTagSet(species);
  const hasFur = traitTags.has('fur') || traitTags.has('hair');
  const hasFeathers = traitTags.has('feathers');
  const hasScales = traitTags.has('scales');
  if (hasFeathers && hasFur) {
    return 'furred';
  }
  if (hasFeathers) {
    return 'feathered';
  }
  if (hasScales) {
    return 'scaled';
  }
  if (hasFur) {
    return 'furred';
  }
  return 'furred';
}

function isHumanoidOnly(species: Species): boolean {
  return species.creatureTypes.includes('humanoid') && !species.creatureTypes.includes('beast');
}

/**
 * Beasts and monstrosities may yield carcass resources; undead, oozes, elementals, and fiends do not.
 * Humanoid-only species are excluded unless tagged `resource_derivable`.
 */
export function speciesYieldsCarcassResources(species: Species): boolean {
  if (species.creatureTypes.some((t) => EXCLUDED_CREATURE_TYPES.has(t))) {
    return false;
  }
  if (isHumanoidOnly(species)) {
    return species.tags.includes(RESOURCE_DERIVABLE_TAG);
  }
  return species.creatureTypes.some((t) => ALLOWED_CREATURE_TYPES.has(t));
}

function mergeProductOverrides(species: Species): SpeciesProductOverride {
  const fromMap = SPECIES_PRODUCT_OVERRIDES[species.breedType] ?? {};
  const fromSpecies = species.resourceProductNames ?? {};
  return { ...fromMap, ...fromSpecies };
}

function hasHornsOrAntlers(species: Species): boolean {
  const traitTags = collectPhysicalTraitTagSet(species);
  return traitTags.has('horns') || traitTags.has('antlers');
}

function commonalityForSpecies(species: Species): number {
  return Math.min(10, species.commonality);
}

function meatResourceName(
  adjective: string,
  overrides: SpeciesProductOverride,
  minorType: string,
): Resource {
  const name = overrides.meat ?? `${adjective} meat`;
  return {
    name,
    description: `Raw carcass meat from a ${adjective} animal, used for food and preservation.`,
    major_type: 'organic',
    minor_type: minorType,
    is_refineable: false,
    properties: [],
    commonality: 0,
  };
}

function buildResourcesForPlan(
  species: Species,
  plan: CarcassBodyPlan,
  overrides: SpeciesProductOverride,
): Resource[] {
  const adj = species.adjective;
  const c = commonalityForSpecies(species);
  const withCommon = (r: Resource): Resource => ({ ...r, commonality: c });

  const results: Resource[] = [];

  if (plan === 'furred' || plan === 'scaled') {
    const minorMeat = plan === 'furred' ? 'red_meat' : 'reptile_meat';
    results.push(withCommon(meatResourceName(adj, overrides, minorMeat)));
    const hideName = overrides.hide ?? `${adj} hide`;
    results.push(
      withCommon({
        name: hideName,
        description: `Raw skin or pelt from a ${adj} animal; can be tanned into leather or similar goods.`,
        major_type: 'organic',
        minor_type: plan === 'furred' ? 'hide' : 'scale',
        is_refineable: true,
        properties: [],
        commonality: 0,
      }),
    );
  } else if (plan === 'feathered') {
    results.push(withCommon(meatResourceName(adj, overrides, 'poultry')));
    const featherName = overrides.feathers ?? `${adj} feathers`;
    results.push(
      withCommon({
        name: featherName,
        description: `Feathers plucked or recovered from a ${adj} animal; used for fletching, insulation, and ornament.`,
        major_type: 'organic',
        minor_type: 'feather',
        is_refineable: false,
        properties: [],
        commonality: 0,
      }),
    );
  } else {
    // chitinous
    results.push(withCommon(meatResourceName(adj, overrides, 'insect_meat')));
    const chitinName = overrides.chitin ?? `${adj} chitin`;
    results.push(
      withCommon({
        name: chitinName,
        description: `Hardened exoskeleton or shell pieces from a ${adj} animal; can be ground or worked into material.`,
        major_type: 'organic',
        minor_type: 'chitin',
        is_refineable: true,
        properties: [],
        commonality: 0,
      }),
    );
  }

  if (hasHornsOrAntlers(species)) {
    const hornName = overrides.horn ?? `${adj} horn`;
    results.push(
      withCommon({
        name: hornName,
        description: `Horn, antler, or similar hard growth from a ${adj} animal; can be carved or worked.`,
        major_type: 'organic',
        minor_type: 'horn',
        is_refineable: true,
        properties: [],
        commonality: 0,
      }),
    );
  }

  return results;
}

/**
 * Produces `Resource` entries for a species' butcherable or harvestable carcass products.
 * Returns an empty array when the species is not eligible.
 */
export function deriveResourcesFromSpecies(species: Species): Resource[] {
  if (!speciesYieldsCarcassResources(species)) {
    return [];
  }
  const plan = inferCarcassBodyPlan(species);
  const overrides = mergeProductOverrides(species);
  return buildResourcesForPlan(species, plan, overrides);
}

/**
 * All species-derived carcass resources, deduplicated by `name` (first occurrence wins).
 */
export function getAllSpeciesDerivedResources(): Resource[] {
  const byName = new Map<string, Resource>();
  for (const species of allSpecies) {
    for (const r of deriveResourcesFromSpecies(species)) {
      if (!byName.has(r.name)) {
        byName.set(r.name, r);
      }
    }
  }
  return [...byName.values()];
}

export { RESOURCE_DERIVABLE_TAG };
