import type { LandformClass } from '$lib/map';

export type TemperatureRange = [number, number];
export type MoistureRange = [number, number];
export type WaterRequirement = 'none' | 'freshwater-bank' | 'freshwater-shore' | 'coastal-margin';
export type ForageCapability = 'grazing' | 'flowering';
export type BiologicalOccurrenceForm = 'population' | 'colony';
export type BiologicalHabitatRule = {
  id: string;
  environments: string[];
  temperature: TemperatureRange;
  moisture: MoistureRange;
  landforms: LandformClass[];
  water: WaterRequirement;
};
export type PlantDefinition = {
  id: string;
  label: string;
  aliases: string[];
  habitats: BiologicalHabitatRule[];
  forage: ForageCapability[];
};
export type BiologicalHabitatPatch = {
  environments: string[];
  temperature: number;
  moisture: number;
  landform: LandformClass;
  water: WaterRequirement[];
};
