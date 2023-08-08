import type AgeCategory from "$lib/age/agecategory.js";

export default class Gender {
  name: string;
  subjectivePronoun: string;
  objectivePronoun: string;
  possessivePronoun: string;
  maxAge: number;
  ageCategories: AgeCategory[];

  constructor() {
    this.name = "";
    this.subjectivePronoun = "";
    this.objectivePronoun = "";
    this.possessivePronoun = "";
    this.maxAge = -1;
    this.ageCategories = [];
  }
}
