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

One record per artifact, in two stores of [`$lib/vault_db`](../vault_db/README.md):

| Store               | Key          | Holds                                    | Rewritten when                              |
| ------------------- | ------------ | ---------------------------------------- | ------------------------------------------- |
| `artifacts`         | `id`         | The summary — everything but the payload | That artifact's metadata or content changes |
| `artifact_payloads` | `artifactId` | One payload                              | That artifact's content changes             |

The summary carries `payloadVersion` and `byteSize` alongside the name, kind, tags, and references.
`by_projectId` indexes the summaries, which is how a project is listed.

- **Listing a project is the hot path.** The project view, the reference picker, and the delete
  prompt all want names, kinds, tags, and links — never payloads. Splitting payloads out means a
  listing reads a few kilobytes instead of every map in the project.
- **A payload is only touched when it is opened or saved.** Metadata edits never deserialise one,
  and renaming a region rewrites a few hundred bytes rather than the map inside it.
- **Editing one artifact does not rewrite its neighbours.** The per-project array of summaries that
  #33 recorded as an open question existed only because `localStorage` has no query; an index
  removes the need for it. That is decision 5 in the design document.

**The two records go in one transaction**, so `payloadVersion`, `byteSize`, and the bytes they
describe cannot end up disagreeing, and a refused write leaves nothing behind at all — no summary
naming a payload that was never written, and no payload nothing points at. Under `localStorage`
this had to be a careful ordering of two writes that bounded the residue; here there is none.

### What this does not decide

What the user is told when a write is refused, when a warning appears, and how usage is displayed —
all storage-status work, deliberately. What this library does is refuse to lose a write silently:
**every write returns a result**, carrying `quota-exceeded`, `unavailable`, or `storage-failed` and
a message, and the caller has to look at it.

## Reading and migration

`readArtifact` routes the stored payload through the kind registry, which migrates anything
written at an older `payloadVersion` before handing it back:

