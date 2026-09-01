# Workshop

Where the workshop's three registries are assembled: a tool in the [catalog](../tools) mapped to
the component that renders it, an artifact [kind](../artifact_kinds/README.md) mapped to the
library that knows how to store it, and a kind mapped to the component that edits it.

All three are lists of static imports, and all three are here for the same reason — the libraries
they name must not know about each other, and the assembly has to be somewhere that no one imports
by accident.

This is also where the operations that need more than one of them live: saving what a tool made,
loading a saved artifact back into a generator, and the editing lifecycle around an artifact that
is open.

## Tool panels

Maps a tool in the catalog to the component that renders it, so a tool can be
mounted inside a panel instead of only on its own route.

The catalog says a tool exists, what it is called, and where it lives; it says nothing about how
to draw it. This library is that missing half, and it is deliberately separate: everything that
consumes `$lib/tools` — navigation, index pages, filtering — needs the metadata and none of it
needs the components.

## Usage

```ts
import { toolPanelLoader } from '$lib/workshop';

const loader = toolPanelLoader('/culture');
const { default: CultureGenerator } = await loader();
```

`hasToolPanel` answers the same question without loading anything.

Loading is deferred, and the import specifiers are written out in full, because a bundler can
only split a dynamic import it can see. A computed specifier would pull every generator on the
site — WebGL renderers and PDF export included — into whatever page opened one panel.

The components are the same ones the routes mount, so a tool behaves in a panel exactly as it
does on its own page.

## Adding a tool

Add the entry to `TOOL_PANELS` alongside the `defineTool` entry in the catalog. The unit tests
check the two agree in both directions: every catalog tool has a panel, and no panel is
registered for a path that is not a tool.

## Telling a mounted tool to roll again

`ToolPanel` mounts its component keyed on the tool's path, so until `ToolCue` there was no way to
say anything to a tool already on the bench — the only way to reach one was to mount a different
one. The one precedent, heraldry's `?blazon=` URL cue, does not compose with panels: the workshop
is a single route, so a query parameter on it cannot say which panel it addresses.

A cue is a seed, a config, and an id. A tool opts in by declaring the prop:

```ts
import type { ToolCue } from '$lib/workshop';

const { cue }: { cue?: ToolCue } = $props();

let lastCueId: string | undefined;
$effect(() => {
  if (cue === undefined || cue.id === lastCueId) {
    return;
  }
  lastCueId = cue.id;
  applyCue(cue);
});
```

Two rules make it behave, and both are contracts rather than types:

- **Watch the `id`, not the contents.** Replaying the same result twice is two distinct requests,
  and comparing seeds would swallow the second. The id is minted at the moment of the request.
- **Apply the config keys you recognise and ignore the rest.** A config from a differently-shaped
  build cannot arrive, because the session log that mints these does not outlive the build
  (decision 2 in `docs/session-log.md`).

The panel is deliberately **not** re-keyed on the cue: re-keying would remount the tool, throwing
away everything else in its panel and flickering, to deliver a message the tool can simply read.

Reading a cue is opt-in, and a tool that ignores one needs no edit — Svelte drops a prop a
component does not declare. `toolPanelComponent` is the one place that is reconciled with the
registry's type, and it carries the reasoning: Svelte types a component's props contravariantly,
so widening `ToolPanelLoader` to `Component<ToolPanelProps>` fails to compile against the thirty
panels that declare no props at all.

## Artifact kinds

`ARTIFACT_KINDS` is every kind of content this build can store, built by registering the
`defineArtifactKind` entries the owning libraries declare. `$lib/artifact_kinds` owns the contract
and the registry mechanics and knows about no kind in particular; this is the one file that names
them.

```ts
import { artifactKindEntry, readRegisteredArtifactPayload } from '$lib/workshop';

const result = readRegisteredArtifactPayload(kind, payload, storedVersion);
if (!result.ok) quarantine(kind, payload, result.reason, result.message);
```

Assembled statically, and not by self-registration on import: a kind that exists only once
something happens to load its library is a kind that is missing exactly when an import needs it.
Registering the same id twice throws rather than letting one library's codec quietly read
another's payloads.

