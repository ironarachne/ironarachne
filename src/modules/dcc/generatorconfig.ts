"use strict";

import NameGenerator from "../names/generator";
import HumanSet from "../names/races/human";

export default class DCCCharacterGeneratorConfig {
  nameGeneratorMale: NameGenerator;
  nameGeneratorFemale: NameGenerator;
  nameGeneratorFamily: NameGenerator;

  constructor() {
    let genSet = new HumanSet();
    this.nameGeneratorFamily = genSet.family;
    this.nameGeneratorFemale = genSet.female;
    this.nameGeneratorMale = genSet.male;
  }
}
