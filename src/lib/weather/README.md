# weather

The **weather** library is a small toolkit for **event-based, calendar-aware weather** in generated worlds. It builds on [`$lib/calendar`](../calendar/index.ts) and [`$lib/simulation_time`](../simulation_time/README.md): instants are [`SimulationInstant`](../simulation_time/simulation_instant.ts) values, not “one weather per Gregorian midnight.”

It does **not** include persistence, databases, or UI. It gives you **data shapes**, **time-range tiling**, **deterministic RNG scoping**, and **atmospheric/heuristic formulas** you can wire into generators or routes.

## Modules

| Area             | File                     | Role                                                                                                                                                                                    |
| ---------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Climate sampling | `climate_profile.ts`     | Bin season phase and attach **weights per phenomenon id** for your own RNG rolls.                                                                                                       |
| Events           | `weather_events.ts`      | `WeatherEvent` intervals, **active** queries, and **sequential timeline fill** (carryover past a range end).                                                                            |
| RNG              | `rng_streams.ts`         | **Stable child RNGs** from a base seed + path segments (world / region / batch).                                                                                                        |
| Derived feel     | `atmospheric_derived.ts` | Dew point, wind chill, heat index, dry lapse, visibility heuristic (°C / m / m/s internally; temperature conversion helpers come from [`$lib/measurements`](../measurements/index.ts)). |

Import everything from the barrel:

```ts
import {
  type ClimateWeatherProfile,
  phenomenonWeightsAtInstant,
  fillTimelineWithSequentialWeatherEvents,
  weatherRngFromPath,
  dewPointCelsius,
} from '$lib/weather';
```

## Climate profiles

A [`ClimateWeatherProfile`](./climate_profile.ts) splits the year into **equal-width phase bins** (`seasonPhaseBinCount`). For each bin you store weighted **phenomenon ids** (strings you define: `"clear"`, `"monsoon"`, etc.). Orbital fields (`OrbitalSeasonParams`) feed [`seasonPhase01`](../simulation_time/season_phase.ts) so the active bin tracks time of year on your **custom** calendar.

Use [`phenomenonWeightsAtInstant(calendar, profile, instant)`](./climate_profile.ts) to read the weights for the current instant, then use [`RNG.weighted`](https://www.npmjs.com/package/@ironarachne/rng) or your own sampler.

Validate profiles in tests with [`validateClimateWeatherProfile`](./climate_profile.ts) or [`assertValidClimateWeatherProfile`](./climate_profile.ts).

## Weather events (intervals, not “days”)

A [`WeatherEvent`](./weather_events.ts) has `start` and `end` [`SimulationInstant`s](../simulation_time/simulation_instant.ts), plus kind, wind, temperature (°C), visibility (m), and optional [`StormGeometry`](./weather_events.ts).

- [`getActiveWeatherEventsAt(calendar, events, instant)`](./weather_events.ts) — intervals that contain `instant` (`start <= t < end`).
- [`fillTimelineWithSequentialWeatherEvents(config)`](./weather_events.ts) — walk forward from `rangeStart`, sampling **duration** (`minEventHours`…`maxEventHours`) and **kind** via your callbacks until no new event **starts** before `rangeEnd`. The **last** generated event may **end** after `rangeEnd` (carryover). Sample `kind` can use weights from a climate profile.

## Deterministic RNG branches

[`weatherRngFromPath(baseSeed, …segments)`](./rng_streams.ts) returns a new [`RNG`](https://www.npmjs.com/package/@ironarachne/rng) from a stable string key. Use it so different worlds/regions/day batches do not share the same number stream.

## Atmospheric helpers

[`atmospheric_derived.ts`](./atmospheric_derived.ts) exposes physics-inspired helpers (dew point, NWS-style wind chill in °C with wind in **m/s**, heat index-style feel, dry-adiabatic lapse, crude visibility km). These are meant for **copy** or **tooling**, not a full mesoscale model.

## Related libraries

- **`$lib/simulation_time`** — time arithmetic and season phase.
- **`$lib/calendar`** — month/day/week definitions and validation.
- **`$lib/measurements`** — generic °C/°F/K, lengths, masses (used inside `atmospheric_derived`).

## Tests

Colocated `*.test.ts` files cover behavior. Run `npm test` from the repository root.