```typescript
import { readArtifact } from '$lib/artifacts';
import { ARTIFACT_KINDS } from '$lib/workshop';

const result = await readArtifact(ARTIFACT_KINDS, projectId, artifactId);
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
- **A rejection still carries the summary.** A payload this build cannot read — or could not reach,
  because the database refused — is still an artifact the user has to be able to see, rename, and
  export. Dropping it from the listing would be the silent loss a local-only application has no
  server to undo.
- **A migration is not written back.** A read that writes can fail on a full disk, and opening a
  project would then be the operation that filled it. The migrated payload is handed back; the
  user's next save stores it at the current version.

## Operations

| Function                                            | Sync? | Notes                                                                         |
| --------------------------------------------------- | ----- | ----------------------------------------------------------------------------- |
| `hydrateArtifacts()`                                | async | Once at startup; every summary into memory                                    |
| `listArtifacts` / `listArtifactsOfKind`             | sync  | Summaries, most recently updated first                                        |
| `getArtifactSummary(projectId, id)`                 | sync  | From the hydrated index                                                       |
| `listArtifactReferrers(projectId, id)`              | sync  | What points at an artifact                                                    |
| `listArtifactBacklinks(projectId, id)`              | sync  | The same, grouped by referrer, with the roles                                 |
| `resolveArtifactReferences(projectId, summary)`     | sync  | Each reference with its target, or nothing where it dangles                   |
| `brokenArtifactReferences` / `hasBroken…`           | sync  | References pointing at something that is gone                                 |
| `collectReferencedArtifacts(projectId, id)`         | sync  | Everything reachable, breadth-first and cycle-tolerant                        |
| `createArtifact(registry, draft, options?)`         | async | Validates against the kind first; names it via `nameOf`                       |
| `readArtifact(registry, projectId, id)`             | async | Reads the payload and migrates it. `undefined` when there is no such artifact |
| `updateArtifactPayload(registry, projectId, id, …)` | async | What saving an edit does                                                      |
| `updateArtifact` / `renameArtifact` / `tagArtifact` | async | Metadata only; never deserialises a payload                                   |
| `setArtifactReferences(projectId, id, …)`           | async | Replaces an artifact's links                                                  |
| `deleteArtifact(projectId, id)`                     | async | Reports referrers; never refuses                                              |
| `forgetProjectArtifacts(projectId)`                 | sync  | Index maintenance after `$lib/projects` cascades a delete                     |

**Reads are synchronous and writes are not.** Listing answers from the hydrated index — a cache,
rebuilt rather than repaired, that is not updated until the transaction behind a write has
committed. Before hydration a listing is empty, which is the same answer a browser with no storage
gives, so a project view never blocks a render on a database read. Payloads stay lazy: nothing
holds every map in a project resident in memory.

Unknown kinds, invalid payloads, and refused writes all come back as a rejection rather than an
exception, because they are outcomes a caller has to report. Two things throw, and neither is a bad
record: an artifact drafted with no project id, and an artifact created under an id already in use.

The id check earns its place because summaries are keyed by their own id across the whole vault — a
reused id would overwrite another project's artifact rather than merely duplicating a row. Ids are
never reused, so it only fires when the caller supplied one, which is import (#35).

## References and deleting

References are ids of other artifacts in the same project, each carrying a required `role` —
a region references its capital and its member settlements and both are `kind: settlement`, so
target kind alone cannot say which is which (decision 1 in `docs/workshop.md`).

The field, both directions of the query, and the delete report live here. What fills the field in
is `SavedArtifactPicker`, and what rebuilds a referenced artifact into a value a generator can use
is `loadArtifactValue` in [`$lib/workshop`](../workshop/README.md) — neither belongs to a store
that deliberately does not know what a payload is.

**A reference resolves or it does not, and both are ordinary.** `resolveArtifactReferences` hands
back each reference with its target or with nothing, which is what lets a panel draw
"capital: missing" instead of failing to draw. Nothing here throws for a target that is gone, and
no consumer of these functions may treat one as an error path. A target held by another project
never resolves either: references are project-local, and resolving one across the boundary would
invent an edge the model does not have.

`deleteArtifact` **reports and proceeds**. It does not refuse, and it does not repair the links it
breaks: the settled policy is that the user is shown what points at the artifact, may delete it
anyway, and the surviving references are tolerated and rendered as visibly broken. A store that
refused would amount to never deleting anything, which the design document rules out directly.

Cycles are legitimate — a realm's ruler is a character of that realm. `collectReferencedArtifacts`
is the one function here that walks references transitively, and it visits each id once, so a cycle
terminates rather than hanging. Anything else that walks them has to do the same.

## Cascade

Deleting a project deletes its artifacts, their payloads, and its bench — in one transaction, owned
by `$lib/projects`, because the project record has to go in the same commit as what it contains.
This library's part is `forgetProjectArtifacts`, which drops them from the hydrated index once that
transaction has committed.

The dependency runs one way: projects reaches into this library, and this library never reaches
back. It is keyed by project id and does not know the project set, so it cannot check that a
project exists — the caller opens a project before saving into it.

## Finding things

`artifact_search.ts` is the project view's half: `searchArtifacts` narrows a project's summaries by
name, kind, and tags; `groupArtifactsByKind` groups what is left under headings. Tags go through
`applyTagFilter` from [`$lib/tags`](../tags), so artifacts filter by exactly the mechanism tools and
everything else tagged on the site already use.

`groupArtifactsByKind` takes the kind order as a parameter rather than reading the registry. The
registry is the workshop's, this library is the store's, and a listing that had to import the
registry to sort itself would be the dependency this whole design keeps pointing the other way.

## Saying what changed

`onArtifactsChanged` hands a listener every committed create, edit, and delete. The workshop has
several things on screen looking at one project — a generator saving from inside a panel, a project
view listing what the project holds — and no other way for them to hear about each other.

Announcements come **after the transaction commits**, for the same reason the hydrated index is
only updated then: a listener told about a save the database does not have would redraw as though
the work were safe. An edit that changed nothing says nothing.

## Not yet here

- **Legacy adoption** (#34) — the heraldry, cultures, and religions saved under the old
  per-generator scopes are adopted into a project on first run. Nothing here reads those keys.
  The workshop's own former `localStorage` records are adopted a layer down, by `$lib/vault_db`.
- **Export and import** (#35, #47) — the file format, and the vault-sized write that meets the
  storage ceiling head-on.
- **The bench** — `ProjectWorkspace` and panel state are persisted per project, separately, and are
  not artifacts. A layout is not work.
