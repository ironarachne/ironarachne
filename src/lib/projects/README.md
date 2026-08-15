# Projects

A **project** is the top-level container in the workshop: one campaign, one setting, one world. It
is the context the whole site operates in, and everything a user makes belongs to exactly one.

This library owns the project type, the operations over it, and where it is stored. It is
deliberately thin, because a project is — see [`docs/workshop.md`](../../../docs/workshop.md) — a
namespace and a workspace rather than a document with content of its own. What makes a project
meaningful is the artifacts inside it, and those live in
[`$lib/artifacts`](../artifacts/README.md). The dependency runs one way: this library reaches into
the store to cascade a delete, and the store — which is keyed by project id and knows nothing about
the project set — never reaches back. Both persist to
[`$lib/vault_db`](../vault_db/README.md).

## The type

| Field                     | Notes                                                          |
| ------------------------- | -------------------------------------------------------------- |
| `id`                      | Stable, never reused — including after a delete.               |
| `name`                    | User-facing and editable. **Not** required to be unique.       |
| `description`             | Optional, and absent rather than empty when there is not one.  |
| `tags`                    | Free-form. A `Project` is a [`TaggedItem`](../tags/README.md). |
| `createdAt` / `updatedAt` | Epoch milliseconds, per decision 2 in the design document.     |

## Usage

```typescript
import {
  createProject,
  deleteProject,
  getActiveProject,
  listProjects,
  renameProject,
  setActiveProject,
  updateProject,
} from '$lib/projects';

// Once, at startup: every project into memory, so listing them is synchronous afterwards.
await hydrateProjects();

const created = await createProject({ name: 'Ashfall', tags: ['fantasy'] });
if (!created.ok) {
  // 'quota-exceeded', 'unavailable', or 'storage-failed'. Nothing was stored, and nothing in
  // memory pretends otherwise.
  return;
}
setActiveProject(created.value.id);

await renameProject(created.value.id, 'Ashfall Reborn');
await updateProject(created.value.id, { description: 'A ruined empire', tags: ['grim'] });

const open = getActiveProject(); // the project the workshop is working in
const all = listProjects(); // most recently updated first
await deleteProject(created.value.id);
```

**Reads are synchronous, writes are not.** `listProjects`, `getProject`, and `getActiveProject`
answer from the hydrated index — the copy read into memory once by `hydrateProjects` — so a picker
never blocks a render on a database read. Every write goes to IndexedDB and returns a
`VaultResult`: the index is not updated until the transaction has committed, so memory can never
claim a save the database does not have.

Before hydration the list is empty. That is the same answer a browser with no storage gives, and it
is why `getActiveProject` will not clear a stored selection until it has actually looked: an empty
list means "not read yet" until it doesn't.

`createProject` does **not** open what it created. Opening a project is a decision the caller
states with `setActiveProject`, because a project created in the background must not move the
workshop out from under the user.

An omitted field in `updateProject` is left alone; an empty string or an empty array clears the
field it names. A change that changes nothing leaves `updatedAt` alone too, so reading a project
and writing it back unaltered cannot reorder the list.

## The active project

The workshop operates in exactly one project at a time, so `getActiveProject` resolves rather than
reports. A stored id naming a project that is gone — or no stored id at all — selects the most
recently updated project and persists that choice. It returns `undefined` only when there are no
projects at all.

The selection lives in its own storage scope, apart from the projects themselves. That is not
tidiness: the design document's "what travels and what does not" keeps the last-opened project out
of export files, because restoring a backup should not change which project someone has open, and
two scopes are what let an export take one without the other.

## Storage

Two substrates, and which one holds what is the point of the split:

| Where                                     | Holds                 | Travels in an export |
| ----------------------------------------- | --------------------- | -------------------- |
| The `projects` store in `$lib/vault_db`   | Every project         | Yes — user work      |
| `workshop.active_project` in localStorage | Which project is open | No — device state    |

The open project stayed in `localStorage` deliberately (decision 5 in the design document): it is a
small synchronous pointer rather than user work, losing it costs a click, and keeping it out of the
database is part of what keeps it out of an export.

A stored record that does not validate is dropped when the index is hydrated, and the rest are
kept. That is the one place this library falls short of "nothing is dropped silently", and it is
deliberate: quarantine needs somewhere to put a bad record, which arrives with import in
[#35](https://worktree.ca/ironarachne/ironarachne/issues/35). `toProject` is the single function
that has to change to route them there instead.

## Deleting

`deleteProject` reports a `ProjectDeletion` rather than a boolean, because deleting a project
cascades: the artifacts inside it, their payloads, and its bench go with it, and
`removedArtifactIds` is what lets a caller say so in the user's terms.

**The cascade is one transaction.** Either all of it happened or none of it did, which is the
ownership the domain model draws with a filled diamond. Under `localStorage` the artifacts had to go
first so that an interrupted cascade left an empty project rather than artifacts in a project
nothing lists; that whole class of residue is gone.

Deleting the open project clears the selection instead of leaving it pointing at nothing;
`getActiveProject` then picks whichever project was touched most recently.
