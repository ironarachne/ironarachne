import { expect, describe, it } from 'vitest';
import type { Component } from 'svelte';

import { allTools } from '$lib/tools';
import {
  TOOL_PANELS,
  hasToolPanel,
  pathsWithToolPanels,
  toolPanelComponent,
  toolPanelLoader,
} from './tool_panels';

describe('the tool panel registry', () => {
  // No exemption list, and that is the assertion: every tool has a panel, so a missing one is
  // always a mistake rather than possibly a decision. The workshop was the single exception until
  // it stopped being a tool — decision 9 in docs/workshop.md.
  it('has a panel for every tool in the catalog', () => {
    const missing = allTools()
      .filter((tool) => !hasToolPanel(tool.path))
      .map((tool) => tool.path);

    expect(missing).toEqual([]);
  });

  it('holds no entry for the workshop, which is a surface rather than a tool', () => {
    expect(allTools().map((tool) => tool.path)).not.toContain('/workshop');
    expect(hasToolPanel('/workshop')).toBe(false);
  });

  it('registers no path that is not a tool', () => {
    const catalogPaths = new Set<string>(allTools().map((tool) => tool.path));
    const strays = pathsWithToolPanels().filter((path) => !catalogPaths.has(path));

    expect(strays).toEqual([]);
  });

  it('registers each path once', () => {
    const paths = pathsWithToolPanels();

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('registers a distinct loader for each path', () => {
    const loaders = Object.values(TOOL_PANELS);

    expect(new Set(loaders).size).toBe(loaders.length);
  });

  it('is not empty', () => {
    expect(pathsWithToolPanels().length).toBeGreaterThan(0);
  });
});

describe('toolPanelLoader', () => {
  it('returns a loader for a registered tool', () => {
    expect(typeof toolPanelLoader('/culture')).toBe('function');
  });

  it('returns undefined for a route with no panel', () => {
    expect(toolPanelLoader('/release-notes')).toBeUndefined();
  });

  it('returns the registry entry itself, not a wrapper', () => {
    expect(toolPanelLoader('/culture')).toBe(TOOL_PANELS['/culture']);
  });

  it('returns the same loader on repeated calls, so a panel is not rebuilt', () => {
    expect(toolPanelLoader('/heraldry')).toBe(toolPanelLoader('/heraldry'));
  });
});

describe('hasToolPanel', () => {
  it('is true for a registered tool', () => {
    expect(hasToolPanel('/culture')).toBe(true);
  });

  it('is false for a route with no panel', () => {
    expect(hasToolPanel('/release-notes')).toBe(false);
  });

  it('agrees with toolPanelLoader for every catalog tool', () => {
    for (const tool of allTools()) {
      expect(hasToolPanel(tool.path)).toBe(toolPanelLoader(tool.path) !== undefined);
    }
  });
});

describe('pathsWithToolPanels', () => {
  it('lists exactly the registry keys, in registry order', () => {
    expect(pathsWithToolPanels()).toEqual(Object.keys(TOOL_PANELS));
  });

  it('reports every listed path as having a panel', () => {
    for (const path of pathsWithToolPanels()) {
      expect(hasToolPanel(path)).toBe(true);
    }
  });
});

/**
 * Every entry is resolved for real. A registry entry is a string specifier that nothing
 * type-checks against the file system, so a component that is moved, renamed or deleted leaves
 * an entry that only fails when a user opens that panel in a browser. Importing each one here
 * turns that into a failed unit test instead.
 */
describe('every registered panel resolves to a component', () => {
  const entries = Object.entries(TOOL_PANELS) as [
    string,
    NonNullable<(typeof TOOL_PANELS)[keyof typeof TOOL_PANELS]>,
  ][];

  // Each case transforms a whole generator component and its dependency graph on first import.
  // Under `vitest run --coverage` — which is what `npm run verify` runs — v8 instrumentation
  // pushes the heaviest of them (the AD&D character builder, which pulls in PDF export) past
  // the 5s default, so the gate failed intermittently on work that had nothing to do with it.
  it.each(entries)(
    '%s loads a component',
    async (_path, loader) => {
      const module = await loader();

      expect(typeof module.default).toBe('function');
    },
    30_000,
  );
});

describe('toolPanelComponent', () => {
  it('hands back the component it was given', () => {
    const component = (() => undefined) as unknown as Component;

    expect(toolPanelComponent(component)).toBe(component);
  });

  it('lets a registered panel be mounted with a cue', async () => {
    const loader = toolPanelLoader('/culture');
    const module = await loader?.();

    // The point of the cast, exercised: a tool that declares no props is still something the
    // bench can hand a cue to, because Svelte drops a prop a component does not read.
    expect(typeof toolPanelComponent(module!.default)).toBe('function');
  }, 30_000);
});
