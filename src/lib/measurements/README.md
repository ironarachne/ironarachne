# Measurements

This library holds **unit conversions** — temperature, length, and mass — plus one formatting helper
for expressing inches as feet and inches. Generators store values in one unit and display them in
whichever the reader expects, and this is the single place that conversion lives.

Astronomical units (AU, solar masses, solar radii) are not here; they belong to
[`$lib/astronomical_bodies`](../astronomical_bodies/README.md), which is the only thing that uses
them.

## Features

- **Temperature** — `cToF`, `cToK`, `fToC`, `fToK`, `kToC`, and `kToF`.
- **Length** — `cmToInches`, `inchesToCM`, `feetToMeters`, `metersToFeet`, `kilometersToMiles`, and
  `milesToKilometers`.
- **Mass** — `kgToPounds` and `poundsToKG`.
- **Formatting** — `inchesToFeetExpression` renders a height in inches as something readable.

## Usage

```typescript
import { cToF, inchesToFeetExpression, kgToPounds } from '$lib/measurements';

cToF(21); // 69.8
kgToPounds(80); // 176.37
inchesToFeetExpression(71); // "5'11\""
```

The conversions are plain arithmetic and do no rounding — round at the point of display, so
intermediate maths keeps its precision.
