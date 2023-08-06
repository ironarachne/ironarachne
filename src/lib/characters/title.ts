"use strict";

export default class Title {
  femaleTitle: string;
  maleTitle: string;
  femaleHonorific: string;
  maleHonorific: string;
  hasLands: boolean;
  landName: string;
  precedence: number;

  constructor(
    femaleTitle: string,
    maleTitle: string,
    femaleHonorific: string,
    maleHonorific: string,
    hasLands: boolean,
    landName: string,
    precedence: number,
  ) {
    this.femaleTitle = femaleTitle;
    this.maleTitle = maleTitle;
    this.femaleHonorific = femaleHonorific;
    this.maleHonorific = maleHonorific;
    this.hasLands = hasLands;
    this.landName = landName;
    this.precedence = precedence;
  }

  getTitle(gender: string): string {
    if (gender === "female") {
      return this.femaleTitle;
    }
    return this.maleTitle;
  }

  getHonorific(gender: string): string {
    if (gender === "female") {
      return this.femaleHonorific;
    }
    return this.maleHonorific;
  }

  hasHigherPrecedenceThan(otherPrecedence: number): boolean {
    return this.precedence > otherPrecedence;
  }

  hasLowerPrecedenceThan(otherPrecedence: number): boolean {
    return this.precedence < otherPrecedence;
  }
}
