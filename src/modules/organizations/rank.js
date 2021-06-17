"use strict";

export default class Rank {
  constructor(title, classification, ageGroupName) {
    this.title = title;
    this.inferiors = [];
    this.superior = null;
    this.classification = classification;
    this.ageGroupName = ageGroupName;
  }

  addInferior(rank) {
    this.inferiors.push(rank);
  }
}
