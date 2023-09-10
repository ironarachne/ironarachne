import * as Words from "@ironarachne/words";

export function getMonthAbbr(month: number): string {
  const months = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];

  return months[month];
}

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[month];
}

export function getNiceDate(date: string): string {
  const components = date.split("-");
  const year = Number(components[0]);
  const month = Number(components[1]) - 1;
  const day = Number(components[2]);
  const fullDate = new Date(year, month, day);
  let ordinal = Words.getOrdinal(fullDate.getDate());
  let monthAbbr = getMonthAbbr(fullDate.getMonth());

  return `${monthAbbr} ${fullDate.getDate()}<sup>${ordinal}</sup>, ${fullDate.getFullYear()}`;
}
