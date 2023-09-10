import type Title from "$lib/characters/titles/title.js";

export default class Rank {
  title: Title;
  inferiors: Rank[];
  superior: Rank | null;
  classification: string;
  ageGroupNames: string[];

  constructor(title: Title, classification: string, ageGroupNames: string[]) {
    this.title = title;
    this.inferiors = [];
    this.superior = null;
    this.classification = classification;
    this.ageGroupNames = ageGroupNames;
  }

  addInferior(rank: Rank) {
    this.inferiors.push(rank);
  }
}
