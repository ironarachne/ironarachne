# Projects

A **project** is the top-level container in the workshop: one campaign, one setting, one world. It
is the context the whole site operates in, and everything a user makes belongs to exactly one.

This library owns the project type, the operations over it, and where it is stored. It is
deliberately thin, because a project is — see [`docs/workshop.md`](../../../docs/workshop.md) — a
namespace and a workspace rather than a document with content of its own. What makes a project
meaningful is the artifacts inside it, and those are [#33](https://worktree.ca/ironarachne/ironarachne/issues/33)'s
job, not this one's.

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

const project = createProject({ name: 'Ashfall', tags: ['fantasy'] });
setActiveProject(project.id);

renameProject(project.id, 'Ashfall Reborn');
updateProject(project.id, { description: 'A ruined empire', tags: ['fantasy', 'grim'] });

const open = getActiveProject(); // the project the workshop is working in
const all = listProjects(); // most recently updated first
deleteProject(project.id);
```

Every operation reads and writes storage on each call, so there is no in-memory state to keep in
step and a reload is simply the next read.

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

Both scopes go through
[`$lib/persistent_save/scoped_local_storage`](../persistent_save/README.md), which owns the JSON
envelope, the `ironarachne.save.v1.` prefix, and behaving sanely where `localStorage` is absent.

| Scope                     | Holds                 | Travels in an export |
| ------------------------- | --------------------- | -------------------- |
| `workshop.projects`       | Every project         | Yes — user work      |
| `workshop.active_project` | Which project is open | No — device state    |

Each carries its own `payloadVersion` and is validated on read. Absent, malformed, and
wrong-version payloads all read as a well-defined empty result rather than throwing, per
requirement 3.3 of the readiness spec — this is a local-only application, and there is no server to
repair a bad read after the fact.

Individual records that fail validation are dropped from the read and the rest are kept. That is
the one place this library falls short of "nothing is dropped silently", and it is deliberate:
quarantine needs somewhere to put a bad record, which arrives with import in
[#35](https://worktree.ca/ironarachne/ironarachne/issues/35). `readProjectsPayload` is the single
function that has to change to route them there instead.

## Deleting

`deleteProject` returns a `ProjectDeletion` rather than a boolean, because deleting a project grows
a cascade as soon as artifacts exist: the artifacts inside it, and the bench state that referenced
them, go with it. Until then `removedArtifactIds` is always empty, and the shape is what lets a
caller report the delete honestly once it is not.

Deleting the open project clears the selection instead of leaving it pointing at nothing;
`getActiveProject` then picks whichever project was touched most recently.
