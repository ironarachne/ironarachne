import type { MapNode } from '$lib/map';
import type Region from './region';
import type {
  EcologyUse,
  EcologyRelationshipFact,
  EcologyInhabitantFact,
} from './region_ecology_types';
import type { FactSource } from './region_fact_types';

export type EcologyRelationshipRegion = Pick<
  Region,
  'map' | 'facts' | 'environment' | 'settlements' | 'settlementIds'
>;
export type EcologyFeedingRule = {
  id: string;
  subject: string;
  subjectRole: 'predator' | 'grazer';
  targets: string[];
  targetCategory: 'flora' | 'fauna';
  coldBrowse?: boolean;
};
export type EcologyUseRule = {
  id: string;
  sources: string[];
  use: EcologyUse;
  purpose: string;
};
export type EcologyOccurrence = {
  inhabitant: EcologyInhabitantFact;
  nodeSources: Map<number, FactSource[]>;
};
export type EcologyHarvestRisk = {
  use: EcologyRelationshipFact;
  inhabitant: EcologyInhabitantFact;
  node: MapNode;
  sources: FactSource[];
};
