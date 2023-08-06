"use strict";

import * as Words from "@ironarachne/words";
import * as Dates from "../dates.js";

export default class ChangeLog {
  date: string;
  updates: string[];

  constructor(date: string, updates: string[]) {
    this.date = date;
    this.updates = updates;
  }

  niceDate() {
    const components = this.date.split("-");
    const year = Number(components[0]);
    const month = Number(components[1]) - 1;
    const day = Number(components[2]);
    const fullDate = new Date(year, month, day);
    let ordinal = Words.getOrdinal(fullDate.getDate());
    let monthAbbr = Dates.getMonthAbbr(fullDate.getMonth());

    return `${monthAbbr} ${fullDate.getDate()}<sup>${ordinal}</sup>, ${fullDate.getFullYear()}`;
  }
}
