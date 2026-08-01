import { describe, expect, it } from 'vitest';
import type { Resource } from '../resources/resource_types';
import { getBuildingMaterialResources } from '../resources/building_materials';
import type {
  ArchitecturalStyle,
  DecorativeStyleId,
  GenerateArchitecturalStyleConfig,
  RoofStyle,
} from './architectural_style_types';
import { describeArchitecturalStyle } from './describe_architectural_style';
import { generateArchitecturalStyle } from './generate_architectural_style';

/** The named subset of the curated palette, so a test can pin what the builders had to hand. */
function palette(...names: string[]): Resource[] {
  return getBuildingMaterialResources().filter((r) => names.includes(r.name));
}

describe('generateArchitecturalStyle', () => {
  const baseSite = {
    substrate: 'mixed' as const,
    relief: 'rolling' as const,
  };

  /** Generates over a fixed span of seeds, so branch odds are exercised deterministically. */
  function acrossSeeds(
    config: Omit<GenerateArchitecturalStyleConfig, 'seed'>,
    count = 60,
  ): ArchitecturalStyle[] {
    return Array.from({ length: count }, (_, i) =>
      generateArchitecturalStyle({ ...config, seed: `arch-${i}` }),
    );
  }

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

  it('assumes a medium density band when neither figure is supplied', () => {
    const withoutDensity = generateArchitecturalStyle({
      seed: 'no-density',
      availableResources: getBuildingMaterialResources(),
      purposes: ['residential'],
      decorativeStyles: ['minimal'],
      site: baseSite,
    });
    const withMedium = generateArchitecturalStyle({
      seed: 'no-density',
      availableResources: getBuildingMaterialResources(),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    });
    expect(withoutDensity).toEqual(withMedium);
  });

  it('treats an empty palette as timber framing rather than throwing', () => {
    const style = generateArchitecturalStyle({
      seed: 'empty-palette',
      availableResources: [],
      purposes: ['residential'],
      populationDensityBand: 'low',
      decorativeStyles: ['minimal'],
      site: baseSite,
    });
    expect(style.structuralSystem).toBe('post_and_beam');
    expect(style.primaryMaterials).toEqual([]);
    expect(style.activeDecorations).toEqual(['minimal']);
  });

  it('builds in earth when the palette is earth', () => {
    for (const style of acrossSeeds({
      availableResources: palette('adobe brick', 'rammed earth'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    })) {
      expect(style.structuralSystem).toBe('cob_or_adobe');
    }
  });

  it('eventually pairs stone with timber as a hybrid system', () => {
    /* Defence promotes stone over timber, so granite leads and oak backs it. */
    const systems = new Set(
      acrossSeeds({
        availableResources: palette('granite ashlar', 'oak timber'),
        purposes: ['defensive'],
        populationDensityBand: 'medium',
        decorativeStyles: ['minimal'],
        site: { substrate: 'rocky', relief: 'rolling' },
      }).map((s) => s.structuralSystem),
    );
    expect(systems).toEqual(new Set(['hybrid_timber_and_masonry', 'load_bearing_masonry']));
  });

  it('frames in timber when timber outscores the stone beside it', () => {
    for (const style of acrossSeeds({
      availableResources: palette('granite ashlar', 'oak timber'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: { substrate: 'rocky', relief: 'rolling' },
    })) {
      expect(style.structuralSystem).toBe('post_and_beam');
      expect(style.primaryMaterials[0]).toBe('oak timber');
    }
  });

  it('gives thatch on flood-prone ground a steep roof and raised floors', () => {
    for (const style of acrossSeeds({
      availableResources: palette('straw thatch'),
      purposes: ['residential'],
      populationDensityBand: 'low',
      decorativeStyles: ['minimal'],
      site: { substrate: 'peat', relief: 'flat', flood_prone: true },
    })) {
      expect(style.roof).toBe('steep_thatch');
      expect(style.siteAdaptations).toContain('raised_floor_plinths');
      expect(style.siteAdaptations).toContain('steep_roof_sheds_rain');
      expect(style.generatorHints?.preferredStoreys).toBe(1);
    }
  });

  it('roofs slate and brick from their own families', () => {
    for (const style of acrossSeeds({
      availableResources: palette('slate tile'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    })) {
      expect(['shallow_tile', 'clay_barrel_tile', 'cross_gabled', 'hip_roof']).toContain(
        style.roof,
      );
    }
    for (const style of acrossSeeds({
      availableResources: palette('fired brick'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    })) {
      expect([
        'shallow_tile',
        'clay_barrel_tile',
        'hip_roof',
        'gable_roof',
        'cross_gabled',
        'mansard',
      ]).toContain(style.roof);
    }
  });

  it('eventually grows a living roof on adobe over peat, and tags the moisture', () => {
    const living = acrossSeeds({
      availableResources: palette('adobe brick'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: { substrate: 'peat', relief: 'flat' },
    }).filter((s) => s.roof === 'green_living_roof');
    expect(living.length).toBeGreaterThan(0);
    for (const style of living) {
      expect(style.siteAdaptations).toContain('roof_soil_retains_moisture');
    }
  });

  it('eventually gives a coastal site a wind-resistant metal roof', () => {
    const styles = acrossSeeds({
      availableResources: palette('granite ashlar'),
      purposes: ['residential'],
      populationDensityBand: 'low',
      decorativeStyles: ['minimal'],
      site: { substrate: 'rocky', relief: 'flat', coastal: true },
    });
    const metal = styles.filter((s) => s.roof === 'standing_seam_metal');
    expect(metal.length).toBeGreaterThan(0);
    for (const style of metal) {
      expect(style.siteAdaptations).toContain('metal_roof_resists_wind_lift');
    }
    expect(styles.every((s) => s.siteAdaptations.includes('salt_air_durable_materials'))).toBe(
      true,
    );
  });

  it('eventually reaches for city roof forms in a dense settlement', () => {
    const roofs = new Set(
      acrossSeeds({
        availableResources: palette('granite ashlar'),
        purposes: ['residential'],
        populationDensityBand: 'high',
        decorativeStyles: ['minimal'],
        site: { substrate: 'rocky', relief: 'flat' },
      }).map((s) => s.roof),
    );
    const cityForms: RoofStyle[] = [
      'mansard',
      'flat_or_low',
      'cross_gabled',
      'standing_seam_metal',
    ];
    expect(cityForms.some((r) => roofs.has(r))).toBe(true);
  });

  it('sizes openings to purpose', () => {
    const defensive = acrossSeeds({
      availableResources: getBuildingMaterialResources(),
      purposes: ['defensive'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    });
    expect(defensive.filter((s) => s.openings === 'narrow_defensive').length).toBeGreaterThan(40);

    const storage = acrossSeeds({
      availableResources: getBuildingMaterialResources(),
      purposes: ['storage'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    });
    expect(storage.every((s) => s.openings === 'moderate')).toBe(true);

    const religious = acrossSeeds({
      availableResources: getBuildingMaterialResources(),
      purposes: ['religious'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: baseSite,
    });
    expect(new Set(religious.map((s) => s.openings))).toEqual(new Set(['generous', 'moderate']));
    expect(religious.every((s) => s.generatorHints?.emphasisVertical === true)).toBe(true);
  });

  it('drops decorations the palette cannot support, and unknown ones outright', () => {
    const style = generateArchitecturalStyle({
      seed: 'decor-filter',
      availableResources: palette('pine timber', 'straw thatch'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: [
        'carved_stone',
        'painted_plaster',
        'tile_inlay',
        'metalwork',
        'wood_carving',
        'gilded_nonsense' as unknown as DecorativeStyleId,
      ],
      site: baseSite,
    });
    expect(style.activeDecorations).toEqual(['wood_carving']);
  });

  it('falls back to minimal decoration when nothing requested survives', () => {
    const style = generateArchitecturalStyle({
      seed: 'decor-none',
      availableResources: palette('pine timber'),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['metalwork'],
      site: baseSite,
    });
    expect(style.activeDecorations).toEqual(['minimal']);
  });

  it('records every site adaptation that applies', () => {
    const style = generateArchitecturalStyle({
      seed: 'adaptations',
      availableResources: getBuildingMaterialResources(),
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['minimal'],
      site: {
        substrate: 'sandy',
        relief: 'mountainous',
        coastal: true,
        flood_prone: true,
        high_altitude: true,
      },
    });
    expect(style.siteAdaptations).toEqual(
      expect.arrayContaining([
        'salt_air_durable_materials',
        'raised_floor_plinths',
        'steep_roofs_shed_snow',
        'shallow_spread_footings',
        'terraced_footprint',
      ]),
    );
  });

  it('rates courtyards as middling where dense settlement cannot cluster them', () => {
    for (const style of acrossSeeds({
      availableResources: getBuildingMaterialResources(),
      purposes: ['residential'],
      populationDensityBand: 'high',
      decorativeStyles: ['minimal'],
      site: { substrate: 'rocky', relief: 'mountainous' },
    })) {
      expect(style.massing).not.toBe('courtyard_clusters');
      expect(style.generatorHints?.courtyardLikelihood).toBe(0.45);
    }
  });

  it('tolerates resources whose numeric properties are strings or absent', () => {
    const odd: Resource[] = [
      {
        name: 'quarried marble',
        description: 'Stone whose density is recorded as text.',
        major_type: 'stone',
        minor_type: 'metamorphic',
        is_refineable: false,
        properties: [
          {
            name: 'density',
            description: 'Recorded by a clerk, not an instrument.',
            value: '2710',
          },
          { name: 'hardness', description: 'Illegible.', value: 'quite hard' },
        ],
        commonality: 3,
      },
      {
        name: 'salvaged beam',
        description: 'Timber with no properties recorded at all.',
        major_type: 'wood',
        minor_type: 'hardwood',
        is_refineable: false,
        properties: [],
        commonality: 2,
      },
    ];
    const style = generateArchitecturalStyle({
      seed: 'odd-properties',
      availableResources: odd,
      purposes: ['residential'],
      populationDensityBand: 'medium',
      decorativeStyles: ['carved_stone', 'minimal'],
      site: { substrate: 'sandy', relief: 'flat' },
    });
    expect(style.primaryMaterials.length).toBeGreaterThan(0);
    /* Hardness is unreadable, so carving cannot be justified. */
    expect(style.activeDecorations).toEqual(['minimal']);
  });

  it('lets the site decide which materials win', () => {
    const config = {
      availableResources: getBuildingMaterialResources(),
      purposes: ['residential'] as const,
      populationDensityBand: 'medium' as const,
      decorativeStyles: ['minimal'] as DecorativeStyleId[],
    };
    const sandy = generateArchitecturalStyle({
      ...config,
      seed: 'site-compare',
      purposes: ['residential'],
      site: { substrate: 'sandy', relief: 'flat' },
    });
    const mountain = generateArchitecturalStyle({
      ...config,
      seed: 'site-compare',
      purposes: ['residential'],
      site: { substrate: 'rocky', relief: 'mountainous', high_altitude: true },
    });
    expect(sandy.primaryMaterials).not.toEqual(mountain.primaryMaterials);
  });
});
