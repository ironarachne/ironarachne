export default class Title {
  constructor(femaleTitle, maleTitle, femaleHonorific, maleHonorific, hasLands, landName, precedence) {
    this.femaleTitle = femaleTitle
    this.maleTitle = maleTitle
    this.femaleHonorific = femaleHonorific
    this.maleHonorific = maleHonorific
    this.hasLands = hasLands
    this.landName = landName
    this.precedence = precedence
  }

  getTitle(gender) {
    if (gender == "female") {
      return this.femaleTitle
    }
    return this.maleTitle
  }

  getHonorific(gender) {
    if (gender == "female") {
      return this.femaleHonorific
    }
    return this.maleHonorific
  }

  hasHigherPrecedenceThan(otherPrecedence) {
    if (this.precedence <= otherPrecedence) {
      return false
    }
    return true
  }

  hasLowerPrecedenceThan(otherPrecedence) {
    if (this.precedence >= otherPrecedence) {
      return false
    }
    return true
  }
}