'use strict';

export default class ClassRestriction {
  className: string;
  maxLevel: number;

  constructor(className: string, maxLevel: number) {
    this.className = className;
    this.maxLevel = maxLevel;
  }
}
