import { describe, expect, it } from 'vitest';

import { GENRES, TOOL_CATALOG, toolGenres } from '$lib/tools';

import { resolveGenreSkin } from './genre_skin';

describe('resolveGenreSkin', () => {
  it('takes the project genre over the route it is on', () => {
    // The project is the user's own answer to what they are working on, and it is the more
    // specific of the two: a fantasy tool opened inside a science-fiction project is being used
    // *for* that science-fiction project.
    expect(resolveGenreSkin('scifi', '/fantasy/potion-generator')).toBe('scifi');
  });

  it('falls back to the route when no project genre answers', () => {
    expect(resolveGenreSkin(undefined, '/fantasy/potion-generator')).toBe('fantasy');
  });

  it('resolves to nothing when neither answers', () => {
    // The base appearance, which is the design rather than a degraded mode.
    expect(resolveGenreSkin(undefined, '/projects')).toBeUndefined();
    expect(resolveGenreSkin(undefined, null)).toBeUndefined();
    expect(resolveGenreSkin(undefined, undefined)).toBeUndefined();
  });

  it('gives a genre-neutral tool no skin', () => {
    // `/environment`, `/language`, `/workshop` and `/word-generator-cheat-sheet` carry no genre,
    // and docs/workshop.md is explicit that this is deliberate rather than an omission.
    expect(resolveGenreSkin(undefined, '/environment')).toBeUndefined();
    expect(resolveGenreSkin(undefined, '/language')).toBeUndefined();
  });

  it('gives a tool with two genres no skin from its route', () => {
    // `/spooky-ship` is `scifi` and `horror`. Picking the first entry is a coin toss dressed as a
    // rule — ambiguity is not a look. Before #118 the page hard-coded `theme="scifi"`, which is
    // exactly that coin toss.
    const spookyShip = TOOL_CATALOG.find((tool) => tool.path === '/spooky-ship');
    expect(toolGenres(spookyShip!).length).toBeGreaterThan(1);

    expect(resolveGenreSkin(undefined, '/spooky-ship')).toBeUndefined();
  });

  it('still skins a two-genre route when a project answers', () => {
    // The ambiguity is in the route, not in the project.
    expect(resolveGenreSkin('horror', '/spooky-ship')).toBe('horror');
  });

  it('answers for every genre, including one with no stylesheet yet', () => {
    // `horror` is in GENRES and has no skin file until #122. It resolves like any other and
    // renders as base, which is why this returns a genre rather than a stylesheet.
    for (const genre of GENRES) {
      expect(resolveGenreSkin(genre, null)).toBe(genre);
    }
  });

  it('ignores a route that names no tool', () => {
    expect(resolveGenreSkin(undefined, '/not-a-tool')).toBeUndefined();
  });

  it('agrees with the catalog for every single-genre tool', () => {
    // The sweep that would have caught the four disagreements #118 found between the catalog and
    // the hand-written `theme` prop it replaces.
    for (const tool of TOOL_CATALOG) {
      const genres = toolGenres(tool);
      const expected = genres.length === 1 ? genres[0] : undefined;

      expect(resolveGenreSkin(undefined, tool.path), tool.path).toBe(expected);
    }
  });
});
