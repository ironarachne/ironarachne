import { expect, describe, it } from 'vitest';
import type Species from '$lib/species/species';

import * as entrypoint from './index';

/**
 * The entry point names each monster's default export by hand, because `export *` does not carry a
 * default. That is a list which can fall behind the directory, so it is checked against the modules
 * themselves rather than trusted: a monster added under any of the subdirectories and forgotten in
 * its `index.ts` fails here.
 */
const modules = import.meta.glob<{ default?: Species }>('./*/*.ts', { eager: true });
const monsters = Object.entries(modules)
  .filter(([path, module]) => !path.endsWith('.test.ts') && module.default !== undefined)
  .map(([path]) => path.replace(/^\.\/[^/]+\//, '').replace('.ts', ''));

describe('monster species entry point', () => {
  it('finds monster modules to check', () => {
    expect(monsters.length).toBeGreaterThan(0);
  });

  it('names every monster module', () => {
    const exported = new Set(Object.keys(entrypoint));

    expect(monsters.filter((name) => !exported.has(name))).toEqual([]);
  });

  it('exports the species itself, not an empty namespace', () => {
    for (const name of monsters) {
      const species = (entrypoint as unknown as Record<string, Species | undefined>)[name];

      expect(species?.name, name).toBeTruthy();
    }
  });
});
