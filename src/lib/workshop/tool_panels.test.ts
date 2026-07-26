import { expect, describe, it } from 'vitest';
import { allTools } from '$lib/tools';
import { hasToolPanel, pathsWithToolPanels, toolPanelLoader } from './tool_panels';

describe('the tool panel registry', () => {
  it('has a panel for every tool in the catalog', () => {
    const missing = allTools()
      .filter((tool) => !hasToolPanel(tool.path))
      .map((tool) => tool.path);

    expect(missing).toEqual([]);
  });

  it('registers no path that is not a tool', () => {
    const catalogPaths = new Set<string>(allTools().map((tool) => tool.path));
    const strays = pathsWithToolPanels().filter((path) => !catalogPaths.has(path));

    expect(strays).toEqual([]);
  });
});

describe('toolPanelLoader', () => {
  it('returns a loader for a registered tool', () => {
    expect(typeof toolPanelLoader('/culture')).toBe('function');
  });

  it('returns undefined for a route with no panel', () => {
    expect(toolPanelLoader('/changelog')).toBeUndefined();
  });
});
