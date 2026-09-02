# Astronomical bodies

This library generates **stars, planets, and moons** — and whole star systems containing them — with
physically plausible numbers rather than decorative ones. Luminosity, radius, and mass determine
surface temperature; temperature and albedo constrain each other; a parent body's mass decides how
many moons it can hold and how fast they turn. It also carries the unit conversions that make those
figures readable.

Classifications (spectral class, luminosity class, planet and moon types) are data tables here, so a
generated body can be described as "G2V main sequence" or "hot desert world" instead of only as a
set of numbers.

## Features

- **`AstronomicalBody`** — the one shape used for stars, planets, and moons: albedo, axial tilt,
  classification, gravity, luminosity, mass, orbital distance and period, radius, rotation period,
  surface pressure, and surface temperature, in documented units.
- **Generation** — `generateStar`, `generatePlanet`, `generateMoon`, and `generateStarSystem`, each
  with a matching `getDefault*Config`.
- **Classifications** — `getStarClassifications`, `getPlanetClassifications`,
  `getMoonClassifications` (and `getStandardMoonClassifications`), with lookup, search, and sort
  helpers: `getStarClassificationByName`, `getStarClassificationBySpec`,
  `searchStarClassificationsByName`, `getPlanetClassificationByName`,
  `searchPlanetClassificationByName`, `getMoonClassificationByName`, plus `getSpectralClasses` and
  `getLuminosityClasses`.
- **Physics** — `getSolarTemperature`, `getPlanetTemperature`, `getGravityFromMassAndRadius`,
  `getAlbedoFromTemperature`, `getNumberOfMoonsForParent`, `getRotationPeriod`, and
  `stefanBoltzmannConstant`.
- **Unit conversions** — `convertAUToKM`, `convertKMToAU`, `convertSolarRadiusToKM`,
  `convertKMToSolarRadius`, `convertSolarMassToKG`, `convertKGToSolarMass`,
  `convertSolarLuminosityToWatts`, `convertWattsToSolarLuminosity`,
  `convertStandardGravityToMPS2`, and `convertMPS2ToStandardGravity`.

## Usage

```typescript
import { RNG } from '@ironarachne/rng';
import {
  convertAUToKM,
  generateStarSystem,
  getDefaultStarSystemGeneratorConfig,
} from '$lib/astronomical_bodies';

const config = getDefaultStarSystemGeneratorConfig(new RNG('my-seed'));
const system = generateStarSystem(config);

const firstPlanet = system.planets[0];
firstPlanet.surface_temperature; // Kelvin
convertAUToKM(firstPlanet.orbital_distance); // km
```

Every `getDefault*Config` helper takes the RNG it should draw from — none seeds itself from the
clock, so a run is reproducible from the seed that made its RNG. Generating a single body works
the same way:

```typescript
import { generatePlanet, getDefaultPlanetGenerationConfig } from '$lib/astronomical_bodies';

const planet = generatePlanet(getDefaultPlanetGenerationConfig(new RNG('my-seed')));
```

## The planet artifact kind

The five modules the readiness pass gives every Release-ready tool
([docs/tool-readiness.md](../../../docs/tool-readiness.md)), flat at the library root beside the
generators:

- **`planet_roll.ts`** — the one path from a seed to a planet, its moons and any civilization on it,
  taken by the generator page and by a re-roll from provenance. It owns the whole roll, which used
  to live in `PlanetGenerator.svelte`. `planetPreviewSeed` derives the preview's seed from the
  roll's rather than drawing it afterwards, so a seed reproduces what you saw.
- **`planet_snapshot.ts`** — writing a planet for storage and reading it back, both halves in one
  file because reading pulls nothing heavy. The body's own fields sit at the top level with the
  moons and the civilization beside them, so a stored planet reads as the `AstronomicalBody` it is.
  The preview image is never stored: it is a rendering of the numbers above it, and a stored image
  cannot be re-rendered larger or on the other backend.
- **`planet_artifact_kind.ts`** — kind `planet`, payload version 1, with the validator and the
  migration stub. Every measurement is checked for being _finite_, not merely for being a number:
  `NaN` is what an emptied field in a hand-edited payload produces and it propagates silently.
- **`planet_editing.ts`** — pure snapshot-to-snapshot field edits. Nothing recomputes: changing a
  mass does not recompute the gravity, even though `getGravityFromMassAndRadius` is one import
  away, because a referee who set a gravity made a decision.
- **`planet_presentation.ts`** — the planet as a document of titled sections, empty ones dropped,
  written once as Markdown and once as plain text for the PDF. It is also what the generator page
  renders, so what a referee reads on screen and what they take away cannot drift. A planet's
  luminosity is never printed: it is always zero, and the field exists because a star needs it.

Rendering these bodies is a separate concern — see [`$lib/renderers`](../renderers/README.md) for
the star and planet renderers that draw them.
