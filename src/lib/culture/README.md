# Culture

This library generates a **culture**: its name, the naming traditions its people use, how it
organizes power and work, its religion, its taboos, and the small distinguishing habits — how it
greets, eats, decorates, and makes music. A culture's `nameGenerators` are the piece other
generators reach for most, because they let a settlement, family, or character be named consistently
with the place they come from.

## Features

- **Types** — `Culture`, `CultureGenerationConfig`, and `CulturalOrganization`.
- **Generation** — `generateCulture` (seeded), with `getDefaultCultureGenerationConfig`;
  `generateCulturalOrganization` builds only the social structure.
- **Description** — `describeOrganization` turns a `CulturalOrganization` into prose.
- **Saved cultures** — `loadSavedCultures`, `saveCultures`, `appendSavedCulture`,
  `deleteSavedCultureByName`, and the snapshot-level equivalents (`loadSavedCultureSnapshots`,
  `saveCultureSnapshots`, `readCultureSavePayload`, `writeCultureSavePayload`).

## Usage

```typescript
import { generateCulture, getDefaultCultureGenerationConfig } from '$lib/culture';

const config = getDefaultCultureGenerationConfig();
const culture = generateCulture('some seed', config);

culture.taboos;
culture.religion.name;

// Name someone from this culture
const [name] = culture.nameGenerators.female.generate(1);
```

## Persistence

A `Culture` holds live name-generator objects, which cannot be serialized. Saving therefore goes
through a **snapshot**: `toCultureSnapshot` reduces a culture to storable data, and
`cultureFromSnapshot` rebuilds the generators from it given an `RNG`. Both live in
`$lib/culture/culture_snapshot` rather than the index, because the `loadSavedCultures` and
`saveCultures` helpers already do that conversion for you.

```typescript
import { appendSavedCulture, loadSavedCultures } from '$lib/culture';

appendSavedCulture(culture);
const saved = loadSavedCultures();
```

Storage is `localStorage` via [`$lib/persistent_save`](../persistent_save/README.md); nothing leaves
the browser.
