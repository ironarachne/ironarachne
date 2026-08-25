import { expect, describe, it } from 'vitest';
import {
  firstToolInBrowseOrder,
  groupToolsByDomain,
  isCompatibleWithGenre,
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
  maturity: 'experimental',
  genres: ['scifi'],
  systems: ['swn'],
});

const adndCharacter = defineTool({
  path: '/fantasy/adnd/character',
  label: 'AD&D 2E Character',
  kind: 'generator',
  domain: 'characters',
  maturity: 'experimental',
  genres: ['fantasy'],
  systems: ['adnd-2e'],
});

const culture = defineTool({
  path: '/culture',
  label: 'Culture',
  kind: 'generator',
  domain: 'factions',
  maturity: 'experimental',
  genres: ['fantasy'],
});

const environment = defineTool({
  path: '/environment',
  label: 'Environment',
  kind: 'generator',
  domain: 'locations',
  maturity: 'experimental',
});

/** Two genres at once, as `/spooky-ship` really is in the catalog. Not in `tools`: it is here to
 * prove that any genre matching is enough, and adding a fifth entry would restate every list
 * expectation below for a case none of them is about. */
const spookyShip = defineTool({
  path: '/spooky-ship',
  label: 'Spooky Ship',
  kind: 'generator',
  domain: 'locations',
  maturity: 'experimental',
  genres: ['scifi', 'horror'],
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

describe('isCompatibleWithGenre', () => {
  it('keeps a tool written for that genre', () => {
    expect(isCompatibleWithGenre(culture, 'fantasy')).toBe(true);
  });

  it('drops a tool written for a different genre', () => {
    expect(isCompatibleWithGenre(culture, 'scifi')).toBe(false);
  });

  it('keeps a tool carrying several genres when any of them matches', () => {
    expect(isCompatibleWithGenre(spookyShip, 'scifi')).toBe(true);
    expect(isCompatibleWithGenre(spookyShip, 'horror')).toBe(true);
    expect(isCompatibleWithGenre(spookyShip, 'fantasy')).toBe(false);
  });

  it('keeps a genre-neutral tool, which suits any setting', () => {
    expect(isCompatibleWithGenre(environment, 'fantasy')).toBe(true);
    expect(isCompatibleWithGenre(environment, 'horror')).toBe(true);
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

  it('filters by genre, keeping genre-neutral tools', () => {
    expect(paths(searchTools(tools, { genre: 'fantasy' }))).toEqual([
      '/fantasy/adnd/character',
      '/culture',
      '/environment',
    ]);
  });

  it('never returns a tool from another genre', () => {
    const found = searchTools(tools, { genre: 'scifi' });

    expect(paths(found)).toEqual(['/swn/character', '/environment']);
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

describe('firstToolInBrowseOrder', () => {
  it('returns the first tool of the first domain, not the first tool given', () => {
    expect(firstToolInBrowseOrder([culture, environment, adndCharacter])).toBe(adndCharacter);
  });

  it('skips domains that have no tools', () => {
    expect(firstToolInBrowseOrder([environment, culture])).toBe(culture);
  });

  it('returns undefined for an empty list', () => {
    expect(firstToolInBrowseOrder([])).toBeUndefined();
  });
});
