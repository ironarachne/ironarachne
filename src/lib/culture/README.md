# Culture

This library generates a **culture**: its name, the naming traditions its people use, how it
organizes power and work, its religion, its taboos, and the small distinguishing habits — how it
greets, eats, decorates, and makes music. A culture's `nameGenerators` are the piece other
generators reach for most, because they let a settlement, family, or character be named consistently
with the place they come from.

Culture is **Release-ready** against the readiness spec in
[`docs/workshop.md`](../../../docs/workshop.md): it produces a durable artifact, that artifact can be
edited field by field, it composes with a saved religion, and it exports for the table.

## Features

- **Types** — `Culture`, `CultureGenerationConfig`, `CultureReligionSource`, and
  `CulturalOrganization`.
- **Generation** — `generateCulture` (seeded), with `getDefaultCultureGenerationConfig`;
  `generateCulturalOrganization` builds only the social structure.
- **Description** — `describeOrganization` turns a `CulturalOrganization` into prose.
- **Artifact kind** — `cultureArtifactKind`, `validateCultureSnapshot`, `migrateCultureSnapshot`.
- **Editing** — `renameCulture`, `setCultureTrait`, `setCultureOrganizationField`,
  `redescribeCultureOrganization`, `setCultureTaboo`, `addCultureTaboo`, `removeCultureTaboo`,
  `setCultureReligionField`.
- **Re-rolling** — `rollCultureSnapshot` and `readCultureGeneratorConfig`, which turn an artifact's
  provenance back into a fresh culture.
- **Presentation** — `cultureToDocument`, `cultureToMarkdown`, `cultureToPlainText`,
  `cultureFileStem`.
- **Choosing among saved cultures** — `mergeCultureChoices`.
- **Legacy saves (read-only)** — `loadSavedCultures`, `loadSavedCultureSnapshots`,
  `deleteSavedCultureByName`, and the payload-level helpers.

## Usage

```typescript
import { generateCulture, getDefaultCultureGenerationConfig } from '$lib/culture';

const config = getDefaultCultureGenerationConfig();
const culture = generateCulture('some seed', config);

culture.taboos;
culture.religion?.name;

// Name someone from this culture
const [name] = culture.nameGenerators.female.generate(1);
```

A culture's **name comes from the name generators it is handed**, not from the seed — a generator
carries its own RNG. To make the name follow the seed, build the generator set from it:

```typescript
const rng = new RNG(seed);
const culture = generateCulture(seed, { nameGenerators: getFantasyNameGeneratorSet('elf', rng) });
```

## Religion: its own, or one it references

`culture.religion` is `Religion | null`. Null means a **referenced religion artifact** supplies it,
and the link lives on the artifact's references rather than in the payload — so editing that
religion changes every culture that points at it, and no culture carries a stale copy. Ask for it
with `religionSource`:

```typescript
generateCulture(seed, { nameGenerators, religionSource: 'reference' });
```

The religion's seed is drawn either way, so a culture built around a reference is otherwise
identical to the same seed built without one. Composition is opt-in: the default is `generate`, and
a caller that says nothing gets the behaviour it always had.

## Persistence

A `Culture` holds live name-generator objects, which cannot be serialized. Saving therefore goes
through a **snapshot**: `toCultureSnapshot` reduces a culture to storable data, and
`cultureFromSnapshot` rebuilds the generators from it given an `RNG`.

Cultures are saved into a **project**, through the artifact store — see
[`$lib/artifacts`](../artifacts/README.md) and [`$lib/workshop`](../workshop/README.md). A generator
hands over a snapshot and gets back a stored artifact that can be named, edited, referenced, and
exported.

```typescript
import { CULTURE_ARTIFACT_KIND, toCultureSnapshot } from '$lib/culture';
import { saveToolArtifact } from '$lib/workshop';

await saveToolArtifact(projectId, {
  kind: CULTURE_ARTIFACT_KIND,
  payload: toCultureSnapshot(culture),
  toolPath: '/culture',
  seed,
});
```

### The legacy scope

`culture_saved_state.ts` reads the global `localStorage` scope cultures were saved to before
projects existed. **Nothing writes new cultures there.** It survives because that scope still holds
work: [`$lib/legacy_adoption`](../legacy_adoption/README.md) copies it
into a project, and the character generators offer it for naming beside what a project holds — see
`mergeCultureChoices`. It is read-only as of #44: nothing writes there, and the page that browsed and deleted these is gone.
