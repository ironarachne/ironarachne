# Religion

This library generates a **religion**: its category and name, its pantheon and the deities in it,
the divine realms they inhabit, the cosmology of lesser beings between gods and mortals, and — for
traditions that have no gods at all — the spirit ecology and duties that stand in their place.

Its organizing idea is **comparative dimensions**, after Ninian Smart's dimensions of religion:
rather than a bag of unrelated details, a generated religion is described along axes (ritual,
narrative, doctrine, ethics, social, experiential, material) that a reader can compare between
faiths. A religion's category biases those dimensions, so a shamanic tradition and a monotheistic
one come out different in kind, not just in wording.

Religion is **Release-ready** against the readiness spec in
[`docs/workshop.md`](../../../docs/workshop.md): it produces a durable artifact, that artifact can be
edited a god at a time, it composes with a saved culture in both directions, and it exports for the
table.

## Features

- **Types** — `Religion` (name, description, `dimensions`, `cosmology`, `nonTheisticDetail`,
  `realms`, and `pantheon`), `ReligionCategory`, `ReligionGenerationConfig`, plus the dimension and
  complexity types.
- **Generation** — `generateReligion(seed, config)` with `getDefaultReligionGenerationConfig`.
- **Dimensions** — `generateReligionDimensions` and `activeReligionDimensionIdsForConfig`.
- **Cosmology** — `generateReligionCosmology` for the orders of beings around the high gods.
- **Non-theistic traditions** — `generateNonTheisticReligionDetail`, and the helpers
  `isPolytheisticCategory` and `resolvePolytheisticStanding` for deciding how a category treats its
  many-or-one gods.
- **Narrative** — `composeReligionDescription`, `composeReligionOverviewDescription`,
  `composePantheonDescriptionLine`, and `summaryTextForReligionDimension`.
- **Flavour** — `randomGatheringPlace` and `randomGatheringTimes`.
- **Snapshots** — `toReligionSnapshot`/`religionFromSnapshot`, and the `RestoredReligion` a saved
  religion comes back as.
- **Artifact kind** — `religionArtifactKind`, `validateReligionSnapshot`, `migrateReligionSnapshot`.
- **Editing** — `renameReligion`, `setReligionDescription`, `setReligionDimensionSummary`,
  `setReligionCosmologySummary`, `setSpiritEchelonField`, `setSpiritEchelonRankDepth`,
  `setDivineRealmField`, `setPantheonDescription`, `setDeityField`,
  `setDeityRelationshipDescription`, `removeDeity`, `setNonTheisticField`.
- **Re-rolling** — `rollReligionSnapshot` and `readReligionGeneratorConfig`, which turn an
  artifact's provenance back into a fresh religion.
- **Presentation** — `religionToDocument`, `religionToMarkdown`, `religionToPlainText`,
  `religionFileStem`, and `deityTitleLine`.
- **Legacy saves (read-only)** — `loadSavedReligionSnapshots`, `deleteSavedReligionBySeed`, and the
  payload-level helpers.

## Sub-directories

`categories/`, `deities/`, `domains/`, `pantheons/`, and `realms/` each own one part of the model —
the category table, deity and pantheon generation, domain sets, and the divine realms. They are
consumed by `religion_generation.ts` rather than exported wholesale, so the index stays a
curated surface rather than everything the library contains.

## Usage

```typescript
import { generateReligion, getDefaultReligionGenerationConfig } from '$lib/religion';

const religion = generateReligion('some seed', getDefaultReligionGenerationConfig());

religion.name;
religion.pantheon?.members.length;
religion.dimensions;
```

Constrain the run through the config — the categories it may pick from, the species its deities may
resemble, the name generators, and `dimensionGeneration` for hard constraints on the dimensions
(where a category's `dimensionHints` only bias them):

```typescript
import { ReligionCategories as Categories } from '$lib/religion';

const config = getDefaultReligionGenerationConfig();
config.categories = Categories.all().filter((category) => category.hasDeities);
```

## Composition, in both directions

Religion sits on both sides of a reference. It **consumes** a culture — a saved culture's name
generators name the religion and its gods — and it is **consumed by** one, since a culture whose
`religion` is `null` takes its faith from a referenced religion artifact. `culture → religion →
culture` is therefore the ordinary arrangement rather than a pathological one, and everything that
walks references tolerates the cycle it makes (requirement 5.4; `collectReferencedArtifacts` visits
each id once).

Composition is opt-in. Handed no culture, the generator names its gods from the human pattern set
exactly as it always did.

## Presentation

`religionToDocument` arranges a religion for reading — overview, tradition or dimensions, cosmology,
realms, then a section per god — and drops every section with nothing under it, so requirement 6.4
is a property of the model rather than something each format remembers separately.
`religionToMarkdown` and `religionToPlainText` write that document out; the plain text is what the
PDF export prints.

`deityTitleLine` is here rather than in the markup because a `Title` is a record with a form per
gender, not a string: printed straight, a crowned god read as `[object Object]`.

## Editing a saved religion

`religion_editing.ts` changes one part of a stored snapshot and returns a new one, leaving
everything else exactly as it was. That is requirement 4.4 of the workshop spec, and a pantheon is
what makes it a real requirement rather than a nicety: renaming the god of storms must not disturb
the god beside them, the realms, or the seed the whole thing came from.

```typescript
import { renameReligion, setDeityField } from '$lib/religion';

const renamed = renameReligion(snapshot, 'The Ashen Path');
const edited = setDeityField(renamed, 0, 'name', 'Vethra');
```

There is no function that _adds_ a deity. A god is a generated character with a species, an age,
physical traits and a domain set, so an "empty" one would be a broken record rather than a blank
field — and rolling a fresh one mid-edit would be generating over a payload the user is working on.
`removeDeity` is the counterpart that does exist, and it takes the relationships naming that god
with it and moves the pantheon's leader index to follow.

## Persistence

A religion is saved into a **project**, through the artifact store — see
[`$lib/artifacts`](../artifacts/README.md) and [`$lib/workshop`](../workshop/README.md). The payload
is a `ReligionSnapshot`: the religion, the seed, and the generator options, so a saved religion can
be picked back up and rolled on from where it was left.

```typescript
import { RELIGION_ARTIFACT_KIND, toReligionSnapshot } from '$lib/religion';
import { saveToolArtifact } from '$lib/workshop';

await saveToolArtifact(projectId, {
  kind: RELIGION_ARTIFACT_KIND,
  payload: toReligionSnapshot(religion, seed, generatorOptions),
  toolPath: '/fantasy/religion',
  seed,
});
```

`toReligionSnapshot` strips the functions a live religion carries — the mutators hanging off its
domains and realms, which shaped its gods during generation and are read again by nothing. Every
other part of a religion is already plain data, so the round trip is otherwise lossless.

Provenance carries one thing the generator options do not: `nameGeneratorSet`, the name pattern set
the gods were named from. It is what lets `rollReligionSnapshot` reproduce a religion that borrowed
a **saved culture's** names, since a roll is handed a seed and a config and has no way to reach back
into the store for the culture itself.

### The legacy scope

`religion_saved_state.ts` reads the global `localStorage` scope religions were saved to before
projects existed. **Nothing writes new religions there.** It survives because that scope still holds
work: `/saved-data` browses it, [`$lib/legacy_adoption`](../legacy_adoption/README.md) copies it into
a project, and a link from that page still opens one in the generator. Entries there are keyed by
**seed** — `deleteSavedReligionBySeed` — because a religion is reproducible from its seed and
config, and the seed is what such a link carries. It goes when `/saved-data` does (#44).
