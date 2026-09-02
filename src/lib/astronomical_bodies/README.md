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

Rendering these bodies is a separate concern — see [`$lib/renderers`](../renderers/README.md) for
the star and planet renderers that draw them.
