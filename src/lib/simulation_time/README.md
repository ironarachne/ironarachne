# simulation_time

**Simulation time** is the shared notion of “when” for generated worlds: a single representation of instants and ordering that works with [custom calendars](../calendar/index.ts) (any year length, any day length in hours) without assuming Earth days or midnight-aligned weather.

Use it whenever you need to:

- Schedule or compare **moments** in fictional time (weather events, phases, campaigns).
- Step time by **hours** across day and year boundaries in a calendar-consistent way.
- Drive **seasonal** sampling (e.g. climate weights) via a scalar phase in `[0, 1)`.

It pairs with `$lib/calendar` for named months, weekday names, and `CalendarDate`; this module adds **time-of-day** and **total ordering** the raw calendar type does not define by itself.

## Concepts

### `SimulationInstant`

A point in time expressed as:

| Field       | Meaning                                                                        |
| ----------- | ------------------------------------------------------------------------------ |
| `yearIndex` | Zero-based year from an arbitrary era start (year 0, day 1, hour 0).           |
| `dayOfYear` | `1 … calendar.yearLengthInDays`                                                |
| `hourOfDay` | `[0, calendar.dayLengthInHours)` — hours since the start of that calendar day. |

The **era** is implicit: “hour 0” is the beginning of day 1 of year 0. All conversions and arithmetic are relative to that anchor for a given `Calendar`.

### Normalization

If components are out of range (e.g. `hourOfDay` too large), use `normalizeSimulationInstant(calendar, instant)` to fold overflow into the correct day, year, and hour.

### Monotonic “tick”

Internally, instants map to **non-negative hours since the era start** (`simulationInstantToHoursSinceEra` / `simulationInstantFromHoursSinceEra`). That value is strictly ordered and round-trips with a normalized `SimulationInstant`.

## Usage

### Import

```ts
import {
  type SimulationInstant,
  addHoursToSimulationInstant,
  calendarDateHourToSimulationInstant,
  compareSimulationInstants,
  fractionOfYear,
  normalizeSimulationInstant,
  simulationInstantFromHoursSinceEra,
  simulationInstantToCalendarDate,
  simulationInstantToHoursSinceEra,
} from '$lib/simulation_time';
```

### From a calendar date + hour

If you already have a `CalendarDate` (from `convertGregorianDateToCalendarDate` or UI state):

```ts
const instant = calendarDateHourToSimulationInstant(calendar, calendarDate, 14.5); // 14.5 hours into that day
```

### To display fields (month name, weekday, etc.)

```ts
const date = simulationInstantToCalendarDate(calendar, instant);
// date.year, date.month.name, date.dayOfMonth, date.dayOfWeek.name, …
```

### Move time forward (e.g. travel, long weather spans)

```ts
const later = addHoursToSimulationInstant(calendar, instant, 30); // 30 hours later, rolling days/years as needed
```

### Compare or sort events

```ts
const cmp = compareSimulationInstants(a, b); // -1 | 0 | 1
```

### Season / yearly fraction

`fractionOfYear(calendar, instant)` returns where the instant falls within its calendar year, in `[0, 1)`.

For weather-related **orbital** flavor (eccentricity / perihelion hook), use `seasonPhase01` from the same package (see below).

---

## Season phase (`season_phase.ts`)

`seasonPhase01(calendar, instant, orbitalParams)` returns a value in `[0, 1)` suitable for binning or weight tables: mostly the same idea as `fractionOfYear`, plus a small optional shift from `OrbitalSeasonParams` (eccentricity, perihelion day). Axial tilt is kept on the type for future insolation models but does not change the scalar phase yet.

`defaultOrbitalSeasonParams(calendar)` gives Earth-like defaults clamped to your calendar’s year length.

```ts
import { defaultOrbitalSeasonParams, seasonPhase01 } from '$lib/simulation_time';

const phase = seasonPhase01(calendar, instant, defaultOrbitalSeasonParams(calendar));
```

## Related code

- **`$lib/calendar`** — `Calendar` definition, `getGregorianCalendar`, `buildCalendarFromMonthLengths`, validation.
- **`$lib/weather`** — climate profiles and weather events that use `SimulationInstant` for intervals.

## Tests

Behavior is covered by Vitest tests colocated with the modules (`*.test.ts`). Run `npm test` from the repo root.
