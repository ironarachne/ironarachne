# Workspaces

A project's **bench**: which panels are open in the workshop, in what order, so reopening a project
restores what was left on it.

This is the `ProjectWorkspace` and `PanelState` half of the domain model in
[docs/workshop.md](../../../docs/workshop.md), and it is persisted alongside projects and artifacts
in the `workspaces` object store of [`$lib/vault_db`](../vault_db/README.md).

## A bench is not work

Everything odd about this library follows from one line of decision 3 in the design document: a
workspace is persisted, and it may be dropped.

- **A workspace that cannot be read resets to an empty bench.** `readProjectWorkspace` never
  rejects and never returns `undefined` — no stored bench, an unreadable shape, and a database that
  would not answer are one answer to its caller: open the project with nothing on it.
- **A panel bound to something that is gone is dropped silently.** That is the deliberate carve-out
  from invariant 2, which protects _work_. Quarantining a layout would be absurd.
- **There is no migration chain.** `WORKSPACE_VERSION` is a fence, not a ladder: panel shape churns
  faster than the file format or any payload, and the answer to an old one is a fresh bench.

So writes here are the one place in the vault where a caller may reasonably shrug off a failed
result.

## A panel is what it holds

`PanelState` carries no id. A panel holds a tool or an artifact — never both, never neither — and
that content is its identity, which `panelKey` spells out. Opening something already on the bench
moves to it rather than putting a second copy beside the first, because two panels showing one tool
are two copies of one thing with separately drifting state.

A **tool** goes on at the left-hand end and an **artifact** at the right: the instrument leads, and
the references it is being built from sit beside it rather than in front of it. Placement happens on
the way in only — nothing re-seats a panel afterwards, so `withPanelMoved` is not fighting a rule.

`MAX_PANELS` caps the bench. A full bench drops its leftmost panel to make room rather than
refusing, so a user is never left working out which panel is in the way of the one they asked for —
the oldest panel goes, whichever end the arriving one lands at.

## Usage

```ts
import {
  readProjectWorkspace,
  withPanelOpened,
  withUnresolvablePanelsDropped,
  writeProjectWorkspace,
} from '$lib/workspaces';

const stored = await readProjectWorkspace(project.id);
// Whatever the bench named must still exist; this library deliberately does not know what does.
const bench = withUnresolvablePanelsDropped(stored, (panel) =>
  panel.toolPath === undefined ? artifactIds.has(panel.artifactId) : hasToolPanel(panel.toolPath),
);

await writeProjectWorkspace(withPanelOpened(bench, { toolPath: '/culture' }));
```

Every function returning a workspace returns a **normalized** one: panels sorted, deduplicated, and
renumbered from 0, so a caller can index the array and trust `order` to agree with it.
