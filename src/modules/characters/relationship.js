import * as iarnd from "../random.js"

export class Relationship {
  constructor(strength, target) {
    this.strength = strength
    this.target = target
  }
}

export function getRandomVerbForStrength(strength) {
  let verbs = [
    ['hates', 'despises', 'loathes', 'can\'t stand', 'fears'],
    ['dislikes', 'distrusts', 'mistrusts', 'is suspicious of', 'envies'],
    ['likes', 'enjoys', 'is entertained by'],
    ['loves', 'adores', 'is enamored of'],
  ]

  return iarnd.item(verbs[strength])
}
