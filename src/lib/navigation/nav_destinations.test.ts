import { describe, expect, it } from 'vitest';

import { allTools } from '$lib/tools';
import { NAV_DESTINATIONS, activeDestination } from './nav_destinations';
import type { NavDestination } from './nav_types';

describe('NAV_DESTINATIONS', () => {
  it('holds exactly the six destinations the shell is capped at', () => {
    // The cap is decision 5 in docs/app-shell.md, and this is what makes adding a seventh a
    // deliberate act rather than a quiet one. It read five until #105 added the tool catalog,
    // which is why the assertion is the list and not the length: raising the number has to be a
    // line someone wrote on purpose.
    expect(NAV_DESTINATIONS.map((destination) => destination.id)).toEqual([
      'home',
      'workshop',
      'tools',
      'projects',
      'vault',
      'release-notes',
    ]);
  });

  it('gives every destination a unique path', () => {
    const paths = NAV_DESTINATIONS.map((destination) => destination.path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every destination a label', () => {
    const unlabelled = NAV_DESTINATIONS.filter((destination) => destination.label.trim() === '');

    expect(unlabelled).toEqual([]);
  });

  it('lists no tool routes', () => {
    // An individual tool appearing here would be the old navigation growing back one entry at a
    // time. Checked against the catalog rather than against a path prefix: `/tools` is a
    // destination now, so "does this look like a tool route" is no longer a question a prefix can
    // answer, and the catalog is the only thing that knows what a tool is.
    const catalogPaths = new Set(allTools().map((tool) => tool.path));
    const toolish = NAV_DESTINATIONS.filter((destination) => catalogPaths.has(destination.path));

    expect(toolish).toEqual([]);
  });
});

describe('activeDestination', () => {
  it('matches a destination exactly', () => {
    expect(activeDestination('/workshop')?.id).toBe('workshop');
  });

  it('matches through the trailing slash the router reports', () => {
    // `trailingSlash: 'always'` in the root layout means this is the shape a real pathname has,
    // so an implementation that only handled the bare form would light nothing up in the browser
    // while passing every other test here.
    expect(activeDestination('/workshop/')?.id).toBe('workshop');
  });

  it('matches home only exactly', () => {
    expect(activeDestination('/')?.id).toBe('home');
    expect(activeDestination('/workshop')?.id).not.toBe('home');
  });

  it('matches a path nested under a destination', () => {
    expect(activeDestination('/vault/some-artifact/')?.id).toBe('vault');
  });

  it('prefers the longest match', () => {
    // Real route ids, because `RouteId` is the union of them and a made-up path does not type.
    // Nesting one destination under another is not how NAV_DESTINATIONS is arranged today, which
    // is exactly why it is worth pinning: the rule has no other test to fall back on.
    const destinations: NavDestination[] = [
      { id: 'outer', label: 'Outer', path: '/fantasy' },
      { id: 'inner', label: 'Inner', path: '/fantasy/dcc' },
    ];

    expect(activeDestination('/fantasy/dcc/character/', '', destinations)?.id).toBe('inner');
    expect(activeDestination('/fantasy/settlement/', '', destinations)?.id).toBe('outer');
  });

  it('strips a base path before matching', () => {
    expect(activeDestination('/ironarachne/vault/', '/ironarachne')?.id).toBe('vault');
  });

  it('treats a base path that is the whole pathname as home', () => {
    expect(activeDestination('/ironarachne', '/ironarachne')?.id).toBe('home');
  });

  it('returns nothing for a tool route', () => {
    // Decision 1: tool routes keep their URLs but are not destinations, so nothing in the sidebar
    // should light up on one.
    expect(activeDestination('/culture/')).toBeUndefined();
  });
});
