import type {
  RegionSettlementReading,
  SettlementCharacterObservation,
} from './region_settlement_reading_types';
import type {
  RegionRoadReading,
  RegionRoadNetworkObservation,
  RegionRoadPathObservation,
} from './region_road_reading_types';
import type {
  RegionNotableReading,
  RegionNotableNameObservation,
} from './region_notable_reading_types';
import type {
  LandscapeFootprintObservation,
  RegionLandscapePlace,
} from './region_landscape_reading_types';
import type { NarrativeCandidate, NarrativeContext, NarrativeSelection } from '$lib/narrative';
import type { FactReason, FactSource, SettlementTarget } from './region_fact_types';

export type RegionEditorialSection =
  | 'opening'
  | 'landscape'
  | 'notable-place'
  | 'ecology'
  | 'materials-work'
  | 'travel'
  | 'hazards'
  | 'settlement';
export type RegionEditorialDestination = {
  section: RegionEditorialSection;
  settlement?: SettlementTarget;
  landscapePlaceId?: string;
  notableId?: string;
  routeId?: string;
};
export type RegionEditorialPriority = {
  residentConsequence: boolean;
  connectsSubjects: boolean;
  locatedDetail: boolean;
  peerSupportCount: number;
};
export type RegionEditorialObservation =
  | SettlementCharacterObservation
  | RegionRoadNetworkObservation
  | RegionRoadPathObservation
  | RegionNotableNameObservation
  | LandscapeFootprintObservation
  | {
      kind: 'settlement-populations';
      values: { settlementId: string; population: number }[];
    }
  | {
      kind: 'settlement-roads';
      settlementIds: string[];
      validRoadIds: string[];
      incidentRoadIds: string[];
      neighbourIds: string[];
      settlementId: string;
    };
export type RegionEditorialCandidate = {
  narrative: NarrativeCandidate;
  settlementReadingRole?: 'portrait' | 'opportunity';
  subjectKey: string;
  assertionKeys: string[];
  destinations: RegionEditorialDestination[];
  priority: RegionEditorialPriority;
  sources: FactSource[];
  observations: RegionEditorialObservation[];
};
export type RegionEditorialChoice = {
  candidateId: string;
  destination: RegionEditorialDestination;
  repeatedOrientation: boolean;
};
export type RegionEditorialContext = {
  wording: NarrativeContext;
  recentMeaningKeys: string[];
};
export type RegionGazetteerSentence = {
  id: string;
  text: string;
  candidateId: string;
  assertionKeys: string[];
  repeatedOrientation: boolean;
  selection: NarrativeSelection;
  reason: FactReason;
  observations: RegionEditorialObservation[];
};
export type RegionGazetteerBlock = {
  id: string;
  destination: RegionEditorialDestination;
  sentences: RegionGazetteerSentence[];
};
export type RegionGazetteer =
  | RegionGazetteerV5
  | { version: 1; blocks: RegionGazetteerBlock[] }
  | { version: 2; blocks: RegionGazetteerBlock[]; landscapePlaces: RegionLandscapePlace[] }
  | {
      version: 3;
      blocks: RegionGazetteerBlock[];
      landscapePlaces: RegionLandscapePlace[];
      notableReadings: RegionNotableReading[];
    }
  | {
      version: 4;
      blocks: RegionGazetteerBlock[];
      landscapePlaces: RegionLandscapePlace[];
      notableReadings: RegionNotableReading[];
      roadReadings: RegionRoadReading[];
    };

export type RegionGazetteerV5 = {
  version: 5;
  blocks: RegionGazetteerBlock[];
  landscapePlaces: RegionLandscapePlace[];
  notableReadings: RegionNotableReading[];
  roadReadings: RegionRoadReading[];
  settlementReadings: RegionSettlementReading[];
};
