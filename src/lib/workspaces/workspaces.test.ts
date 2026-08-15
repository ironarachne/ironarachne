import { describe, expect, it } from 'vitest';

import {
  MAX_PANELS,
  emptyWorkspace,
  isPanelOpen,
  normalizePanels,
  panelKey,
  renumberPanels,
  toProjectWorkspace,
  withPanelClosed,
  withPanelMoved,
  withPanelOpened,
  withUnresolvablePanelsDropped,
} from './workspaces';
import { WORKSPACE_VERSION, type PanelState, type ProjectWorkspace } from './workspace_types';

function benchOf(...targets: ({ toolPath: string } | { artifactId: string })[]): ProjectWorkspace {
  return targets.reduce(
    (workspace, target) => withPanelOpened(workspace, target),
    emptyWorkspace('p1'),
  );
}

function keysOf(workspace: ProjectWorkspace): string[] {
  return workspace.panels.map(panelKey);
}

describe('panelKey', () => {
  it('names a tool panel by its path', () => {
    expect(panelKey({ order: 0, toolPath: '/culture' })).toBe('tool:/culture');
  });

  it('names an artifact panel by its id', () => {
    expect(panelKey({ order: 0, artifactId: 'a1' })).toBe('artifact:a1');
  });

  it('cannot collide a tool path with an artifact id', () => {
    expect(panelKey({ toolPath: '/culture' })).not.toBe(panelKey({ artifactId: '/culture' }));
  });
});

describe('emptyWorkspace', () => {
  it('is a bench with nothing on it, at the current version', () => {
    expect(emptyWorkspace('p1')).toEqual({
      projectId: 'p1',
      workspaceVersion: WORKSPACE_VERSION,
      panels: [],
    });
  });
});

describe('renumberPanels', () => {
  it('keeps array position and stamps order onto it', () => {
    const panels: PanelState[] = [
      { order: 9, toolPath: '/culture' },
      { order: 2, toolPath: '/heraldry' },
    ];

    expect(renumberPanels(panels)).toEqual([
      { order: 0, toolPath: '/culture' },
      { order: 1, toolPath: '/heraldry' },
    ]);
  });
});

describe('normalizePanels', () => {
  it('sorts by order and renumbers from zero', () => {
    const panels: PanelState[] = [
      { order: 9, toolPath: '/culture' },
      { order: 2, toolPath: '/heraldry' },
    ];

    expect(normalizePanels(panels)).toEqual([
      { order: 0, toolPath: '/heraldry' },
      { order: 1, toolPath: '/culture' },
    ]);
  });

  it('keeps the first of two panels holding the same thing', () => {
    const panels: PanelState[] = [
      { order: 0, artifactId: 'a1' },
      { order: 1, artifactId: 'a1' },
      { order: 2, toolPath: '/culture' },
    ];

    expect(normalizePanels(panels).map(panelKey)).toEqual(['artifact:a1', 'tool:/culture']);
  });

  it('caps the bench, so a stored workspace cannot exceed the limit', () => {
    const panels = Array.from({ length: MAX_PANELS + 4 }, (_unused, index) => ({
      order: index,
      artifactId: `a${index}`,
    }));

    expect(normalizePanels(panels)).toHaveLength(MAX_PANELS);
  });
});

describe('withPanelOpened', () => {
  it('adds a panel at the right-hand end', () => {
    expect(keysOf(benchOf({ toolPath: '/culture' }, { artifactId: 'a1' }))).toEqual([
      'tool:/culture',
      'artifact:a1',
    ]);
  });

  it('returns the same workspace when the panel is already open', () => {
    const bench = benchOf({ toolPath: '/culture' });

    expect(withPanelOpened(bench, { toolPath: '/culture' })).toBe(bench);
  });

  it('does not move a panel that is reopened', () => {
    const bench = benchOf({ toolPath: '/culture' }, { toolPath: '/heraldry' });

    expect(keysOf(withPanelOpened(bench, { toolPath: '/culture' }))).toEqual([
      'tool:/culture',
      'tool:/heraldry',
    ]);
  });

  it('drops the leftmost panel to make room on a full bench', () => {
    const full = Array.from({ length: MAX_PANELS }, (_unused, index) => ({
      artifactId: `a${index}`,
    })).reduce((workspace, target) => withPanelOpened(workspace, target), emptyWorkspace('p1'));

    const opened = withPanelOpened(full, { toolPath: '/culture' });

    expect(opened.panels).toHaveLength(MAX_PANELS);
    expect(keysOf(opened)[0]).toBe('artifact:a1');
    expect(keysOf(opened).at(-1)).toBe('tool:/culture');
  });
});

