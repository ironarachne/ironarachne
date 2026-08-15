# legacy_adoption

Takes the work users saved under the old per-generator scopes and puts it in a project, so the
workshop starts with what they already have rather than with an empty bench.

Three generators could save before projects existed — heraldry, culture, and religion — each into
its own global scope under `ironarachne.save.v1.`. Nothing in the workshop reads those scopes. This
library is the bridge, and it exists because Iron Arachne is local-only: there is no server-side
copy of a user's cultures and no migration anyone can run later, so if the first build with an
artifact store does not adopt them, they are simply not there.

## Usage

```ts
import { ARTIFACT_KINDS } from '$lib/workshop';
import { adoptLegacySaves, legacyAdoptionNotice } from '$lib/legacy_adoption';

await adoptLegacySaves(ARTIFACT_KINDS);
const notice = legacyAdoptionNotice();
```

`adoptLegacySaves` is safe to call on every page load and is meant to be. When there is nothing new
it reads four storage entries and returns; a browser that never used the old save buttons gets no
project, no record, and no writes at all.

It is asynchronous because the store is: an artifact is a transaction in
[`$lib/vault_db`](../vault_db/README.md) now. **Two callers on one page load get one run** — the
root layout calls this and so does the project bar, and without that they would both read the same
empty adoption record and adopt everything twice. The record makes a later run a no-op; it cannot
make a concurrent one a no-op, because it is not written until the first item has been stored.

The registry is a parameter rather than an import, for the reason `$lib/artifacts` takes one: this
library has no opinion about which kinds exist, and reaching into `$lib/workshop` for the catalog
would point the dependency the wrong way.

## What it guarantees

- **Nothing legacy is touched.** No scope is deleted and none is rewritten — not even the entries
  it adopts. They are small, they are the only fallback if adoption has a bug, and `/saved-data`
  still reads them until #44 retires it.
- **Running twice adopts nothing twice.** Every adopted item is recorded by a key, and the record
  is written after each one, so an interrupted run resumes rather than starting over. Two
  overlapping calls share a single run rather than racing.
- **Nothing is dropped quietly.** An item this build cannot read is reported and left where it is,
  with no adoption key against it, so a later build that understands it will adopt it then.
- **A browser with no legacy saves is unaffected**, including getting no empty project.

## Decisions

**The scope table is written out here rather than imported.** `legacy_saves.ts` names the three
scope ids, their array fields, and their identity fields instead of importing them from
`culture_saved_state` and friends. Two reasons: `culture_saved_state` reaches `culture_snapshot`
and from there `$lib/names`, which is a lot of module to load on a page view that will adopt
nothing; and `heraldry_saved_state`'s reader dedupes by blazon and _writes the deduped list back_,
which is exactly the mutation of legacy data this library promises not to do. `legacy_saves.test.ts`
checks every field against what those libraries export, so the copy cannot drift silently.

**Payloads go through the kind registry, not a bespoke conversion.** A stored snapshot is handed to
`readArtifactPayloadForKind` with the version its envelope carries, which is the same path storage
and import use. A version 1 coat of arms therefore becomes a version 2 payload here by the same
migration and for the same reason it would anywhere else, and a kind that cannot read one says why
instead of throwing.

**Adopted artifacts have no provenance.** The legacy scopes record no origin for an item, so there
is none to record. Heraldry and religion snapshots do carry a `seed` field, and it was tempting;
#34 rules it out, and the design document agrees, because provenance is what a re-roll button acts
on and a seed that turns out not to reproduce this payload would quietly replace the user's work.
An artifact with no provenance is a legitimate state.

**Items are keyed by identity and an ordinal, not by position.** The key is the field the owning
library already treats as an item's identity — heraldry deletes by blazon, culture by name,
religion by seed — plus a count of how many earlier items in that scope shared it. Position alone
would renumber every later item when one is deleted and adopt them all again; identity alone would
count a second culture of the same name as already done and lose it. The ordinal is computed over
the stored array rather than over the items that turn out to be adoptable, so it does not move when
a build starts accepting something it used to skip.

**The adoption record is not exported with a vault.** It says what _this browser_ has already
adopted. Carrying it to a second browser would tell that one its own legacy scopes were already
handled, which is the one thing that would leave work unadopted with nothing to say so.

**A run adopts into the project a previous run used, or a new one — never into an arbitrary
existing project.** Legacy saves are a pile of unrelated items with no shared setting behind them,
and tipping them into a project someone has curated is not undoable item by item. The project it
creates is named "My Setting" and is theirs to rename.

## Where it runs

From the root layout, after mount, as a dynamic import — so it happens on the first page of the new
build a user opens, rather than only if they find the workshop, and costs nothing before first
paint. The note it leaves is shown by `ProjectContextBar` and cleared with
`acknowledgeLegacyAdoptionNotice` when the user reads it. When #36 builds the real project view,
that is where the note belongs; the call site does not need to move with it.
