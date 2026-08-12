# Architecture

This library generates an **architectural style** — what the buildings of a place look like and why
— from the materials actually available there, the site's climate and terrain, how densely it is
settled, and what the buildings are for. It is the bridge between a region's resources and its
settlements' appearance: a peat bog with no stone and heavy rain produces a different vernacular
than a dry, rocky, quarry-rich hillside, without either being written down anywhere.

Generation is deterministic: `generateArchitecturalStyle` takes a seed in its config and builds its
own `RNG`, so the same inputs always produce the same style.

## Features

- **`generateArchitecturalStyle`** — score the available `Resource`s against the site and purposes,
  then choose structural system, massing, roof, openings, windowing, additions, and the decorative
  vocabularies that survive material and site filtering.
- **`describeArchitecturalStyle`** — prose description of a finished style;
  `fragmentsForArchitecturalStyle` returns the individual sentences instead, for callers assembling
  their own text.
- **Pieces of the pipeline**, exported for reuse and testing: `buildWindowingStyle`,
  `buildBuildingAdditions`, and `populationDensityToBand`.
- **Catalogs** — `DECORATIVE_STYLE_ENTRIES` and `BUILDING_ADDITION_CATALOG`, each entry carrying the
  material requirements that decide whether it is available at all.
- **Types** — `ArchitecturalStyle`, `GenerateArchitecturalStyleConfig`, `ArchitecturalSiteContext`,
  and the vocabularies they draw on (`StructuralSystem`, `MassingStyle`, `RoofStyle`,
  `OpeningStyle`, `WindowingStyle`, `BuildingAddition`, `DecorativeStyleId`, `BuildingPurpose`).

## Usage

```typescript
import { describeArchitecturalStyle, generateArchitecturalStyle } from '$lib/architecture';

const style = generateArchitecturalStyle({
  seed: 'riverport',
  availableResources: region.resources,
  purposes: ['residential', 'civic'],
  populationDensity: 0.7, // or populationDensityBand: 'high'
  decorativeStyles: ['geometric_interlace'],
  site: {
    substrate: 'clay_rich',
    relief: 'flat',
    // ...the rest of the site context
  },
});

style.primaryMaterials; // what the walls are made of
style.roof; // the roof form those materials and that climate imply

const description = describeArchitecturalStyle(style);
```

`populationDensity` is a 0–1 scale; pass `populationDensityBand` instead when you already have a
band. If `purposes` is empty the generator assumes `residential`.

`ArchitecturalStyle.generatorHints` (preferred storey count, courtyard likelihood, vertical
emphasis) exists for a future building generator — nothing consumes it yet, and it is safe to
ignore.
