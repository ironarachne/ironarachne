# Storage status

What the workshop knows about the browser it is stored in: how long ago the user exported, whether
the origin is protected from eviction, how full it is, and which projects account for that.

This is the library half of
[_What the user is told about storage_](../../../docs/workshop.md#what-the-user-is-told-about-storage).
The panel that displays it is #179; nothing here renders anything.

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
const exported = await exportVault();
if (exported.ok) {
  await recordVaultExport();
}
```

**On success and nowhere else.** These are the numbers that predict loss, so stamping one for an
export that failed or was cancelled replaces a true warning with a false reassurance. Exporting a
project does not stamp the vault either: six project exports are not a vault export, and treating
them as one is how a user ends up believing the project they forgot is covered.

`lastVaultExportAt` lives in the vault's `meta` store and `lastExportAt` on the project record —
both in `$lib/vault_db`, which is also why a rename cannot erase one.

## Not here

- **The panel, the banner, and the 80% threshold** — #179. What a number means to a reader is a
  presentation decision, including the two rules docs/workshop.md sets: quota is never shown as an
  exact figure, and a percentage never appears without the sizes underneath it.
- **Requesting persistence** — #178, at first project creation rather than first load.
- **`QuotaExceededError`** — #180. An estimate is advisory; a refused write is not.
- **Export itself** — #35 and #47. This library records that one happened, and does not perform one.
