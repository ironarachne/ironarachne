# 0001. Store workshop work locally in IndexedDB

**Status:** Accepted

## Context

The workshop keeps user-authored projects and generated results on a static site. Saving
structured results and their payloads made the small, synchronous `localStorage` budget a poor
fit. The substrate also determines whether callers must handle asynchronous reads and writes.
See [the workshop storage decision](../workshop.md#5-the-store-persists-to-indexeddb).

## Decision

Use IndexedDB for projects, artifact summaries and payloads, and workspaces. Keep small,
synchronous device pointers in `localStorage` and support legacy adoption at its boundary.
Save the generated snapshot itself so the vault can reopen the user's actual work, including
edits, independently of the current generator.

## Consequences

Storage callers must handle asynchronous operations and write failures. Browser storage belongs
to its origin and profile. Vault exports provide a portable copy. Changes to payload shapes
require a compatibility plan in the owning artifact kind. See the
[storage library](../../src/lib/vault_db/README.md) and [workshop design](../workshop.md#export-and-import).
