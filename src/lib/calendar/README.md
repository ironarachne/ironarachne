# Calendar

This library models **calendar systems** — real or invented — as year length, week length, months,
named days, and recurring events. It answers the questions a setting needs: what month is day 212
in, what weekday is it, what is happening that day, and what would today's date be in this world's
reckoning.

Days are addressed by **day of year** (1-based). A month knows its `startDay` and `length`, so a
calendar need not have equal months, twelve months, or seven-day weeks.

## Features

- **Types** — `Calendar`, `CalendarMonth`, `CalendarDay`, `CalendarDate`, and `CalendarEvent`.
- **Queries** — `getMonthForDay`, `getDayOfWeek`, and `getEventsForDay`.
- **Gregorian bridge** — `getGregorianCalendar` for the real calendar, and
  `convertGregorianDateToCalendarDate` to map a real date into a fictional one via the calendar's
  `gregorianBaseDate`.
- **Construction** — `buildCalendarFromMonthLengths` and `buildFictionalCalendarFromMonthLengths`
  compute each month's `startDay` and the year length from a list of month lengths, so those stay
  consistent by construction. Both validate the result before returning it, and the fictional
  variant simply passes a `null` `gregorianBaseDate`.
- **Validation** — `validateCalendar` returns a list of `CalendarValidationIssue`s;
  `assertValidCalendar` throws on the first problem.

## Usage

```typescript
import {
  buildFictionalCalendarFromMonthLengths,
  getDayOfWeek,
  getEventsForDay,
  getMonthForDay,
} from '$lib/calendar';

const calendar = buildFictionalCalendarFromMonthLengths({
  dayLengthInHours: 24,
  daysInWeek: 5,
  monthNames: ['Frostwane', 'Seedfall', 'Highsun'],
  monthLengths: [40, 40, 40],
  weekdayNames: ['Firstday', 'Secondday', 'Thirdday', 'Fourthday', 'Fifthday'],
});

getMonthForDay(calendar, 45).name; // 'Seedfall'
getDayOfWeek(calendar, 45).name;
getEventsForDay(calendar, 45); // the events spanning that day
```

`getMonthForDay` throws when the day of year falls outside the calendar's year, and
`convertGregorianDateToCalendarDate` throws when the calendar has no `gregorianBaseDate` — both are
caller bugs rather than expected outcomes. Validate a hand-written calendar before using it:

```typescript
import { assertValidCalendar, validateCalendar } from '$lib/calendar';

const issues = validateCalendar(calendar);
assertValidCalendar(calendar); // or throw on the first issue
```
