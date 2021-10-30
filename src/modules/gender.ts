"use strict";

import * as Age from "./age";

export class Gender {
  name: string;
  subjectivePronoun: string;
  objectivePronoun: string;
  possessivePronoun: string;
  adultNoun: string;
  childNoun: string;
  maxAge: number;
  ageCategories: Age.AgeCategory[];

  constructor(name: string, subj: string, obj: string, pos: string, adult: string, child: string, maxAge: number, ageCategories: Age.AgeCategory[]) {
    this.name = name;
    this.subjectivePronoun = subj;
    this.objectivePronoun = obj;
    this.possessivePronoun = pos;
    this.adultNoun = adult;
    this.childNoun = child;
    this.maxAge = maxAge;
    this.ageCategories = ageCategories;
  }
}
