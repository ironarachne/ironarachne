import { expect, describe, it } from 'vitest';
import {
  groupToolsByDomain,
  isCompatibleWithSystem,
  matchesToolQuery,
  searchTools,
} from './tool_search';
import { defineTool } from './tools';
import type { Tool } from './tool_types';

const swnCharacter = defineTool({
  path: '/swn/character',
  label: 'Stars Without Number Character',
  kind: 'generator',
  domain: 'characters',
  genres: ['scifi'],
  systems: ['swn'],
});

const adndCharacter = defineTool({
  path: '/fantasy/adnd/character',
  label: 'AD&D 2E Character',
  kind: 'generator',
  domain: 'characters',
  genres: ['fantasy'],
  systems: ['adnd-2e'],
});

const culture = defineTool({
  path: '/culture',
  label: 'Culture',
  kind: 'generator',
  domain: 'factions',
  genres: ['fantasy'],
});

const environment = defineTool({
  path: '/environment',
  label: 'Environment',
  kind: 'generator',
  domain: 'locations',
});

const tools: Tool[] = [swnCharacter, adndCharacter, culture, environment];

const paths = (found: Tool[]) => found.map((tool) => tool.path);

describe('matchesToolQuery', () => {
  it('matches a substring of the label regardless of case', () => {
    expect(matchesToolQuery(culture, 'CULT')).toBe(true);
  });

  it('does not match a label that lacks the term', () => {
    expect(matchesToolQuery(culture, 'starship')).toBe(false);
  });

  it('requires every term, in any order', () => {
    expect(matchesToolQuery(swnCharacter, 'char star')).toBe(true);
    expect(matchesToolQuery(swnCharacter, 'char dwarf')).toBe(false);
  });

  it('matches everything on a blank query', () => {
    expect(matchesToolQuery(culture, '')).toBe(true);
    expect(matchesToolQuery(culture, '   ')).toBe(true);
  });
});

describe('isCompatibleWithSystem', () => {
  it('keeps a tool written for that system', () => {
    expect(isCompatibleWithSystem(swnCharacter, 'swn')).toBe(true);
  });

  it('drops a tool written for a different system', () => {
    expect(isCompatibleWithSystem(adndCharacter, 'swn')).toBe(false);
  });

  it('keeps a system-neutral tool, which mixes nothing', () => {
    expect(isCompatibleWithSystem(culture, 'swn')).toBe(true);
    expect(isCompatibleWithSystem(environment, 'adnd-2e')).toBe(true);
  });
});

describe('searchTools', () => {
  it('returns everything when no criteria are given', () => {
    expect(searchTools(tools, {})).toEqual(tools);
  });

  it('filters by name', () => {
    expect(paths(searchTools(tools, { query: 'character' }))).toEqual([
      '/swn/character',
      '/fantasy/adnd/character',
    ]);
  });

  it('filters by genre', () => {
    expect(paths(searchTools(tools, { genre: 'fantasy' }))).toEqual([
      '/fantasy/adnd/character',
      '/culture',
    ]);
  });

  it('excludes tools with no genre when a genre is required', () => {
    expect(paths(searchTools(tools, { genre: 'scifi' }))).toEqual(['/swn/character']);
  });

  it('filters by system, keeping system-neutral tools', () => {
    expect(paths(searchTools(tools, { system: 'swn' }))).toEqual([
      '/swn/character',
      '/culture',
      '/environment',
    ]);
  });

  it('never returns a tool from another system', () => {
    const found = searchTools(tools, { system: 'adnd-2e' });

    expect(paths(found)).not.toContain('/swn/character');
  });

  it('applies name, genre, and system together', () => {
    const found = searchTools(tools, { query: 'c', genre: 'fantasy', system: 'adnd-2e' });

    expect(paths(found)).toEqual(['/fantasy/adnd/character', '/culture']);
  });

  it('returns nothing when the criteria cannot all be met', () => {
    expect(searchTools(tools, { query: 'character', system: 'dcc' })).toEqual([]);
  });

  it('treats a blank query as no query', () => {
    expect(searchTools(tools, { query: '  ' })).toEqual(tools);
  });
});

describe('groupToolsByDomain', () => {
  it('groups tools under their domain in navigation order', () => {
    const groups = groupToolsByDomain(tools);

    expect(groups.map((group) => group.domain)).toEqual(['characters', 'factions', 'locations']);
    expect(groups[0].heading).toBe('Characters & People');
    expect(paths(groups[0].tools)).toEqual(['/swn/character', '/fantasy/adnd/character']);
  });

  it('leaves out domains with no matching tool', () => {
    const groups = groupToolsByDomain([environment]);

    expect(groups.map((group) => group.domain)).toEqual(['locations']);
  });

  it('returns nothing for an empty list', () => {
    expect(groupToolsByDomain([])).toEqual([]);
  });
});
