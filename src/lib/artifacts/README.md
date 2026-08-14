# Artifacts

The workshop's store: one place that holds saved content of **any** kind, scoped to a project,
with no hand-maintained list of which kinds exist.

An **artifact** is a saved, named, editable thing a tool produced — a culture the user kept, a
settlement they then rewrote half of, the region those settlements sit in. It belongs to exactly
one project, and nothing else owns it.

This library knows nothing about what is inside a payload. Payload shapes, validation, and
migration belong to [`$lib/artifact_kinds`](../artifact_kinds/README.md), and which kinds this
build has is [`$lib/workshop`](../workshop/README.md)'s catalog. Adding a kind requires no change
here — that is the whole point.

## Why it replaces the per-generator pattern

`culture_saved_state.ts` writes every culture the user has ever kept into one global scope as a
flat array, and `persistent_save/saved_data_catalog.ts` names each savable domain explicitly.
A fourth savable generator means editing the catalog, a union, and a page — and there are
thirty-five tools. Closed issue #7 proposed extending that pattern to all of them; it was closed
because it multiplies exactly this.

## The payload is the truth

An artifact's payload is what the user has. It is **not** a seed to be re-rolled: the moment they
rename a deity, the seed in `provenance` no longer reproduces what is on their screen. Provenance
is recorded so a user can see where a thing came from and deliberately re-roll it, and re-rolling
replaces the payload destructively, on purpose, when asked.

There is no code path in this library that regenerates a payload from provenance, and there must
never be one.

## How it is keyed

Two entries, not one blob per project:

| Entry                                 | Holds                                                  | Rewritten when                     |
| ------------------------------------- | ------------------------------------------------------ | ---------------------------------- |
| `workshop.artifact_index.<projectId>` | Every summary in the project — everything but payloads | Any create, rename, tag, or delete |
| `workshop.artifact.<artifactId>`      | One payload and the version it was written at          | That artifact's content changes    |

This is the decision #33 asks be made deliberately rather than by default, and #45 — the storage
ceiling — is the same decision seen from the other side. The reasoning:

- **One blob per project rewrites everything on every edit.** Renaming a region would re-serialise
  every map and every coat of arms beside it. That is the cost that grows fastest with exactly the
  payloads this application produces.
- **Listing a project is the hot path.** The project view, the reference picker, and the delete
  prompt all want names, kinds, tags, and links — never payloads. Splitting summaries out means
  they read a few kilobytes instead of parsing every map in the project.
- **A payload is only touched when it is opened or saved.** Metadata edits never deserialise one.

The cost is that two entries can disagree, so the writes are ordered to bound what a refused write
can leave behind:

| Operation | Order               | If the second write fails                                |
| --------- | ------------------- | -------------------------------------------------------- |
| Create    | Payload, then index | The payload is removed again; storage is left as it was. |
| Update    | Payload, then index | New content, stale `updatedAt`. Consistent, not wrong.   |
| Delete    | Index, then payload | An unreferenced payload — wasted space, nothing broken.  |

The invariant that falls out: **there is never an index entry pointing at a payload that was never
written.** The residue is always a payload nothing points at.

`payloadVersion` is stored with the payload rather than with the summary, so the number and the
bytes it describes cannot drift apart in a partial write.

### What this does not decide

Whether the workshop measures storage before the browser refuses a write, what the user is told
when it does, and whether `localStorage` is the right substrate at all — all #45, deliberately.
What this library does is refuse to lose a write silently: a refused write propagates its error to
the caller (a `QuotaExceededError`, typically) rather than being swallowed into a `false`.

## Reading and migration

`readArtifact` routes the stored payload through the kind registry, which migrates anything
written at an older `payloadVersion` before handing it back:

```typescript
import { readArtifact } from '$lib/artifacts';
import { ARTIFACT_KINDS } from '$lib/workshop';

const result = readArtifact(ARTIFACT_KINDS, projectId, artifactId);
if (result === undefined) {
  // No artifact has that id in that project.
} else if (result.ok) {
  const { fromSnapshot } = await artifactKindEntry(result.artifact.kind)!.loadCodec();
  const culture = fromSnapshot(result.artifact.payload, new RNG(result.artifact.id));
} else {
  showBroken(result.summary, result.reason, result.message);
}
```

Three things about that shape are deliberate:

- **The registry is a parameter.** The store does not import the catalog, so it has no opinion
  about which kinds exist and a test can hand it two invented ones.
- **A rejection still carries the summary.** A payload this build cannot read is still an artifact
  the user has to be able to see, rename, and export. Dropping it from the listing would be the
  silent loss a local-only application has no server to undo.
- **A migration is not written back.** A read that writes can fail on a full disk, and opening a
  project would then be the operation that filled it. The migrated payload is handed back; the
  user's next save stores it at the current version.

## Operations

| Function                                            | Notes                                                        |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `createArtifact(registry, draft, options?)`         | Validates against the kind first; names it via `nameOf`      |
| `readArtifact(registry, projectId, id)`             | Migrates on read. `undefined` when there is no such artifact |
| `updateArtifactPayload(registry, projectId, id, …)` | What saving an edit does                                     |
| `updateArtifact` / `renameArtifact` / `tagArtifact` | Metadata only; never deserialises a payload                  |
| `setArtifactReferences(projectId, id, …)`           | The links #37 drives                                         |
| `listArtifacts` / `listArtifactsOfKind`             | Summaries, most recently updated first                       |
| `listArtifactReferrers(projectId, id)`              | What points at an artifact                                   |
| `deleteArtifact(projectId, id)`                     | Reports referrers; never refuses                             |
| `deleteProjectArtifacts(projectId)`                 | The cascade behind `deleteProject`                           |

Unknown kinds and invalid payloads come back as a `PayloadResult` rejection rather than an
exception, because they are data. Three things throw, and none of them is a bad record: an artifact
drafted with no project id, an artifact created under an id already in use, and a storage write the
browser refuses.

The id check earns its place because payload keys are global while the index is per project — a
reused id would overwrite another project's payload rather than merely duplicating a row. Ids are
never reused, so it only fires when the caller supplied one, which is import (#35).

## References and deleting

References are ids of other artifacts in the same project, each carrying a required `role` —
a region references its capital and its member settlements and both are `kind: settlement`, so
target kind alone cannot say which is which (decision 1 in `docs/workshop.md`).

The field, the referrer query, and the delete report live here. Populating references, the generic
picker that fills them in, and the prompt that shows referrers before a delete are #37.

`deleteArtifact` **reports and proceeds**. It does not refuse, and it does not repair the links it
breaks: the settled policy is that the user is shown what points at the artifact, may delete it
anyway, and the surviving references are tolerated and rendered as visibly broken. A store that
refused would amount to never deleting anything, which the design document rules out directly.

Cycles are legitimate — a realm's ruler is a character of that realm — so nothing here walks
references transitively.

## Cascade

Deleting a project deletes its artifacts. `$lib/projects` owns that call, which is why the
dependency runs one way: projects reaches into this library, and this library never reaches back.
It is keyed by project id and does not know the project set, so it cannot check that a project
exists — the caller opens a project before saving into it.

## Not yet here

- **Legacy adoption** (#34) — the heraldry, cultures, and religions saved under the old
  per-generator scopes are adopted into a project on first run. Nothing here reads those keys.
- **Export and import** (#35, #47) — the file format, and the vault-sized write that meets the
  storage ceiling head-on.
- **The bench** — `ProjectWorkspace` and panel state are persisted per project, separately, and are
  not artifacts. A layout is not work.
