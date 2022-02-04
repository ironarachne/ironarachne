'use strict';

export default class Tincture {
  name: string;
  hexColor: string;
  pattern: string;
  type: string;

  constructor(name: string, hexColor: string, pattern: string, type: string) {
    this.name = name;
    this.hexColor = hexColor;
    this.pattern = pattern;
    this.type = type;
  }
}
