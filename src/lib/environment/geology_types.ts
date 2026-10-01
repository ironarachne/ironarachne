export type GeologicalProcess =
  | 'intrusive'
  | 'volcanic'
  | 'volcanic-pipe'
  | 'metamorphic'
  | 'hydrothermal'
  | 'sedimentary'
  | 'placer'
  | 'evaporite'
  | 'organic-sedimentary'
  | 'petroleum';
export type PetroleumMaturity = 'immature' | 'oil-window' | 'gas-window';
export type PetroleumSystem = {
  sourceRock: string;
  reservoirRock: string;
  sealRock: string;
  maturity: PetroleumMaturity;
  trapped: boolean;
};
export type GeologicalSetting = {
  hostRocks: string[];
  processes: GeologicalProcess[];
  petroleum?: PetroleumSystem;
};
