import * as Words from "./words";

export default class ChangeLog {
  date: string;
  updates: string[];

  constructor(date: string, updates: string[]) {
    this.date = date;
    this.updates = updates;
  }

  niceDate() {
    const components = this.date.split('-');
    const fullDate = new Date(components[0], components[1] - 1, components[2]);
    let ordinal = Words.getOrdinal(fullDate.getDate());
    let monthAbbr = Words.getMonthAbbr(fullDate.getMonth());

    return `${monthAbbr} ${fullDate.getDate()}<sup>${ordinal}</sup>, ${fullDate.getFullYear()}`;
  }
}
