"use strict";

export default class StarshipGeneratorConfig {
  possibleClasses: StarshipClass[];

  constructor() {
    this.possibleClasses = StarshipClasses.all();
  }
}
