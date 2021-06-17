"use strict";

export default class Title {
  constructor(femaleTitle, maleTitle, femaleHonorific, maleHonorific, hasLands, landName, precedence) {
    this.femaleTitle = femaleTitle;
    this.maleTitle = maleTitle;
    this.femaleHonorific = femaleHonorific;
    this.maleHonorific = maleHonorific;
    this.hasLands = hasLands;
    this.landName = landName;
    this.precedence = precedence;
  }

  getTitle(gender) {
    if (gender === "female") {
      return this.femaleTitle;
    }
    return this.maleTitle;
  }

  getHonorific(gender) {
    if (gender === "female") {
      return this.femaleHonorific;
    }
    return this.maleHonorific;
  }

  hasHigherPrecedenceThan(otherPrecedence) {
    return this.precedence > otherPrecedence;
  }

  hasLowerPrecedenceThan(otherPrecedence) {
    return this.precedence < otherPrecedence;
  }
}
