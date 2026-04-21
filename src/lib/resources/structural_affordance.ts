/**
 * Roles a resource can play in vernacular / structural building logic.
 * Used by architecture generation; not exhaustive for real engineering.
 */
export type BuildingMaterialRole =
  | 'primary_structure'
  | 'enclosure'
  | 'roofing'
  | 'foundation'
  | 'ornament';

/** How far a material can typically bridge without secondary support (conceptual). */
export type SpanCategory = 'short' | 'medium' | 'long';

/**
 * Normalized structural affordance for building-style reasoning (0 = poor, 1 = excellent).
 */
export type BuildingStructuralAffordance = {
  /** Which building roles this material suits. */
  roles: BuildingMaterialRole[];
  compressiveSuitability: number;
  tensileSuitability: number;
  /** Typical horizontal span capability for beams/slabs (conceptual). */
  spanCategory: SpanCategory;
  /** Suitability for earth-based construction (adobe, rammed earth, cob). */
  earthworkSuitability: number;
  /** Thermal mass for passive climate behavior (narrative / future sim). */
  thermalMass: number;
  /** Resistance to weathering when exposed (narrative / future sim). */
  weatherResistance: number;
};
