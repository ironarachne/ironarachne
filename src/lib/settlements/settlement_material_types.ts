export type MaterialSourceSettlement =
  | { kind: 'embedded'; settlementId: string }
  | { kind: 'artifact'; targetId: string };
export type RegionalMaterialLink = {
  regionTargetId: string;
  sourceSettlement: MaterialSourceSettlement;
};
export type MaterialContextStatus = 'current' | 'needs-review' | 'empty' | 'unresolved';
export type RegionalMaterialPresentation = {
  status: MaterialContextStatus;
  sourceName: string;
  buildingMaterials: string[];
  fuel: string[];
  crafts: string[];
  notices: string[];
};
