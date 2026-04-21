import type { Calendar, CalendarEvent, CalendarMonth } from './index';

export type CalendarValidationIssue = {
  path: string;
  message: string;
};

export function validateCalendar(calendar: Calendar): CalendarValidationIssue[] {
  const issues: CalendarValidationIssue[] = [];

  if (!Number.isInteger(calendar.yearLengthInDays) || calendar.yearLengthInDays < 1) {
    issues.push({ path: 'yearLengthInDays', message: 'Must be a positive integer.' });
  }
  if (!Number.isFinite(calendar.dayLengthInHours) || calendar.dayLengthInHours <= 0) {
    issues.push({ path: 'dayLengthInHours', message: 'Must be finite and positive.' });
  }
  if (!Number.isInteger(calendar.daysInWeek) || calendar.daysInWeek < 1) {
    issues.push({ path: 'daysInWeek', message: 'Must be a positive integer.' });
  }
  if (calendar.daysOfWeek.length !== calendar.daysInWeek) {
    issues.push({
      path: 'daysOfWeek',
      message: `Length (${calendar.daysOfWeek.length}) must equal daysInWeek (${calendar.daysInWeek}).`,
    });
  }
  if (!Number.isInteger(calendar.monthsInYear) || calendar.monthsInYear < 1) {
    issues.push({ path: 'monthsInYear', message: 'Must be a positive integer.' });
  }
  if (calendar.months.length !== calendar.monthsInYear) {
    issues.push({
      path: 'months',
      message: `Length (${calendar.months.length}) must equal monthsInYear (${calendar.monthsInYear}).`,
    });
  }

  const months = calendar.months;
  if (months.length > 0) {
    const m0 = months[0];
    if (m0.startDay !== 1) {
      issues.push({
        path: 'months[0].startDay',
        message: `First month must start on day 1, got ${m0.startDay}.`,
      });
    }
    for (let i = 0; i < months.length; i++) {
      const m: CalendarMonth = months[i];
      const path = `months[${i}]`;
      if (!Number.isInteger(m.startDay) || m.startDay < 1) {
        issues.push({ path: `${path}.startDay`, message: 'Must be a positive integer.' });
      }
      if (!Number.isInteger(m.length) || m.length < 1) {
        issues.push({ path: `${path}.length`, message: 'Must be a positive integer.' });
      }
      if (i > 0) {
        const prev = months[i - 1];
        const expectedStart = prev.startDay + prev.length;
        if (m.startDay !== expectedStart) {
          issues.push({
            path: `${path}.startDay`,
            message: `Expected ${expectedStart} after previous month, got ${m.startDay}.`,
          });
        }
      }
    }
    const last = months[months.length - 1];
    const covered = last.startDay + last.length - 1;
    if (covered !== calendar.yearLengthInDays) {
      issues.push({
        path: 'months',
        message: `Months cover ${covered} days but yearLengthInDays is ${calendar.yearLengthInDays}.`,
      });
    }
  }

  for (let i = 0; i < calendar.events.length; i++) {
    const e: CalendarEvent = calendar.events[i];
    const path = `events[${i}]`;
    if (e.startDay < 1 || e.startDay > calendar.yearLengthInDays) {
      issues.push({ path: `${path}.startDay`, message: 'Out of range for year length.' });
    }
    if (e.endDay < 1 || e.endDay > calendar.yearLengthInDays) {
      issues.push({ path: `${path}.endDay`, message: 'Out of range for year length.' });
    }
    if (e.endDay < e.startDay) {
      issues.push({ path, message: 'endDay must be >= startDay.' });
    }
  }

  return issues;
}

export function assertValidCalendar(calendar: Calendar): void {
  const issues = validateCalendar(calendar);
  if (issues.length > 0) {
    const detail = issues.map((i) => `${i.path}: ${i.message}`).join('; ');
    throw new Error(`Invalid calendar: ${detail}`);
  }
}
