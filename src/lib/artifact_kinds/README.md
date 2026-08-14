# Artifact kinds

An **artifact kind** is one shape of saved content — a culture, a religion, a coat of arms — and
this library is the contract a library implements to make its content storable, plus the registry
that holds those implementations.

It stores nothing. Storage is the artifact store's job
([#33](https://worktree.ca/ironarachne/ironarachne/issues/33)); this is the vocabulary the store,
export, import, and the project view all speak, so none of them needs a hand-written list of which
kinds exist.

The kinds themselves are registered in [`$lib/workshop`](../workshop/README.md), which is where
the catalog lives. Nothing here knows that heraldry exists.

## Why a registry

Saving a culture today means importing `culture_saved_state.ts` and knowing it is there, and
`persistent_save/saved_data_catalog.ts` names each savable kind in a union. A fourth savable
generator means editing the catalog, the union, and the page. That does not reach thirty-five
tools.

With a registry, a library declares its kind once and every generic consumer reads it from here.

## The contract

| Element          | What it is for                                                              |
| ---------------- | --------------------------------------------------------------------------- |
| `kind`           | Stable string id (`culture`, `character.swn`). Renaming one is a migration. |
| `displayName`    | What a user sees for the kind.                                              |
| `payloadVersion` | The version of the snapshot shape this build writes.                        |
| `loadCodec`      | Loads `toSnapshot` / `fromSnapshot`, the lossless round trip. See below.    |
| `nameOf`         | The default name for an artifact holding a given snapshot.                  |
| `validate`       | Is this unknown value a snapshot at the current version?                    |
| `migrate`        | Bring a snapshot written at an older version up to the current one.         |

Two types run through all of it, and keeping them apart is the point:

- **`TValue`** is the live thing a library works with. It may carry functions and rebuilt
  generators, and it is not storable as it stands.
- **`TSnapshot`** is the serialisable form, and **it is the artifact's payload**. `validate`,
  `migrate`, and `nameOf` are handed whatever was in storage or in a file, so they speak in
  snapshots; only `fromSnapshot` produces a live value, and only it needs an RNG.

The design document's class diagram calls both "payload". This is that model with the two roles
named, because `fromSnapshot` takes an RNG and so cannot be what a validator returns.

### Why the codec loads

Everything on an entry is synchronous except `loadCodec`, which is what keeps a store read and a
project listing synchronous. The codec is deferred because it is the expensive half: rebuilding a
coat of arms resolves stored charge names against `$lib/charges` — **18 MB of glyph art**, measured
— and only a panel that is opening an artifact needs it. Listing a project, validating a payload,
and importing a file do not.

That is the same trade `TOOL_PANELS` makes for components, applied to payloads. It costs one
`await` at the point where a user opens or saves something, and it keeps the site's charge library
out of the chunk that merely says a project contains three coats of arms.

## Results, not exceptions

`validate` and `migrate` return a `PayloadResult`, a discriminated union on `ok`:

```typescript
const result = readRegisteredArtifactPayload('culture', payload, 1);
if (!result.ok) {
  quarantine(payload, result.reason, result.message); // 'invalid-payload', and what was wrong
}
```

A boolean says no without saying why, and the why is exactly what quarantine and the import
summary have to show a user. `QuarantineReason` covers the four cases: `unknown-kind`,
`invalid-payload`, `unsupported-version`, `migration-failed`.

Nothing here throws over bad data. Two things do throw, and both are bugs in this build rather than
bad records: registering a kind twice, and `requireArtifactKind` for a kind that is not there.

## Version routing

Callers use `readArtifactPayload` (or `readArtifactPayloadForKind`) rather than reaching for
`migrate` directly, and it decides:

| Stored version | What happens                                                           |
| -------------- | ---------------------------------------------------------------------- |
| Current        | `validate` alone. `migrate` is not called.                             |
| Older          | `migrate`, then `validate` its output — a bad migration is caught here |
| Newer than us  | Rejected `unsupported-version`; the payload is kept intact for later   |
| Not a version  | Rejected `unsupported-version`                                         |

So a kind implements only the steps it actually has, and a kind with no older versions still says
so out loud instead of appearing to handle them.

**Migration is not optional.** This is a local-only application: there is no server-side migration
and no backfill. Every step runs in the browser, against data that may be arbitrarily old, for
someone who has not opened the site in a year.

## Usage

Declaring a kind, in the library that owns the payload:

```typescript
export const cultureArtifactKind = defineArtifactKind<Culture, CultureSnapshot>({
  kind: 'culture',
  displayName: 'Culture',
  payloadVersion: 1,
  loadCodec: async () => {
    const { cultureFromSnapshot, toCultureSnapshot } = await import('./culture_snapshot.js');
    return { toSnapshot: toCultureSnapshot, fromSnapshot: cultureFromSnapshot };
  },
  nameOf: (snapshot) => snapshot.name,
  validate: validateCultureSnapshot,
  migrate: migrateCultureSnapshot,
});
```

Reading one back, generically:

```typescript
import { artifactKindEntry, readRegisteredArtifactPayload } from '$lib/workshop';

const result = readRegisteredArtifactPayload(artifact.kind, artifact.payload, artifact.version);
if (result.ok) {
  const { fromSnapshot } = await artifactKindEntry(artifact.kind)!.loadCodec();
  const culture = fromSnapshot(result.value, new RNG(artifact.id));
}
```

The entry is generic where it is declared and erased where it is looked up: the registry hands back
`AnyArtifactKindEntry`, which confines the cast to one line in `registerArtifactKind` instead of
spreading it across every consumer.

## Payload guards

`asRecord`, `isStringArray`, `isStringArrayArray`, and `hasStringFields` are here because every
`validate` needs them and three private copies is how three validators drift.

A validator checks what its codec depends on; it is not a schema for the content. A structural
description of a generated culture would be a second copy of the culture types, and the copy is
what would go stale.
