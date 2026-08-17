# Vault file

The transfer format: how work leaves this browser and how it gets back in.

In a local-only application there is no account to log back into and no server-side copy, so a file
is the only copy of a user's work that survives clearing site data, replacing a machine, or a
browser deciding on its own that this origin's storage is evictable. Export is not a convenience
feature here — it is the backup story, the migration story, and the sharing story at once.

This library is the _file format_ diagram in [`docs/workshop.md`](../../../docs/workshop.md) in
code, and its counterpart is [`$lib/vault_db`](../vault_db/README.md): the database is where work
lives, the file is how it travels.

## One format, three scopes

There is one envelope with a `scope` discriminator, not three formats:

| Scope      | Body                                      | What it is for                                         |
| ---------- | ----------------------------------------- | ------------------------------------------------------ |
| `vault`    | Every project, artifact, and bench        | Backup, moving machines, handing over a whole world    |
| `project`  | One project, its artifacts, and its bench | Sharing a setting, archiving a campaign                |
| `artifact` | One artifact                              | Handing over a single culture; moving between projects |

Three formats would triple the migration surface, and migration is the part of a local-only
application that has no server to fix it after the fact. One envelope means one `formatVersion`,
one parser, one migration chain, and one vocabulary of error messages.

Two rules follow, and both are enforced here rather than left to callers:

1. **Every import entry point accepts every scope.** `importExportFile` dispatches on the file's own
   `scope`, so a vault file dropped on "import project" imports the vault. The file declares what
   it is; the application reads it, rather than asking the user to have pressed the right button.
2. **The body is emitted in a stable order.** `canonicalJson` sorts every object's keys and export
   sorts artifacts by id, so two exports of unchanged content are byte-identical below the header.
   Backups in a folder or a git repository diff cleanly, and the round-trip tests get an equality
   assertion for free.

## The envelope

| Field           | Purpose                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| `format`        | `ironarachne.export`, a literal. What identifies the file before anything in it is trusted. |
| `formatVersion` | The envelope's version. **Not** an artifact's `payloadVersion`.                             |
| `scope`         | `vault`, `project`, or `artifact`. Determines the body.                                     |
| `exportedAt`    | ISO 8601, for a user looking at five of these in one folder.                                |
| `appVersion`    | Which build wrote it. Diagnostics only, **never a gate on import**.                         |
| `vaultId`       | The originating browser profile, so import can recognise a file as this vault's own.        |
| `checksum`      | SHA-256 of the canonical body, so truncation reads as damage rather than as a syntax error. |

The header is written before the body so a file says what it is in its first line. Everything below
it is key-sorted.

`payloadVersion` migration is untouched by any of this: on import, every payload routes through the
kind registry's read path exactly as it does on a read from storage. **The envelope version governs
the envelope; the kind governs the payload.**

## Two invariants

1. **Commit is all or nothing**, and structurally so rather than by discipline. A file is parsed,
   its payloads are migrated, and the whole result is staged in memory; then **one transaction**
   writes it (`writeVaultContents`). A file that fails at artifact 900 of 1000 — malformed, cancelled,
   or out of quota — leaves storage byte-identical, because IndexedDB unwinds every put in an aborted
   transaction. There is no rollback path of our own to get wrong, and no window in which a restore
   has emptied the vault but not yet refilled it.
2. **Nothing is dropped silently.** An artifact this build cannot interpret is **quarantined** into
   [`$lib/quarantine`](../quarantine/README.md) — kept verbatim, listed, marked unreadable, and
   carried in every subsequent export — rather than discarded, and rather than fatal. Dropping it
   destroys work; rejecting a two-hundred-artifact backup over one bad record makes the backup
   useless.

Two more things follow the same rule. An import will not fit is checked **before** the write, from
the staged size and `navigator.storage.estimate()`, so it is refused with a number rather than
discovered at artifact 900 — advisory in both directions, since the transaction is the guarantee.
And a large import reports progress and can be stopped right up to the commit, which costs nothing
because nothing has been written yet.

## Identity

Two modes, and the distinction is the whole design:

| Mode                  | Effect                                                                     | When                                            |
| --------------------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| **Merge** (add)       | Every project in the file arrives alongside what is there, as new projects | Combining two machines, taking someone's world  |
| **Restore** (replace) | The vault becomes what is in the file; anything not in it is gone          | Recovering, or moving to a machine with no work |

**Merge is the default**, because it is the mode that cannot lose anything: a default of restore
would mean a mis-click destroys a vault. Restore needs a whole-vault file — only a whole-vault file
describes a whole vault — and a project or artifact file asked to restore is refused as
`wrong-scope` rather than half-applied.

Merge never writes into an existing project. Reconciling a file's version of a project against the
one in storage is a sync problem: it needs causal history the format does not carry and cannot
invent, and every shortcut for it — last-write-wins, newest-timestamp, field-level union — quietly
destroys somebody's edits.