The imports here are deep — `$lib/culture/culture_artifact_kind`, not `$lib/culture` — and
measured. Through the entry points this registry costs 296 KB in whatever chunk imports it;
through the kind modules, 4 KB. `$lib/settlements` is the sharpest case: its entry point reaches
`$lib/organizations`, and from there the heraldry generator and the charge library. Everything in the workshop touches it, and a kind module holds
metadata and validation only: its codec is a dynamic import, which is what keeps 18 MB of charge
art out of the chunk that merely lists what a project contains.

### Adding a kind

Declare the entry with `defineArtifactKind` in the library that owns the payload — see
[`$lib/artifact_kinds`](../artifact_kinds/README.md) for the contract — then add one line here. No
generic code changes: not the store, not export, not the project view.

## Saving what a tool made

`saveToolArtifact` is the one entry point a generator needs, in a panel or on its own route. It
takes a **snapshot** rather than a live value: the tool already owns that conversion — it is the
`toSnapshot` half of its own kind — and asking for the snapshot keeps the save path off the codec
loader, which is the expensive half.

```ts
import { saveToolArtifact } from '$lib/workshop';

const result = await saveToolArtifact(project.id, {
  kind: CULTURE_ARTIFACT_KIND,
  payload: toCultureSnapshot(culture),
  toolPath: '/culture',
  seed,
});
```

It is here rather than in `$lib/artifacts` because it is where a _tool_ — a catalog path, and this
build's registry of kinds — meets the store, and the store deliberately knows about neither. A seed
that is not given records no provenance at all rather than an invented one, per the design
document: provenance is a record of origin, and a made-up seed is a lie the re-roll button acts on.

**A tool's `config` must be plain data.** The store writes through IndexedDB, which serialises with
`structuredClone`, and `structuredClone` refuses a Proxy — so a `config` held in a Svelte `$state`
object comes back as `storage-failed: could not be cloned`, with the generated content still on
screen and nothing saved. Build the record inline, or hold it in `$state.raw`; a provenance config
is replaced wholesale by every roll and never mutated in place, which is what raw state is for.

The draft also carries `references` — the saved artifacts the tool was handed, as
`SavedArtifactPicker` filled them in — so the link is recorded in the same write that stores what
was made. They are not checked against the project: the store tolerates a reference to something
that is gone by design, and a target deleted between choosing and saving must cost the link, not
the artifact.

## Using a saved artifact

`loadArtifactValue` is the other direction, and what the generic picker is built on: it reads a
saved artifact and runs the kind's codec over it, so a generator receives the live value its own
library works with rather than a stored snapshot.

```ts
import { loadArtifactValue } from '$lib/workshop';

const result = await loadArtifactValue(project.id, artifactId);
if (result.ok) {
  config.dominantCulture = result.value as Culture;
}
```

The value is `unknown`. The caller asked for a kind and narrows there; a registry that knew each
kind's types would be the hand-maintained list of kinds it exists to remove.

**Every failure is a value.** A target that has been deleted is `missing-target` rather than a
throw, because a reference to a missing artifact is an ordinary state under rule 3 of the design
document and its consumer must keep working. A codec that throws is caught for the same reason:
`validate` gates what `fromSnapshot` depends on rather than the whole tree, so a payload can
satisfy its kind and still surprise the conversion — a heraldry snapshot naming a charge this build
has dropped is the standing example — and one bad saved artifact must not take out the generator
holding it.

Rehydration is seeded from the artifact's id, so the same saved artifact rebuilds the same way
every time it is picked. Nothing is rolled: the payload is the truth, and the RNG is there to
rebuild name generators and the like.

`loadActiveProjectArtifactValues` is the bulk form, for a tool that wants to _offer_ everything of
a kind rather than resolve one thing a user picked — the character generators listing the cultures
available to name from. It hydrates first, because its callers are standalone routes that have not
read the store, and it leaves out artifacts it cannot read: a naming dropdown is not somewhere a
user can act on a broken payload, so dropping one costs an option where surfacing it would cost the
list.

## Editing a saved artifact

`openArtifactForEditing` is where an artifact is picked up to be changed: it reads the artifact,
resolves the kind's editor, and reports what this build can do to it. `saveArtifactEdits` writes
what the surface is holding, and `rerollArtifact` throws it away and rolls the artifact again from
its provenance.

