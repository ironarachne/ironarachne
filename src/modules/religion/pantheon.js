import * as iarnd from "../random.js"

export class Pantheon {
  constructor(name, description, classification) {
    this.name = name
    this.description = description
    this.deities = []
    this.classification = classification
  }
}

export class Classification {
  constructor(name, hasLeader, leaderGender, minSize, maxSize) {
    this.name = name
    this.hasLeader = hasLeader
    this.leaderGender = leaderGender
    this.minSize = minSize
    this.maxSize = maxSize
  }
}

export function randomClassification() {
  let classifications = [
    new Classification(
      'patriarchal autocracy',
      true,
      'male',
      5,
      12,
    ),
    new Classification(
      'matriarchal autocracy',
      true,
      'female',
      5,
      12,
    ),
    new Classification(
      'egalitarian society',
      false,
      '',
      5,
      12,
    ),
    new Classification(
      'monotheistic domain',
      false,
      '',
      1,
      1,
    ),
  ]

  return iarnd.item(classifications)
}