So **merge remints every artifact id** and rewrites the reference graph through the old-to-new map.
Unconditionally, not on collision: the obvious case is a user importing a backup taken from this
browser, where every id in the file is already in use, and a rule that depends on what else the user
happens to have is the kind of conditional identity that corrupts a reference graph in exactly the
cases nobody tests. **Restore preserves ids** — it is replacing the vault, so there is nothing to
collide with, and `remintedIds` staying empty is the type-level statement of that.

Before a restore writes, it exports the current vault and does not proceed unless the caller
confirms that file was saved. **That download is the undo**, and it costs nothing to produce in an
application where the whole vault is already in memory. `vaultId` is what lets an import recognise a
file as this browser's own and steer to restore, so "restore my backup" and "duplicate all my work"
do not rest on picking the right radio button.

- A reference whose target is absent from the file **keeps the id it had and dangles**. Broken
  references are tolerated and visible, and an import is the wrong moment to start guessing.
- An id the file uses twice means the file is internally inconsistent. Both copies are kept, each
  under an id of its own — in restore too, where preserving the id would silently overwrite one with
  the other — and `duplicateIds` says so. The map points at the first, so references to it resolve
  somewhere rather than nowhere.
- An artifact whose project is missing from the file is attached to a generated **Recovered
  artifacts** project rather than dropped. A vault whose two lists disagree is damaged, and the
  artifacts are the half worth keeping: there is nothing in a project record the user cannot write
  again.
- Two projects with the same name is fine and expected — names were never unique. The collision is
  **reported, not resolved**: renaming one is the user's call, and doing it for them would rewrite
  something they wrote.

## What travels

Projects, artifacts, tags, provenance, references, and the bench. Not `byteSize`, which is a fact
about this browser's copy rather than about the work, and not device-scoped preferences — restoring
a backup must not change the user's theme, and a file handed to another person must not reach into
their settings.

An export never refuses to write what it cannot parse. Storage holding malformed or legacy data is
precisely when a backup matters most, so payloads go out **verbatim**, unmigrated and unvalidated,
with the `payloadVersion` they were stored at. A payload that cannot be serialised at all — a value
that refers to itself — travels as `null` and is named in `issues` rather than thrown.

## Public API

| Function                  | Does                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| `buildVaultExportFile`    | Everything the user has, as one file                                 |
| `buildProjectExportFile`  | A project and everything in it, as a named file ready to download    |
| `buildArtifactExportFile` | One artifact, the same way                                           |
| `importExportFile`        | Reads a file of any scope and writes what is in it, or says why not  |
| `parseExportFile`         | The reader on its own, for anything that wants to inspect a file     |
| `readExportFileText`      | Picked bytes as text, decompressing a gzipped file it sniffs         |
| `checkImportCapacity`     | Whether an import looks like it will fit, before anything is written |
| `describeImportSummary`   | What an import did, as sentences a user can read                     |
| `canonicalJson`           | Key-sorted JSON — the stable order the format is built on            |
| `checksumOf`              | SHA-256 of a canonical body                                          |
| `exportFileName`          | `ironarachne-<what>-YYYY-MM-DD.json`                                 |

Recording that an export happened is `recordProjectExport` / `recordVaultExport` in
[`$lib/storage_status`](../storage_status/README.md), called by whatever performed the download.
Building a file is not exporting it: a file that was built and never saved must not stamp a project
as backed up, because that stamp is what tells a user how long their work has been the browser's
only copy.

## The legacy exporter

[`$lib/persistent_save`](../persistent_save/README.md)'s `save_file_export.ts` still exports storage
scopes, and still checks its version with `===` — which turns the first version bump into rejection
of every file already in users' hands. That is the mistake this format exists not to repeat: an
older `formatVersion` is migrated forward through `EXPORT_FORMAT_MIGRATIONS`, and only a version
with no step for it is refused.

The chain is empty today because version 1 is the only envelope that has ever been written. It is a
list rather than nothing at all so the next version is a step appended to it, not a parser rewritten
under files that are already in someone's Downloads folder.

Those legacy files **import**. `vault_file_legacy.ts` translates one into a project-scope envelope,
and the parser reaches for it before it rejects a file as foreign — translation rather than a second
import path, so a legacy file goes through the same staging, the same per-kind migration, the same
quarantine, and the same all-or-nothing commit as anything else. Its scopes become artifacts of the
kinds [`$lib/legacy_adoption`](../legacy_adoption/README.md) already maps them to, so a culture
restored from a file and a culture adopted from `localStorage` arrive as the same artifact. The old
exporter can now be retired, which is #44's to do.

## Compression

`readExportFileText` sniffs the two gzip magic bytes and decompresses when it finds them. This build
never _writes_ a compressed file — `CompressionStream` is available without a dependency and is
worth taking when size demands it, which is deferred rather than designed away. Reading them anyway
is what makes writing them a non-event later, and it costs a two-byte check: a user who compressed a
backup themselves is not told their file is damaged.
