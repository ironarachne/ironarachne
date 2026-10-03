import type { ArtifactReference } from '$lib/artifacts';
import type { Creature } from './creature_types';

export type CreatureContextProblem =
  | 'missing-habitat'
  | 'stale-context'
  | 'no-supported-species'
  | 'incompatible-options';
export type CreatureHabitatCandidate = {
  inhabitantId: string;
  speciesName: string;
  roles: string[];
};
export type CreatureHabitatContext = {
  habitatId: string;
  regionTargetId?: string;
  candidates: CreatureHabitatCandidate[];
};
export type CreatureHabitatAssignment = CreatureHabitatCandidate & { habitatId: string };
export type UnavailableCreature = { ok: false; reason: CreatureContextProblem; message: string };
export type AvailableCreature = {
  ok: true;
  creature: Creature;
  assignment: CreatureHabitatAssignment;
  reference?: ArtifactReference;
};
export type ContextualCreatureResult = AvailableCreature | UnavailableCreature;
export type CreatureHabitatProjection =
  | { ok: true; context: CreatureHabitatContext }
  | UnavailableCreature;
export type CreatureHabitatPresentation = {
  status: 'current' | 'stale' | 'unresolved';
  habitatName: string;
  inhabitantName: string;
  roles: string[];
  description: string;
};
