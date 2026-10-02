import type { GeologicalSetting } from '$lib/environment';
import type {
  DepositConcentration,
  DepositExposure,
  ExtractionMethod,
  GeologicalResourceCategory,
} from '$lib/resources';
import type { FactBase, SpatialAnchor, RegionFacts } from './region_fact_types';
export type GeologyFact = FactBase & {
  areaIds: string[];
  anchor: SpatialAnchor;
  setting: GeologicalSetting;
};
export type ResourceDepositFact = FactBase & {
  geologyId: string;
  resourceName: string;
  category: GeologicalResourceCategory;
  concentration: DepositConcentration;
  exposure: DepositExposure;
  extraction: ExtractionMethod;
  anchor: SpatialAnchor;
};
export type ResourceAvailability = 'available' | 'limited' | 'not-observed' | 'unknown';
export type ResourceCatalogSource =
  | { kind: 'building-material'; resourceName: string }
  | { kind: 'species-product'; speciesName: string; resourceName: string }
  | { kind: 'geological-resource'; resourceName: string }
  | { kind: 'plant-product'; plantName: string; resourceName: string };

export type RegionResourceFactList =
  | 'geology'
  | 'resourceDeposits'
  | 'resources'
  | 'products'
  | 'supply'
  | 'dailyLife'
  | 'settlementRoles';
export type RegionSemanticFact = RegionFacts[Exclude<
  keyof RegionFacts,
  'version' | 'state'
>][number];
