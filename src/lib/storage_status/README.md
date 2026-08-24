# Storage status

What the workshop knows about the browser it is stored in: how long ago the user exported, whether
the origin is protected from eviction, how full it is, and which projects account for that.

This is the library half of
[_What the user is told about storage_](../../../docs/workshop.md#what-the-user-is-told-about-storage).
The panel that displays it is `StoragePanel.svelte` ([docs/storage-panel.md](../../../docs/storage-panel.md));
nothing here draws. What _is_ here is the phrasing — see
[Saying it, not drawing it](#saying-it-not-drawing-it).

## Why this exists

[Local only](../../../docs/workshop.md#local-only) means the browser holds the only copy, so the
user is their own backup — and someone cannot act on a risk nobody told them about. This library
produces the numbers that let the workshop tell them.

Decision 6 also settles the order they are told in, and it is not the obvious one. **Fullness
predicts inconvenience; export recency predicts loss.** A user at 12% of quota who has never
exported is one cleared browser away from losing everything, and a usage meter reports them as
comfortable. So `lastVaultExportAt` leads and usage is diagnostic detail below it — which is why
the export stamps are the only stored fields here, and everything else is derived on the spot.

## Three numbers that measure different things

Conflating them produces a display that is confidently wrong, so they are kept apart:

| Number                      | Where it comes from                          | Answers                  |
| --------------------------- | -------------------------------------------- | ------------------------ |
| `usageBytes` / `quotaBytes` | `navigator.storage.estimate()`               | A proportion, roughly    |
| `ProjectUsage.byteSize`     | Sum of `byteSize` over a project's summaries | _Which_ project is large |
| Whether the next write fits | Nothing reliable                             | —                        |

`ProjectUsage.byteSize` **is not reconciled against `usageBytes`** and must not be. It excludes
index overhead, the other object stores, and whatever else the browser charges the origin for; the
two disagreeing is expected, and scaling one to the other would turn two honest numbers into one
invented one. The third row is why nothing here pre-flights an ordinary save: `QuotaExceededError`
is the only authoritative signal there is, and handling it is #180.

## Unknown is a value

Two fields refuse to guess, and both are load-bearing:

- **`usageBytes` and `quotaBytes` are optional.** `navigator.storage.estimate()` is not universally
  available. A missing figure is reported absent, never as zero — zero is a claim the code cannot
  support.
- **`PersistenceState` is three-valued.** `unknown` covers a browser with no `persisted()` and an
  answer that has not arrived. Collapsing it into `notPersisted` would report a protected origin as
  unprotected, and a warning about a risk the user does not have is how a storage display teaches
  people to ignore it.

Neither `persisted` nor a comfortable usage figure means "backed up". Persistence resists automatic
eviction under storage pressure; it does nothing about a cleared browser, a lost laptop, or a
different machine. Export is the protection, and the panel says so.

## Measuring continuously, cheaply

`readStorageStatus()` caches the estimate and takes a fresh one when the vault's own attributed
total has moved by at least `MATERIAL_SIZE_CHANGE_BYTES`. Renaming an artifact moves the sum by
bytes and re-uses the cached figure; saving a region map moves it by megabytes and earns a new
reading. `measuredAt` records when that reading was taken, so the UI can say how stale it is rather
than presenting a cached number as a live one.

Staleness is derived from the summed size rather than announced by whoever wrote, deliberately: an
invalidation somebody has to remember to call is one somebody will forget, and the resulting number
is wrong with no sign that it is. `invalidateStorageMeasurement()` exists for the changes the sum
cannot see — a vault import, a "clear everything", a granted persistence request.

Persistence is read fresh every time. It is one cheap call with none of the fuzzing that makes
`estimate()` worth caching, and it changes the moment `persist()` is granted (#178).

## Export stamps

```typescript
// What `exportWholeVault` in $lib/vault_file does, and the reason it exists as a function at all:
// the stamp is written only once the browser has actually taken the file.
if (downloadTextFile(text, fileName)) {
  await recordVaultExport();
}
```

**On success and nowhere else.** These are the numbers that predict loss, so stamping one for an
export that failed or was cancelled replaces a true warning with a false reassurance. Exporting a
project does not stamp the vault either: six project exports are not a vault export, and treating
them as one is how a user ends up believing the project they forgot is covered.

`lastVaultExportAt` lives in the vault's `meta` store and `lastExportAt` on the project record —
both in `$lib/vault_db`, which is also why a rename cannot erase one.

## Asking, and telling

Reading the state is half of it. `requestPersistenceIfWarranted(trigger)` asks the browser not to
evict this origin, and `hasSeenStorageDisclosure` / `recordStorageDisclosureShown` record whether
the user has been told their work lives in one browser. Both are
[docs/storage-disclosure.md](../../../docs/storage-disclosure.md); the summary is:

```typescript
// Only completions of real work may ask, and there are exactly three of them.
await requestPersistenceIfWarranted('projectCreated');
```

**The retry policy is the caller list, not a counter.** `docs/workshop.md` asks that a refusal be
repeated at most once per session and only after the user has done more work; because a created
project, an exported vault, and an exported project are the only triggers, "after more work" is
structural. There is no page-load or timer caller to get wrong. Inside, three gates: an origin that
is already persisted is never asked again, a session that has asked does not ask twice, and a grant
throws away the cached estimate.

A session is the page's lifetime, in module state. Nothing about a refusal is persisted — a
browser-level decision the user can revisit must not become a product-level one they cannot. The
disclosure stamp _is_ persisted, in the vault's `meta` store, because "told once" has to survive a
reload; the export envelope does not carry `meta`, so it cannot ride a backup into a browser that
was never told.

None of this is protection. `persist()` resists automatic eviction and does nothing about cleared
site data, a lost laptop, or Safari's ITP — which is why the disclosure copy says export is what
protects the work, in every browser, with no user-agent check anywhere.

## Saying it, not drawing it

`storage_presentation.ts` turns a `StorageStatus` into the sentences a reader sees:
`exportHeadline`, `exportCell`, `protectionAdvice`, `usageSentence`, `buildStoragePanelView`, and
`storageWarning` with the `STORAGE_WARNING_FRACTION` threshold the workshop's banner uses.

Phrasing lives in the library rather than in the `.svelte` files because the rules
docs/workshop.md sets are only worth anything if they are tested, and components here have no unit
tests:

- **A quota is never shown as an exact figure.** `formatApproximateBytes` rounds to the precision
  an estimate actually has — `240 MB`, `2 GB`, `1.7 GB` — and it deliberately does not live in
  `$lib/format` beside `formatBytes`, so it is not reached for on figures that _are_ exact, such as
  `ProjectUsage.byteSize`.
- **A percentage never appears without the sizes underneath it.** `usageSentence` is the only place
  a percentage exists, and it emits both in one string; there is no arrangement of a template that
  can show one without the other.
- **Unknown renders as unknown.** Every branch says what is known and nothing more.

The banner's dismissal is module state, so a session is the page's lifetime — the same reading of
"session" the persistence request takes, and a reload correctly brings back a statement that is
still true.

## Not here

- **Drawing any of it** — `StoragePanel.svelte` and `StorageWarningBanner.svelte` in
  `$components/common`. This library returns strings and numbers; it does not render.
- **`QuotaExceededError`** — #180. An estimate is advisory; a refused write is not.
- **Export itself** — #35 and #47. This library records that one happened, and does not perform one.
