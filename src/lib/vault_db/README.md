# Vault database

The workshop's storage substrate: one IndexedDB database holding every project, every artifact
summary, every payload, and every bench.

It is the _storage layer_ diagram in [`docs/workshop.md`](../../../docs/workshop.md) in code. What
it deliberately is **not** is the store: it knows a record's key and, for an artifact, its project,
and nothing else about what is inside one. Deciding what a project or an artifact is belongs to
[`$lib/projects`](../projects/README.md) and [`$lib/artifacts`](../artifacts/README.md), which is
what keeps the dependency running one way — they reach in here, and nothing here reaches back.

## Why a database and not `localStorage`

Decision 5 of the design document. `localStorage` offers roughly five megabytes per origin, shared
across every project a user has, and stores bytes as base64 inside a JSON string at a 33% premium.
A project of region maps, heraldry SVGs, and star system imagery does not fit — not as an edge
case, but in ordinary use.

What the substrate buys, beyond room:

- **Transactions.** A create writes a summary and a payload in one commit, and a project delete
  removes its artifacts, their payloads, and its bench in another. Neither can half-happen. The
  `localStorage` store could only order its writes so that the residue of a refused one was the
  cheaper kind of wrong.
- **Indexes.** `by_projectId` on the `artifacts` store replaces the per-project array of summaries
  that existed only because `localStorage` has no query. Editing one artifact no longer rewrites
  every summary beside it.
- **One schema version.** A database has an upgrade transaction, so a record no longer carries a
  `storeVersion` of its own. `payloadVersion` is untouched by this — it versions a kind's payload
  shape, which is [`$lib/artifact_kinds`](../artifact_kinds/README.md)'s business.

The cost is that every write is asynchronous. It is paid down by hydrating projects and artifact
summaries once at startup, so listing stays synchronous for callers, and by leaving payloads lazy —
nothing should hold every map in a project resident in memory.

## The stores

| Store               | Key          | Holds                                                                     |
| ------------------- | ------------ | ------------------------------------------------------------------------- |
| `projects`          | `id`         | `{ id, value }` — the project as `$lib/projects` wrote it                 |
| `artifacts`         | `id`         | The summary, with `payloadVersion` and `byteSize`; indexed `by_projectId` |
| `artifact_payloads` | `artifactId` | `{ artifactId, payload }`, read only when an artifact is opened           |
| `workspaces`        | `projectId`  | `{ projectId, value }` — the bench. Not user work                         |
| `meta`              | `key`        | Schema version, vault id, last vault export, adoption stamp               |

`projectId` on an artifact record is authoritative; the index is derived from it, never the other
way round.

A project record carries one field the project itself does not: `lastExportAt`, epoch milliseconds
of the last successful export of that project. It is a field of the record rather than of the
`Project` because the user does not edit it and it does not travel in an export file, which is why
`writeProjectRecord` reads before it writes — a rename must not reset it to "never exported". The
whole-vault equivalent, `lastVaultExportAt`, is a `meta` key for the same reason.

`byteSize` is recorded at write time because that is the one moment the number is free. Summing it
over a project's summaries attributes usage per project, which `navigator.storage.estimate()`
cannot do — that reports for the whole origin. It is JSON size in UTF-8 bytes: attribution, not
accounting, since what is actually stored is a structured clone and the browser's own overhead is
invisible from here.

## Every operation returns a result

Nothing here returns `void`. A write hands back a `VaultResult`, and so does a read:

```typescript
const written = await writeProjectRecord(project);
if (!written.ok) {
  // 'quota-exceeded', 'unavailable', or 'storage-failed' — and a message.
}
```

An API that returns nothing makes silent loss the default and leaves "do not lose saves" to the
caller's discipline, which is the wrong place for it (docs/workshop.md, "Storage limits"). The
three reasons are separated because they are acted on differently: `quota-exceeded` is the only
authoritative storage-is-full signal there is, `unavailable` is a browser with no IndexedDB or a
page rendering before there is one, and `storage-failed` is everything else.

**A result resolves after the transaction has committed**, not after its last request succeeded.
That is what makes it safe for a caller to update a hydrated index only once the result is in
hand: memory must never claim a save the database does not have.

## Adoption from `localStorage`

The workshop wrote `workshop.projects`, `workshop.artifact_index.<projectId>`, and
`workshop.artifact.<artifactId>` before it had a database. Those are copied in on first open, in
one transaction with the stamp that records it, and **the originals are left in place** — they are
small, they are the only fallback if this has a bug, and #34 settled the same question the same way
for the per-generator saves.

Adoption moves records; it does not judge them. `payloadVersion` moves from the payload entry to
the summary, `byteSize` is computed because it was never stored, and anything the current
`$lib/artifacts` would reject is dropped when the index is hydrated instead — in the layer that
knows what a summary is.

A failed adoption does not fail the connection. It is not stamped as done, so the next load tries
again.

## Two substrates now

`localStorage` keeps the small synchronous pointers that are not user work — which project is open,
and UI preferences. That split is deliberate, and it has a cost worth stating plainly: export,
import, and any "clear everything" path have to know about both. `deleteVaultDatabase()` is this
half of that; the scoped keys are cleared through `$lib/persistent_save`.

## Not here

- **Storage status** — usage, quota, persistence, and what the user is told. It reads `byteSize`
  from the summaries and `navigator.storage` from the browser; neither is this library's business.
  `$lib/storage_status` assembles it, and the export stamps stored here are what it reads.
- **Export and import** (#35, #47) — the file format and the vault-sized write.
- **The hydrated index** — it caches what a domain library decided a record means, so it lives in
  `$lib/projects` and `$lib/artifacts` rather than here.