describe('isPanelOpen', () => {
  it('is true for something on the bench and false for anything else', () => {
    const bench = benchOf({ artifactId: 'a1' });

    expect(isPanelOpen(bench, { artifactId: 'a1' })).toBe(true);
    expect(isPanelOpen(bench, { artifactId: 'a2' })).toBe(false);
    expect(isPanelOpen(bench, { toolPath: '/culture' })).toBe(false);
  });
});

describe('withPanelClosed', () => {
  it('removes the panel and renumbers what is left', () => {
    const bench = benchOf(
      { toolPath: '/culture' },
      { artifactId: 'a1' },
      { toolPath: '/heraldry' },
    );

    const closed = withPanelClosed(bench, { artifactId: 'a1' });

    expect(closed.panels).toEqual([
      { order: 0, toolPath: '/culture' },
      { order: 1, toolPath: '/heraldry' },
    ]);
  });

  it('changes nothing when the panel is not open', () => {
    const bench = benchOf({ toolPath: '/culture' });

    expect(withPanelClosed(bench, { artifactId: 'a1' }).panels).toEqual(bench.panels);
  });
});

describe('withPanelMoved', () => {
  const bench = benchOf({ toolPath: '/culture' }, { artifactId: 'a1' }, { toolPath: '/heraldry' });

  it('swaps a panel with its left neighbour', () => {
    expect(keysOf(withPanelMoved(bench, { artifactId: 'a1' }, -1))).toEqual([
      'artifact:a1',
      'tool:/culture',
      'tool:/heraldry',
    ]);
  });

  it('swaps a panel with its right neighbour', () => {
    expect(keysOf(withPanelMoved(bench, { artifactId: 'a1' }, 1))).toEqual([
      'tool:/culture',
      'tool:/heraldry',
      'artifact:a1',
    ]);
  });

  it('stops at the ends rather than wrapping around', () => {
    expect(withPanelMoved(bench, { toolPath: '/culture' }, -1)).toBe(bench);
    expect(withPanelMoved(bench, { toolPath: '/heraldry' }, 1)).toBe(bench);
  });

  it('changes nothing when the panel is not open', () => {
    expect(withPanelMoved(bench, { artifactId: 'missing' }, 1)).toBe(bench);
  });
});

describe('withUnresolvablePanelsDropped', () => {
  it('drops what the caller cannot resolve and renumbers the rest', () => {
    const bench = benchOf({ toolPath: '/culture' }, { artifactId: 'gone' }, { artifactId: 'a1' });

    const kept = withUnresolvablePanelsDropped(bench, (panel) => panel.artifactId !== 'gone');

    expect(kept.panels).toEqual([
      { order: 0, toolPath: '/culture' },
      { order: 1, artifactId: 'a1' },
    ]);
  });
});

describe('toProjectWorkspace', () => {
  const stored = {
    projectId: 'p1',
    workspaceVersion: WORKSPACE_VERSION,
    panels: [
      { order: 1, artifactId: 'a1' },
      { order: 0, toolPath: '/culture' },
    ],
  };

  it('reads a stored bench back, normalized', () => {
    expect(toProjectWorkspace(stored)).toEqual({
      projectId: 'p1',
      workspaceVersion: WORKSPACE_VERSION,
      panels: [
        { order: 0, toolPath: '/culture' },
        { order: 1, artifactId: 'a1' },
      ],
    });
  });

  it.each([
    ['not an object', 'nonsense'],
    ['an array', []],
    ['null', null],
    ['missing its project', { ...stored, projectId: undefined }],
    ['owned by no project', { ...stored, projectId: '' }],
    ['written at another version', { ...stored, workspaceVersion: WORKSPACE_VERSION + 1 }],
    ['carrying panels that are not a list', { ...stored, panels: {} }],
  ])('rejects a record that is %s', (_case, value) => {
    expect(toProjectWorkspace(value)).toBeUndefined();
  });

  it.each([
    ['holds both a tool and an artifact', { order: 0, toolPath: '/culture', artifactId: 'a1' }],
    ['holds neither', { order: 0 }],
    ['has no numeric order', { toolPath: '/culture' }],
    ['has an order that is not finite', { order: Number.NaN, toolPath: '/culture' }],
    ['names an empty tool path', { order: 0, toolPath: '' }],
  ])('drops a panel that %s, keeping the rest', (_case, panel) => {
    const workspace = toProjectWorkspace({
      ...stored,
      panels: [panel, { order: 5, toolPath: '/heraldry' }],
    });

    expect(workspace?.panels).toEqual([{ order: 0, toolPath: '/heraldry' }]);
  });
});
