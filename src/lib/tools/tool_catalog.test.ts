import { expect, describe, it } from 'vitest';
import {
  TOOL_CATALOG,
  allTools,
  featuredTools,
  filterTools,
  findToolByPath,
  toolMaturityForPath,
  toolsByPath,
  toolsForSystem,
  toolsInDomain,
  toolsOfKind,
  toolsWithGenre,
  toolsWithMaturity,
} from './tool_catalog';
import {
  FEATURED_TAG,
  MATURITY_TAG_PREFIX,
  genreTag,
  maturityTag,
  systemTag,
  toolGenres,
  toolSystems,
} from './tools';
import { GENRES, MATURITIES, SYSTEMS } from './tool_types';

describe('TOOL_CATALOG', () => {
  it('has a unique path for every tool', () => {
    const paths = TOOL_CATALOG.map((tool) => tool.path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every tool a label', () => {
    const unlabelled = TOOL_CATALOG.filter((tool) => tool.label.trim() === '');

    expect(unlabelled).toEqual([]);
  });

  // A label is the only thing identifying a tool in the places it is shown: the browser row, the
  // bench panel title, and the switch-tools confirmation all render it with no path and no kind
  // beside it. Two entries sharing one gives the user a choice they cannot make. This asserts on
  // the duplicated labels rather than on a count, so a failure names the collision instead of
  // reporting that 35 is not 34.
  it('has a unique label for every tool', () => {
    const seen = new Set<string>();
    const duplicated = new Set<string>();
    for (const { label } of TOOL_CATALOG) {
      if (seen.has(label)) {
        duplicated.add(label);
      }
      seen.add(label);
    }

    expect([...duplicated]).toEqual([]);
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

  it('gives every tool a maturity from MATURITIES', () => {
    const unknown = TOOL_CATALOG.filter((tool) => !MATURITIES.includes(tool.maturity));

    expect(unknown.map((tool) => tool.path)).toEqual([]);
  });

  it('carries each tool’s maturity as a tag as well, exactly once', () => {
    const mismatched = TOOL_CATALOG.filter(
      (tool) =>
        tool.tags.filter((tag) => tag.startsWith(MATURITY_TAG_PREFIX)).length !== 1 ||
        !tool.tags.includes(maturityTag(tool.maturity)),
    );

    expect(mismatched.map((tool) => tool.path)).toEqual([]);
  });

  it('records the maturity of the tools assessed above Experimental', () => {
    // The three the design document singles out. Locked down here because these are the values a
    // user reads as a promise about their work, and a careless edit to one is otherwise invisible.
    expect(findToolByPath('/culture')?.maturity).toBe('release-ready');
    expect(findToolByPath('/fantasy/religion')?.maturity).toBe('release-ready');
    expect(findToolByPath('/heraldry')?.maturity).toBe('release-ready');
    // The AD&D pair, assessed together because they share an artifact kind (#45, #47).
    expect(findToolByPath('/fantasy/adnd/character')?.maturity).toBe('release-ready');
    expect(findToolByPath('/fantasy/adnd/character/build')?.maturity).toBe('release-ready');
  });

  it('leaves every other tool Experimental until it is taken further', () => {
    // A tripwire rather than a rule: raising a tool's level means adding it here, in the same
    // change that earns it. That is the point — a level should not be able to rise as a side
    // effect of editing a catalog entry for some other reason.
    const assessedHigher = [
      '/arms-manufacturer',
      '/chop-shop',
      '/drug',
      '/environment',
      '/planet',
      '/star-system',
      '/region',
      '/fantasy/dungeon',
      '/star-nation',
      '/character',
      '/fantasy/encounter',
      '/fantasy/equipment',
      '/fantasy/equipment-generator',
      '/fantasy/family',
      '/fantasy/merchant',
      '/fantasy/organization',
      '/fantasy/potion-generator',
      '/culture',
      '/fantasy/dcc/character',
      '/fantasy/religion',
      '/fantasy/settlement',
      '/fantasy/treasure-hoard',
      '/fantasy/weapon',
      '/heraldry',
      '/swn/character',
      '/unchartedworlds/character',
      '/velgarth-gifts',
      '/fantasy/adnd/character',
      '/fantasy/adnd/character/build',
      '/species-stats',
      '/word-generator-cheat-sheet',
      '/fantasy/equipment-generator',
      '/fantasy/merchant',
      '/fantasy/potion-generator',
      '/fantasy/weapon',
      '/fantasy/treasure-hoard',
    ];

    const claimingMore = TOOL_CATALOG.filter(
      (tool) => !assessedHigher.includes(tool.path) && tool.maturity !== 'experimental',
    );

    expect(claimingMore.map((tool) => tool.path)).toEqual([]);
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

describe('toolsWithMaturity', () => {
  it('returns the tools at that maturity', () => {
    const releaseReady = toolsWithMaturity('release-ready');

    expect(releaseReady.map((tool) => tool.path).sort()).toEqual([
      '/arms-manufacturer',
      '/character',
      '/chop-shop',
      '/culture',
      '/drug',
      '/environment',
      '/fantasy/adnd/character',
      '/fantasy/adnd/character/build',
      '/fantasy/dcc/character',
      '/fantasy/dungeon',
      '/fantasy/encounter',
      '/fantasy/equipment',
      '/fantasy/equipment-generator',
      '/fantasy/family',
      '/fantasy/merchant',
      '/fantasy/organization',
      '/fantasy/potion-generator',
      '/fantasy/religion',
      '/fantasy/settlement',
      '/fantasy/treasure-hoard',
      '/fantasy/weapon',
      '/heraldry',
      '/planet',
      '/region',
      '/species-stats',
      '/star-nation',
      '/star-system',
      '/swn/character',
      '/unchartedworlds/character',
      '/velgarth-gifts',
      '/word-generator-cheat-sheet',
    ]);
  });

  it('accounts for every tool across the three levels', () => {
    const counted = MATURITIES.reduce(
      (total, maturity) => total + toolsWithMaturity(maturity).length,
      0,
    );

    expect(counted).toBe(TOOL_CATALOG.length);
  });
});

describe('toolMaturityForPath', () => {
  it('returns the maturity recorded for that tool', () => {
    expect(toolMaturityForPath('/heraldry')).toBe('release-ready');
  });

  it('throws on an unknown path rather than assuming a level', () => {
    expect(() => toolMaturityForPath('/nowhere')).toThrow('/nowhere');
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

  it('composes a maturity filter with a genre', () => {
    // The reason maturity is a tag as well as a field: "fantasy tools that will keep my work" is
    // one filter, not a filter plus a second pass.
    const durableFantasy = filterTools({
      includeAllTags: [genreTag('fantasy'), maturityTag('release-ready')],
    });

    expect(durableFantasy.map((tool) => tool.path)).toEqual([
      '/fantasy/adnd/character/build',
      '/character',
      '/fantasy/adnd/character',
      '/fantasy/dcc/character',
      '/heraldry',
      '/velgarth-gifts',
      '/culture',
      '/fantasy/encounter',
      '/fantasy/family',
      '/fantasy/organization',
      '/fantasy/religion',
      '/fantasy/dungeon',
      '/region',
      '/fantasy/settlement',
      '/fantasy/equipment',
      '/fantasy/equipment-generator',
      '/fantasy/merchant',
      '/fantasy/potion-generator',
      '/fantasy/weapon',
      '/fantasy/treasure-hoard',
    ]);
  });

  it('returns the whole catalog for an empty filter', () => {
    expect(filterTools({})).toEqual(TOOL_CATALOG);
  });
});

describe('featuredTools', () => {
  it('finds at least one, so the home page never ships an empty column', () => {
    // The failure this guards is quiet: unfeaturing the last tool leaves a heading with nothing
    // under it, and nothing else in the suite would notice.
    expect(featuredTools().length).toBeGreaterThan(0);
  });

  it('returns only tools the catalog marks featured', () => {
    expect(featuredTools().every((tool) => tool.featured)).toBe(true);
  });

  it('agrees with the featured tag', () => {
    expect(featuredTools().map((tool) => tool.path)).toEqual(
      filterTools({ includeAllTags: [FEATURED_TAG] }).map((tool) => tool.path),
    );
  });

  it('keeps catalog order', () => {
    const catalogOrder = TOOL_CATALOG.filter((tool) => tool.featured).map((tool) => tool.path);

    expect(featuredTools().map((tool) => tool.path)).toEqual(catalogOrder);
  });
});
