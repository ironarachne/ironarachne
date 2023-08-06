"use strict";

import Title from "../characters/title.js";

export default class Rank {
  title: Title;
  inferiors: Rank[];
  superior: Rank | null;
  classification: string;
  ageGroupName: string;

  constructor(title: Title, classification: string, ageGroupName: string) {
    this.title = title;
    this.inferiors = [];
    this.superior = null;
    this.classification = classification;
    this.ageGroupName = ageGroupName;
  }

  addInferior(rank: Rank) {
    this.inferiors.push(rank);
  }
}