```ts
import { hasUnsavedArtifactEdits, openArtifactForEditing, saveArtifactEdits } from '$lib/workshop';

const target = await openArtifactForEditing(project.id, artifactId);
if (target === undefined) return; // deleted out from under us — not a failure to report
const dirty = hasUnsavedArtifactEdits(target, { name, payload: draft });
const result = await saveArtifactEdits(project.id, artifactId, { name, payload: draft });
```

`ArtifactPanel.svelte` is the surface built on this, and it is the whole of the framework's UI:
the name field, the dirty state, saving, discarding, re-rolling, and the warnings before edits are
lost. A kind supplies the fields; it does not supply any of that.

**The payload is the truth.** Nothing here regenerates from provenance except `rerollArtifact`,
which is destructive, explicit, and confirmed by its caller. Saving writes the payload it is
given, and the kind's `validate` gates it on the way in like any other write — a rejection leaves
the artifact exactly as it was, which is why the payload is written before the name rather than
after it.

An untouched payload — `edits.payload === undefined` — is not rewritten at all, so renaming an
artifact does not restamp contents nobody changed.

## Artifact editors

`ARTIFACT_EDITORS` maps a kind to the component that edits it, alongside an optional roller.
**Culture, religion, settlement, and the AD&D 2E, fantasy, DCC, SWN and Uncharted Worlds
characters are the entries**, and most kinds having none is the shipped state: #39
built the frame, and an editing view for a particular kind is part of taking that tool to
Release-ready (docs/workshop.md, section 4). A kind with no entry opens read-only — the stored
snapshot, rendered honestly — which is a state the surface draws rather than an error it reports.
Heraldry is the standing example.

```ts
export const ARTIFACT_EDITORS: ArtifactEditorRegistry = {
  culture: {
    loadEditor: () => import('$components/factions/CultureArtifactEditor.svelte'),
    loadRoller: async () => {
      const { readCultureGeneratorConfig, rollCultureSnapshot } =
        await import('$lib/culture/culture_roll.js');
      return (provenance) =>
        rollCultureSnapshot(provenance.seed, readCultureGeneratorConfig(provenance.config));
    },
  },
  religion: {
    /* … the same two lines again, and nothing else. */
  },
};
```

Nothing in the framework changed to accommodate culture (#40), religion (#41), or settlement
(#20), which is the claim these entries exist to test: adding a kind is a line here and a component
taking `ArtifactEditorProps`. The three were chosen to be progressively less like each other —
culture is a flat record, religion is a list of sub-objects, and a settlement is sixteen legitimate
shapes of one kind, since its enrichment is opt-in four times over — and none of them needed
anything here.

The specifiers are written out in full, for the reason `TOOL_PANELS` is: a bundler can only split
a dynamic import it can see.

An editor is handed a **snapshot** and an `onChange` that takes a whole replacement snapshot. It
owns its fields and nothing else — a patch would need a merge only the kind could write, and
dirty state, saving, and re-rolling are the framework's.

The roller sits beside the editor rather than in the kind registry because re-rolling exists to
undo edits: a kind nobody can change has nothing for a re-roll to destroy. `rerollArtifact` is
unavailable in two different ways, and they read differently on screen —
`artifactRerollAvailability` tells them apart: `unsupported` is a kind with no roller, and
`no-provenance` is an artifact with no record of its own origin, which is everything adopted from
`ironarachne.save.v1.*` (#34 records provenance as absent rather than inventing a seed).

## Unsaved edits

`trackUnsavedEdits` is how a surface holding unwritten changes answers for itself, and
`hasUnsavedEdits` is how something else asks. It exists because the workshop is one route: the
control that closes a panel belongs to the bench, `beforeNavigate` never fires for it, and closing
a panel is the likeliest way to lose an edit.

```ts
const stop = trackUnsavedEdits(artifactId, () => dirty);
```

It holds predicates rather than booleans, so the answer is computed when it is asked for. A flag
pushed in on every keystroke would be a second copy of the surface's dirty state, and the copy is
what would be stale at the moment it mattered.
