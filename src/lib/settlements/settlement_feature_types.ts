export type SettlementFeatureRequirement =
  | { kind: 'activity'; activityKey: string }
  | { kind: 'geography'; predicateKey: string }
  | {
      kind: 'organism';
      source: { kind: 'plant'; plantId: string } | { kind: 'species'; speciesName: string };
    };
export type SettlementFeatureRule = {
  id: string;
  categoryNames: string[];
  requirements: SettlementFeatureRequirement[];
  wording: string[];
};
