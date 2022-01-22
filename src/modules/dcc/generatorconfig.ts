"use strict";

import NameGenerator from "../names/generator";
import GenericFantasyFamilyGenerator from "../names/generators/genericfantasyfamily";
import GenericFantasyFemaleGenerator from "../names/generators/genericfantasyfemale";
import GenericFantasyMaleGenerator from "../names/generators/genericfantasymale";

export default class DCCCharacterGeneratorConfig {
  nameGeneratorMale: NameGenerator;
  nameGeneratorFemale: NameGenerator;
  nameGeneratorFamily: NameGenerator;

  constructor() {
    this.nameGeneratorFamily = new GenericFantasyFamilyGenerator();
    this.nameGeneratorFemale = new GenericFantasyFemaleGenerator();
    this.nameGeneratorMale = new GenericFantasyMaleGenerator();
  }
}
