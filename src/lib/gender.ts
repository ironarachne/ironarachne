"use strict";

import type AgeCategory from "./age/agecategory.js";

export default class Gender {
  name: string;
  subjectivePronoun: string;
  objectivePronoun: string;
  possessivePronoun: string;
  maxAge: number;
  ageCategories: AgeCategory[];

  constructor(
    name: string,
    subj: string,
    obj: string,
    pos: string,
    maxAge: number,
    ageCategories: AgeCategory[],
  ) {
    this.name = name;
    this.subjectivePronoun = subj;
    this.objectivePronoun = obj;
    this.possessivePronoun = pos;
    this.maxAge = maxAge;
    this.ageCategories = ageCategories;
  }
}
