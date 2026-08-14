import { expect, describe, it } from 'vitest';
import { applyTagFilter } from '$lib/tags';
import {
  defineTool,
  genreDisplayName,
  genreTag,
  genresOf,
  hasGenre,
  hasSystem,
  systemDisplayName,
  systemTag,
  systemsOf,
  toolGenres,
  toolSystems,
} from './tools';
import type { Tool, ToolDefinition } from './tool_types';

const swnCharacter: ToolDefinition = {
  path: '/swn/character',
  label: 'Stars Without Number Character',
  kind: 'generator',
  domain: 'characters',
  genres: ['scifi'],
  systems: ['swn'],
  tags: ['character'],
};

const environment: ToolDefinition = {
  path: '/environment',
  label: 'Environment',
  kind: 'generator',
  domain: 'locations',
};

describe('genreTag', () => {
  it('namespaces the genre', () => {
    expect(genreTag('fantasy')).toBe('genre:fantasy');
  });
});

describe('systemTag', () => {
  it('namespaces the system', () => {
    expect(systemTag('adnd-2e')).toBe('system:adnd-2e');
  });
});

describe('defineTool', () => {
  it('keeps the identifying fields', () => {
    const tool = defineTool(swnCharacter);

    expect(tool.path).toBe('/swn/character');
    expect(tool.label).toBe('Stars Without Number Character');
    expect(tool.kind).toBe('generator');
    expect(tool.domain).toBe('characters');
  });

  it('expands genres and systems into namespaced tags, keeping free-form tags', () => {
    const tool = defineTool(swnCharacter);

    expect(tool.tags).toEqual(['genre:scifi', 'system:swn', 'character']);
  });

  it('gives a tool with no genre or system an empty tag list', () => {
    const tool = defineTool(environment);

    expect(tool.tags).toEqual([]);
  });

  it('expands every genre of a multi-genre tool', () => {
    const tool = defineTool({
      path: '/spooky-ship',
      label: 'Spooky Starship',
      kind: 'generator',
      domain: 'objects',
      genres: ['scifi', 'horror'],
    });

    expect(tool.tags).toEqual(['genre:scifi', 'genre:horror']);
  });
});

describe('toolGenres', () => {
  it('reads the genres back out of the tags', () => {
    expect(toolGenres(defineTool(swnCharacter))).toEqual(['scifi']);
  });

  it('returns nothing for a genre-agnostic tool', () => {
    expect(toolGenres(defineTool(environment))).toEqual([]);
  });

  it('ignores free-form tags that merely contain the word genre', () => {
    const tool: Tool = {
      path: '/environment',
      label: 'Environment',
      kind: 'generator',
      domain: 'locations',
      tags: ['genre', 'subgenre:weird'],
    };

    expect(toolGenres(tool)).toEqual([]);
  });
});

describe('toolSystems', () => {
  it('reads the systems back out of the tags', () => {
    expect(toolSystems(defineTool(swnCharacter))).toEqual(['swn']);
  });

  it('returns nothing for a system-agnostic tool', () => {
    expect(toolSystems(defineTool(environment))).toEqual([]);
  });
});

describe('hasGenre', () => {
  it('is true for a genre the tool carries', () => {
    expect(hasGenre(defineTool(swnCharacter), 'scifi')).toBe(true);
  });

  it('is false for a genre the tool does not carry', () => {
    expect(hasGenre(defineTool(swnCharacter), 'fantasy')).toBe(false);
  });
});

describe('hasSystem', () => {
  it('is true for a system the tool targets', () => {
    expect(hasSystem(defineTool(swnCharacter), 'swn')).toBe(true);
  });

  it('is false for a system-agnostic tool', () => {
    expect(hasSystem(defineTool(environment), 'swn')).toBe(false);
  });
});

describe('genresOf', () => {
  it('returns distinct genres in display order', () => {
    const tools = [
      defineTool({ ...environment, genres: ['horror'] }),
      defineTool(swnCharacter),
      defineTool({ ...environment, genres: ['fantasy', 'scifi'] }),
    ];

    expect(genresOf(tools)).toEqual(['fantasy', 'scifi', 'horror']);
  });

  it('returns nothing when no tool has a genre', () => {
    expect(genresOf([defineTool(environment)])).toEqual([]);
  });
});

describe('systemsOf', () => {
  it('returns distinct systems in display order', () => {
    const tools = [
      defineTool({ ...environment, systems: ['swn'] }),
      defineTool({ ...environment, systems: ['adnd-2e', 'swn'] }),
    ];

    expect(systemsOf(tools)).toEqual(['adnd-2e', 'swn']);
  });
});

describe('tool tags', () => {
  it('work with the shared tag filter', () => {
    const tools = [defineTool(swnCharacter), defineTool({ ...environment, genres: ['fantasy'] })];

    const scifiTools = applyTagFilter(tools, { includeAllTags: [genreTag('scifi')] });

    expect(scifiTools.map((tool) => tool.path)).toEqual(['/swn/character']);
  });

  it('let genre and system filters compose', () => {
    const tools = [
      defineTool(swnCharacter),
      defineTool({ ...swnCharacter, path: '/spooky-ship', systems: undefined }),
    ];

    const genericScifi = applyTagFilter(tools, {
      includeAllTags: [genreTag('scifi')],
      excludeTags: [systemTag('swn')],
    });

    expect(genericScifi.map((tool) => tool.path)).toEqual(['/spooky-ship']);
  });
});

describe('genreDisplayName', () => {
  it('returns prose for a genre', () => {
    expect(genreDisplayName('scifi')).toBe('Science Fiction');
  });
});

describe('systemDisplayName', () => {
  it('returns prose for a system', () => {
    expect(systemDisplayName('adnd-2e')).toBe('AD&D 2E');
  });
});
