/**
 * Cross-library check on the entry points CODE_STYLE.md requires.
 *
 * Two things are easy to get wrong here and neither shows up as a type error. A library can be
 * added with no `index.ts` at all, and an `index.ts` can look complete while exporting nothing
 * useful: `export *` does not carry a default export, so starring a module whose only export is
 * `export default` compiles, lints, and hands the caller an empty namespace.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import * as adnd from './adnd';
import * as age from './age';
import * as astronomicalBodies from './astronomical_bodies';
import * as cuisine from './cuisine';
import * as drug from './drug';
import * as environment from './environment';
import * as geometry from './geometry';
import * as map from './map';
import * as organizations from './organizations';
import * as persistentSave from './persistent_save';
import * as shaders from './shaders';
import * as speciesAnimals from './species_animals';
import * as speciesMonsters from './species_monsters';
import * as swn from './swn';
import * as ui from './ui';
import * as unchartedworlds from './unchartedworlds';

const libRoot = resolve(__dirname);

/** Recursive, so a library whose sources all sit in subdirectories still needs an entry point. */
function hasSourceFiles(dir: string): boolean {
  return readdirSync(dir, { withFileTypes: true }).some((entry) =>
    entry.isDirectory()
      ? hasSourceFiles(resolve(dir, entry.name))
      : entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts'),
  );
}

describe('library entry points', () => {
  it('gives every library with source files an index.ts', () => {
    const missing = readdirSync(libRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => {
        const dir = resolve(libRoot, name);
        return hasSourceFiles(dir) && !existsSync(resolve(dir, 'index.ts'));
      });

    expect(missing).toEqual([]);
  });
});

describe('entry points added for issue #16', () => {
  const entrypoints: Record<string, Record<string, unknown>> = {
    adnd,
    age,
    astronomicalBodies,
    cuisine,
    drug,
    environment,
    geometry,
    map,
    organizations,
    persistentSave,
    shaders,
    speciesAnimals,
    speciesMonsters,
    swn,
    ui,
    unchartedworlds,
  };

  for (const [name, entrypoint] of Object.entries(entrypoints)) {
    it(`${name} exports something`, () => {
      expect(Object.keys(entrypoint).length).toBeGreaterThan(0);
    });
  }

  it('carries the default exports a bare `export *` would have dropped', () => {
    expect(typeof adnd.ADNDCharacterGenerator).toBe('function');
    expect(adnd.classes.paladin).toBeDefined();
    expect(adnd.races.dwarf).toBeDefined();
    expect(typeof cuisine.CuisineGenerator).toBe('function');
    expect(typeof shaders.createShader).toBe('function');
    expect(speciesAnimals.camel).toBeDefined();
    expect(speciesMonsters.balor).toBeDefined();
    expect(speciesMonsters.owlbear).toBeDefined();
  });

  it('keeps both sides of every name collision reachable', () => {
    expect(typeof adnd.classes.getAll).toBe('function');
    expect(typeof adnd.races.getAll).toBe('function');
    expect(typeof adnd.spells.getAll).toBe('function');
    expect(cuisine.components.all).toBeDefined();
    expect(cuisine.drinkTypes.all).toBeDefined();
    expect(drug.drugTypes.all).toBeDefined();
    expect(drug.effectTypes.all).toBeDefined();
    expect(environment.Landforms.all).toBeDefined();
    expect(environment.PrecipitationTypes.all).toBeDefined();
    expect(typeof environment.generate).toBe('function');
    expect(typeof environment.Biomes.generate).toBe('function');
    expect(typeof environment.Climates.generate).toBe('function');
    expect(typeof environment.Ecosystems.generate).toBe('function');
    expect(typeof environment.Terrain.generate).toBe('function');
    expect(typeof environment.WaterSystems.generate).toBe('function');
    expect(typeof swn.characters.generate).toBe('function');
    expect(typeof swn.starships.generate).toBe('function');
  });

  it('carries the plain named exports too', () => {
    expect(typeof age.humanStandard).toBe('function');
    expect(age.beastLifespanCat).toBeDefined();
    expect(typeof astronomicalBodies.generateStarSystem).toBe('function');
    expect(typeof geometry.triangulate).toBe('function');
    expect(typeof map.buildBaseMapGraph).toBe('function');
    expect(typeof organizations.generateOrganization).toBe('function');
    expect(typeof organizations.getKindsForGenerator).toBe('function');
    expect(typeof persistentSave.stripFunctionValuesDeep).toBe('function');
    expect(typeof ui.showAlertModal).toBe('function');
    expect(typeof unchartedworlds.generate).toBe('function');
  });
});
