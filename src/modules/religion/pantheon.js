import * as iarnd from "../random.js"

export class Pantheon {
  constructor(name, description, classification) {
    this.name = name
    this.descripton = description
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
      'a patriarchal autocracy',
      true,
      'male',
      5,
      12,
    ),
    new Classification(
      'a matriarchal autocracy',
      true,
      'female',
      5,
      12,
    ),
    new Classification(
      'egalitarian',
      false,
      '',
      5,
      12,
    ),
  ]

  return iarnd.item(classifications)
}
