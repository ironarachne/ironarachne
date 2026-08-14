import type { Ability } from '$lib/abilities';
import type { AgeCategory } from '$lib/age';
import type { Gender } from '$lib/gender';
import type { PhysicalTraitGeneratorConfig } from '$lib/physical_traits';
import type { SizeMatrix } from '$lib/size';
import type { CarcassBodyPlan } from './carcass_body_plan';

export default interface Species {
  name: string;
  pluralName: string;
  adjective: string;
  breedType: string;
  environments: string[];
  creatureTypes: string[];
  physicalTraitGeneratorConfigs: PhysicalTraitGeneratorConfig[];
  ageCategories: AgeCategory[];
  sizeGeneratorConfigMatrix: SizeMatrix;
  abilities: Ability[];
  baseThreatLevel: number;
  genders: Gender[];
  commonality: number;
  tags: string[];
  /** When set, body-plan guess from physical traits is ignored (e.g. owlbear: feathers but mammal-style products). */
  carcassBodyPlan?: CarcassBodyPlan;
  /**
   * Optional names for carcass-derived `Resource` entries. Merged with the central
   * `SPECIES_PRODUCT_OVERRIDES` map; these values win.
   */
  resourceProductNames?: {
    meat?: string;
    hide?: string;
    feathers?: string;
    scale?: string;
    chitin?: string;
    horn?: string;
  };
}
