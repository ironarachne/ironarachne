import * as Words from '@ironarachne/words';

export function getMonthAbbr(month: number): string {
  const months = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ];

  return months[month];
}

export function getMonthName(month: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return months[month];
}

export function getNiceDate(date: string): string {
  const components = date.split('-');
  const year = Number(components[0]);
  const month = Number(components[1]) - 1;
  const day = Number(components[2]);
  const fullDate = new Date(year, month, day);
  const ordinal = Words.getOrdinal(fullDate.getDate());
  const monthAbbr = getMonthAbbr(fullDate.getMonth());

  return `${monthAbbr} ${fullDate.getDate()}<sup>${ordinal}</sup>, ${fullDate.getFullYear()}`;
}

/**
 * A date as plain text: `20 Aug. 2026`.
 *
 * {@link getNiceDate} returns markup — an ordinal wrapped in `<sup>` — so rendering it costs an
 * `{@html}` and the eslint exemption that goes with it. The shell's top bar shows the date beside
 * a handful of counts, where day-month-year is compact, reads the same in every locale, and needs
 * no markup at all.
 *
 * Takes a `Date` rather than a `YYYY-MM-DD` string because its caller has one: the release notes
 * parse stored strings, the top bar asks the clock.
 */
export function getShortDate(date: Date): string {
  return `${date.getDate()} ${getMonthAbbr(date.getMonth())} ${date.getFullYear()}`;
}
