# Workshop

Where the workshop's two registries are assembled: a tool in the [catalog](../tools) mapped to the
component that renders it, and an artifact [kind](../artifact_kinds/README.md) mapped to the
library that knows how to store it.

Both are lists of static imports, and both are here for the same reason — the libraries they name
must not know about each other, and the assembly has to be somewhere that no one imports by
accident.

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
through the kind modules, 4 KB. Everything in the workshop touches it, and a kind module holds
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
