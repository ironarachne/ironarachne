import { describe, expect, it } from 'vitest';
import { getAllMetalOres } from './metal_ores';
import { getBuildingMaterialResources } from './building_materials';
import { inferStructuralAffordance } from './infer_structural_affordance';

describe('inferStructuralAffordance', () => {
  it('treats oak timber as high tensile primary structure', () => {
    const oak = getBuildingMaterialResources().find((r) => r.name === 'oak timber');
    expect(oak).toBeDefined();
    const a = inferStructuralAffordance(oak!);
    expect(a.roles).toContain('primary_structure');
    expect(a.tensileSuitability).toBeGreaterThan(0.35);
    expect(['medium', 'long']).toContain(a.spanCategory);
  });

  it('treats granite as compressive masonry-friendly', () => {
    const granite = getBuildingMaterialResources().find((r) => r.name === 'granite ashlar');
    expect(granite).toBeDefined();
    const a = inferStructuralAffordance(granite!);
    expect(a.compressiveSuitability).toBeGreaterThan(0.5);
    expect(a.roles).toContain('primary_structure');
  });

  it('keeps raw iron ore low for structural use', () => {
    const ironOre = getAllMetalOres().find((r) => r.name === 'iron ore');
    expect(ironOre).toBeDefined();
    const a = inferStructuralAffordance(ironOre!);
    expect(a.compressiveSuitability).toBeLessThan(0.25);
    expect(a.roles.includes('primary_structure')).toBe(false);
  });
});
