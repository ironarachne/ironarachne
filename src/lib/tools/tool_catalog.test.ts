import { expect, describe, it } from 'vitest';
import {
  TOOL_CATALOG,
  allTools,
  filterTools,
  findToolByPath,
  toolsByPath,
  toolsForSystem,
  toolsInDomain,
  toolsOfKind,
  toolsWithGenre,
} from './tool_catalog';
import { genreTag, systemTag, toolGenres, toolSystems } from './tools';
import { GENRES, SYSTEMS } from './tool_types';

describe('TOOL_CATALOG', () => {
  it('has a unique path for every tool', () => {
    const paths = TOOL_CATALOG.map((tool) => tool.path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every tool a label', () => {
    const unlabelled = TOOL_CATALOG.filter((tool) => tool.label.trim() === '');

    expect(unlabelled).toEqual([]);
  });

  it('uses only known genres', () => {
    const unknown = TOOL_CATALOG.flatMap(toolGenres).filter(
      (genre) => !GENRES.includes(genre as (typeof GENRES)[number]),
    );

    expect(unknown).toEqual([]);
  });

  it('uses only known systems', () => {
    const unknown = TOOL_CATALOG.flatMap(toolSystems).filter(
      (system) => !SYSTEMS.includes(system as (typeof SYSTEMS)[number]),
    );

    expect(unknown).toEqual([]);
  });

  it('gives every tool that targets a system a genre as well', () => {
    const systemWithoutGenre = TOOL_CATALOG.filter(
      (tool) => toolSystems(tool).length > 0 && toolGenres(tool).length === 0,
    );

    expect(systemWithoutGenre.map((tool) => tool.path)).toEqual([]);
  });

  it('covers every domain in the navigation', () => {
    const domains = new Set(TOOL_CATALOG.map((tool) => tool.domain));

    expect([...domains].sort()).toEqual([
      'characters',
      'factions',
      'locations',
      'objects',
      'utilities',
    ]);
  });
});

describe('allTools', () => {
  it('returns the catalog', () => {
    expect(allTools()).toBe(TOOL_CATALOG);
  });
});

describe('findToolByPath', () => {
  it('finds a tool by its route', () => {
    expect(findToolByPath('/culture')?.label).toBe('Culture');
  });

  it('returns undefined for an unknown route', () => {
    expect(findToolByPath('/nowhere')).toBeUndefined();
  });
});

describe('toolsByPath', () => {
  it('returns tools in the order asked for', () => {
    const tools = toolsByPath(['/region', '/culture']);

    expect(tools.map((tool) => tool.label)).toEqual(['Region', 'Culture']);
  });

  it('throws on an unknown path', () => {
    expect(() => toolsByPath(['/nowhere'])).toThrow('/nowhere');
  });
});

describe('toolsInDomain', () => {
  it('returns only tools in that domain', () => {
    const tools = toolsInDomain('utilities');

    expect(tools.length).toBeGreaterThan(0);
    expect(tools.every((tool) => tool.domain === 'utilities')).toBe(true);
  });
});

describe('toolsOfKind', () => {
  it('separates references from generators', () => {
    const references = toolsOfKind('reference');

    expect(references.map((tool) => tool.path)).toContain('/word-generator-cheat-sheet');
    expect(references.map((tool) => tool.path)).not.toContain('/culture');
  });
});

describe('toolsWithGenre', () => {
  it('returns the tools carrying that genre tag', () => {
    const cyberpunk = toolsWithGenre('cyberpunk');

    expect(cyberpunk.map((tool) => tool.path).sort()).toEqual(['/chop-shop', '/drug']);
  });

  it('includes a tool that carries the genre alongside others', () => {
    expect(toolsWithGenre('horror').map((tool) => tool.path)).toEqual(['/spooky-ship']);
  });
});

describe('toolsForSystem', () => {
  it('returns the tools written for that system', () => {
    const swn = toolsForSystem('swn');

    expect(swn.map((tool) => tool.path).sort()).toEqual(['/swn/character', '/swn/starship']);
  });
});

describe('filterTools', () => {
  it('composes a genre filter with a system exclusion', () => {
    const systemNeutralFantasy = filterTools({
      includeAllTags: [genreTag('fantasy')],
      excludeTags: [systemTag('adnd-2e'), systemTag('dcc')],
    });

    const paths = systemNeutralFantasy.map((tool) => tool.path);

    expect(paths).toContain('/culture');
    expect(paths).not.toContain('/fantasy/adnd/character');
    expect(paths).not.toContain('/fantasy/dcc/character');
  });

  it('returns the whole catalog for an empty filter', () => {
    expect(filterTools({})).toEqual(TOOL_CATALOG);
  });
});
