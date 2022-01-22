"use strict";

import DCCItem from "./item";

export default class DCCGear implements DCCItem {
  name: string;
  value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }
}
