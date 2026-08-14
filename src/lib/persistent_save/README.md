# Persistent save

This library is the **local persistence layer**: it saves generated content to `localStorage`,
catalogs what is saved, exports it to a file the user can keep, and imports one back. Everything
stays in the browser — there is no account and no server anywhere in this path.

> **Note:** the saved-data model is expected to change with the workshop's universal result vault
> (see `docs/workshop.md`). Prefer adding to it over building new things on top of it.

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

## Features

- **Storage** — `readScopedJson`, `writeScopedJson`, `removeScopedJson`, `listScopedEntries`, and
  `clearAllScopedStorageKeys`.
- **Sanitizing** — `stripFunctionValuesDeep` removes the closures generator output carries (live
  name generators, `apply` handlers) so what remains can be serialized. Anything persisted or
  exported goes through it first.
- **Catalog** — `listAllSavedDataEntries`, and the per-kind `listSavedHeraldryEntries`,
  `listSavedCultureEntries`, and `listSavedReligionEntries` that back `/saved-data`.
- **Export and import** — `buildExportPayload` (optionally limited to given scopes),
  `parseSaveExportPayload` (returns `null` on anything that is not a valid save file), and
  `applyImportedScopes`.
- **Downloads** — `downloadSnapshotJson`, `downloadCultureJson`, `downloadReligionJson`,
  `downloadHeraldrySvg`, `downloadHeraldryPng`, and `slugifyDownloadName`.
- **Deep links** — `heraldryGeneratorHref`, `cultureGeneratorHref`, `religionGeneratorHref`, the
  matching `read*LoadParamFromLocation` readers, and `clearLoadParamFromUrl`, which together let a
  saved item open in the generator that made it.
- **Previews** — `buildHeraldryPreviewMap` renders thumbnails for the saved-data page.

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
