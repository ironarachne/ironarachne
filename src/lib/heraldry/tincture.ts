"use strict";

export default class Tincture {
  name: string;
  hexColor: string;
  pattern: string;
  type: string;
  category: string;
  commonality: number;

  constructor(
    name: string,
    hexColor: string,
    pattern: string,
    type: string,
    category: string,
    commonality: number,
  ) {
    this.name = name;
    this.hexColor = hexColor;
    this.pattern = pattern;
    this.type = type;
    this.category = category;
    this.commonality = commonality;
  }
}
