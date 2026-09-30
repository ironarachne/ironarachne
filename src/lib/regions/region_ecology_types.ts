import type { FactBase, SettlementTarget } from './region_fact_types';

export type EcologyCategory = 'flora' | 'fauna' | 'fantastical';
export type EcologicalRole =
  | 'producer'
  | 'grazer'
  | 'predator'
  | 'scavenger'
  | 'decomposer'
  | 'pollinator'
  | 'habitat-engineer'
  | 'other';
export type InhabitantSource =
  | { kind: 'species'; speciesName: string }
  | { kind: 'described'; label: string }
  | { kind: 'creature-artifact'; targetId: string; speciesName: string };
export type EcologyInhabitantFact = FactBase & {
  category: EcologyCategory;
  roles: EcologicalRole[];
  source: InhabitantSource;
  habitatIds: string[];
};
export type OrganismRelationKind = 'feeds-on' | 'competes-with' | 'pollinates' | 'pest-of';
export type EcologyUse = 'food' | 'material' | 'domestication';
export type EcologyRelation =
  | { kind: OrganismRelationKind; targetId: string }
  | { kind: 'used-by'; settlement: SettlementTarget; use: EcologyUse };
export type EcologyRelationshipFact = FactBase & {
  subjectId: string;
  habitatIds: string[];
  relation: EcologyRelation;
};
