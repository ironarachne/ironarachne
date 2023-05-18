'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import NameGenerator from '../names/generator';
import PhysicalTrait from '../physicaltraits/physicaltrait';
import type Species from '../species/species';
import Human from '../species/human';
import HumanSet from '../names/races/human';

export default class CharacterGeneratorConfig {
  ageCategories: string[];
  familyNameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
  speciesOptions: Species[];
  physicalTraitOverrides: PhysicalTrait[];
  useAdaptiveNames: boolean;
  genderNameOptions: string[];

  constructor() {
    this.ageCategories = AgeCategories.getCategoryList();
    let genSet = new HumanSet();
    this.familyNameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
    this.speciesOptions = [];

    this.genderNameOptions = ['male', 'female'];
    this.useAdaptiveNames = false;
    this.physicalTraitOverrides = [];
  }
}
