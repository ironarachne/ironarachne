# Quarantine

Records this build could not interpret, kept verbatim until a build that can arrives.

This is invariant 2 from [`docs/workshop.md`](../../../docs/workshop.md#two-invariants) — **nothing
is dropped silently** — given somewhere to live. Import is what fills it: an artifact whose `kind`
this build has never heard of, a payload its validator refuses, a migration that gives up, or a
record that is not an artifact at all.

## Why not just drop it, or just refuse the file

Both alternatives are worse, and they fail in opposite directions:

- **Dropping it destroys work.** There is no server and no second copy. A culture this build cannot
  parse is still a culture the user wrote.
- **Refusing the whole file makes the backup useless.** A two-hundred-artifact vault that will not
  restore because one record is unrecognised is not a backup.

Quarantine is what makes an unknown `kind` survivable. A file written by a newer build, or by one
that still had a tool since removed, imports; the artifacts this build understands work normally,
and the ones it does not are still there when a build that understands them arrives.

## What a record keeps

`raw` is the record exactly as it arrived, and it is the only field that matters for recovery.
Everything above it — `id`, `projectId`, `kind`, `name` — is lifted out so the record can be listed
and named on screen, and is an empty string when the record was too damaged to carry it.

**Keeping the `kind` string is not the same as trusting it.** Without it, a later build that adds
the missing kind cannot find the records that have been waiting for it, which is the entire promise
being made. Dropping `projectId` would leave nowhere to restore it to, and dropping `name` and
`tags` would discard work the user authored rather than payload we failed to parse.

The store key is `recordId`, minted here rather than taken from the record: a record damaged enough
to have lost its id has nothing to be filed under, and two of those would overwrite each other.

## Leaving

Two ways out, and no others:

- **Export.** `quarantinedForExport` puts each record's `raw` back into a file's ordinary
  `artifacts` array — not into a compartment of its own. That is what makes the promise real: a
  build that has since learned the kind imports it as a normal artifact, with no code that knows
  quarantine ever happened. A body with a quarantine section would make every future reader look in
  two places for the same thing.
- **`discardQuarantinedArtifact`**, which takes an explicit act by the user. The application never
  decides on its own that something unreadable is worthless.

There is deliberately no "re-adopt" path. Re-importing an export is how a record comes back once a
build understands it, and it is the same code every other import runs.

## Reading

Read on demand, not hydrated into an index the way projects and artifact summaries are. Nothing in
the ordinary run of the site consults quarantine, and a cache of records nobody looks at is a cache
that is only ever wrong.

`toQuarantineRecordFromStorage` is forgiving about everything except the record's own key and
`raw`. This store holds records that were already malformed when they arrived, so a strict parse
here would be the second thing to drop them — and dropping a record because the note _about_ the
record is imperfect is exactly the failure this library exists to prevent.
