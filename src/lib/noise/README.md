# Noise

This library provides **seeded 2D simplex noise**: the smooth pseudo-random field that terrain
elevation, moisture, and other continuous map properties are sampled from.

It is a single function by design. `createSimplexNoise2D(seed)` builds a sampler with its own
permutation table derived from the seed, so two samplers with the same seed agree everywhere and
two with different seeds share nothing — which is what lets a map's elevation and moisture be
independent while both staying reproducible.

## Features

- **`createSimplexNoise2D(seed)`** — returns `(x, y) => number`, a sampler producing values in the
  usual simplex range of roughly −1 to 1.

## Usage

```typescript
import { createSimplexNoise2D } from '$lib/noise';

const elevationNoise = createSimplexNoise2D(`${seed}-elevation`);
const moistureNoise = createSimplexNoise2D(`${seed}-moisture`);

const elevation = elevationNoise(x / 200, y / 200); // divide to set the feature size
```

Divide the coordinates before sampling: the divisor is the scale of the features you get, with
larger divisors producing broader, smoother shapes. Summing several samplers at doubling
frequencies and halving amplitudes (fractal noise) gives terrain that has both continents and
coastline detail.

Consumers: [`$lib/map`](../map/README.md).
