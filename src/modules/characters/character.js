"use strict";

export default class Character {
  constructor() {
    this.titles = [];
    this.species = {};
    this.description = "";
    this.gender = "";
    this.age = 0;
    this.ageGroupName = "";
    this.height = 0;
    this.weight = 0;
    this.traits = [];
    this.firstName = "";
    this.lastName = "";
  }

  getPrimaryTitle() {
    let highestPrecedence = 100;
    let primaryTitle = null;

    for (let i = 0; i < this.titles.length; i++) {
      if (this.titles[i].precedence < highestPrecedence) {
        highestPrecedence = this.titles[i].precedence;

        primaryTitle = this.titles[i];
      }
    }

    if (primaryTitle == null) {
      return "";
    }

    return primaryTitle.getTitle(this.gender);
  }
}
