# Persistent save

This library is the **local persistence layer**: it saves generated content to `localStorage`,
catalogs what is saved, exports it to a file the user can keep, and imports one back. Everything
stays in the browser — there is no account and no server anywhere in this path.

> **Note:** the saved-data model is expected to change with the workshop's universal result vault
> (see `docs/workshop.md`). Prefer adding to it over building new things on top of it.
>
> `save_file_export.ts` in particular is superseded by [`$lib/vault_file`](../vault_file/README.md)
> (#35), which exports projects and artifacts rather than storage scopes and migrates an older
> `formatVersion` forward instead of comparing it with `===`. It is retired once its files can be
> read by its replacement (#47), so nothing new should be built on it.

## Scoped storage

Every generator that saves owns a **scope id** (`generator.culture`, `generator.heraldry`, and so
on) and stores one JSON payload under it. That is the whole storage contract: one key per scope,
one payload per key, versioned by the generator that owns it.

```typescript
import { readScopedJson, writeScopedJson } from '$lib/persistent_save';

writeScopedJson('generator.culture', payload);
const saved = readScopedJson('generator.culture'); // null when absent
```

`listScopedEntries` enumerates every scope, `removeScopedJson` drops one, and
`clearAllScopedStorageKeys` clears the lot.

**It clears the lot of `localStorage`, which is no longer all of it.** The workshop's projects and
artifacts live in [`$lib/vault_db`](../vault_db/README.md) — an IndexedDB database this library
knows nothing about — and what stays here is the small synchronous pointers beside it, such as
which project is open. Anything that means "clear everything a user has" has to do both, and
`deleteVaultDatabase()` is the other half.

## Features

- **Storage** — `readScopedJson`, `writeScopedJson`, `removeScopedJson`, `listScopedEntries`, and
  `clearAllScopedStorageKeys`.
- **Sanitizing** — `stripFunctionValuesDeep` removes the closures generator output carries (live
  name generators, `apply` handlers) so what remains can be serialized. Anything persisted or
  exported goes through it first.
- **Export and import** — `buildExportPayload` (optionally limited to given scopes),
  `parseSaveExportPayload` (returns `null` on anything that is not a valid save file), and
  `applyImportedScopes`. Superseded by [`$lib/vault_file`](../vault_file/README.md), which reads
  the files these wrote; nothing new should be built on them.
- **Load cues** — `readLoadCueFromUrl` and `clearLoadParamFromUrl`. `/saved-data` used to put
  `?blazon=`, `?name=`, or `?seed=` on a generator's URL to open one of the items it listed.
  Nothing produces those links any more — that page is gone (#44) — but three generators still
  read them, because people bookmarked them.

The catalog, the per-kind downloads, the heraldry preview map, and the deep-link _builders_ went
with `/saved-data` (#44). They existed only to serve it.

## Usage

Export everything the user has saved:

```typescript
import { buildExportPayload, downloadSnapshotJson } from '$lib/persistent_save';

downloadSnapshotJson('ironarachne-save', buildExportPayload());
```

Import a file back:

```typescript
import { applyImportedScopes, parseSaveExportPayload } from '$lib/persistent_save';

const payload = parseSaveExportPayload(JSON.parse(fileContents));
if (payload) {
  applyImportedScopes(payload);
}
```

Because storage is `localStorage`, these functions need a browser. Guard calls made from code that
also runs during SSR.
