import { describe, expect, it } from 'vitest';
import { getBuildingMaterialResources } from '../resources/building_materials';
import { describeArchitecturalStyle } from './describe_architectural_style';
import { generateArchitecturalStyle } from './generate_architectural_style';

describe('generateArchitecturalStyle', () => {
  const baseSite = {
    substrate: 'mixed' as const,
    relief: 'rolling' as const,
  };

  it('is deterministic for the same seed and inputs', () => {
    const resources = getBuildingMaterialResources();
    const a = generateArchitecturalStyle({
      seed: 'test-seed-1',
      availableResources: resources,
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal', 'painted_plaster'],
      site: baseSite,
    });
    const b = generateArchitecturalStyle({
      seed: 'test-seed-1',
      availableResources: resources,
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal', 'painted_plaster'],
      site: baseSite,
    });
    expect(a).toEqual(b);
  });

  it('does not use load-bearing granite when no stone is in the palette', () => {
    const onlyTimber = getBuildingMaterialResources().filter((r) =>
      ['pine timber', 'straw thatch', 'lime plaster'].includes(r.name),
    );
    const style = generateArchitecturalStyle({
      seed: 'sandy-timber-only',
      availableResources: onlyTimber,
      purposes: ['residential'],
      populationDensity: 0.2,
      decorativeStyles: ['minimal'],
      site: { substrate: 'sandy', relief: 'flat' },
    });
    expect(style.primaryMaterials.some((n) => n.toLowerCase().includes('granite'))).toBe(false);
    expect(style.structuralSystem).not.toBe('load_bearing_masonry');
  });

  it('produces a non-empty description', () => {
    const style = generateArchitecturalStyle({
      seed: 'desc-1',
      availableResources: getBuildingMaterialResources(),
      purposes: ['civic', 'commercial'],
      populationDensityBand: 'high',
      decorativeStyles: ['tile_inlay', 'minimal'],
      site: { substrate: 'clay_rich', relief: 'flat', coastal: true },
    });
    const text = describeArchitecturalStyle(style);
    expect(text.length).toBeGreaterThan(80);
    expect(text).toContain(style.label.split(' ')[0]);
  });
});
