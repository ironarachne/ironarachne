'use strict';

export default class Domain {
  name: string;
  holyItems: string[];
  holySymbols: string[];
  weaponEffects: string[];
  otherEffects: string[];

  constructor(
    name: string,
    holyItems: string[],
    holySymbols: string[],
    weaponEffects: string[],
    otherEffects: string[],
  ) {
    this.name = name;
    this.holyItems = holyItems;
    this.holySymbols = holySymbols;
    this.weaponEffects = weaponEffects;
    this.otherEffects = otherEffects;
  }
}
