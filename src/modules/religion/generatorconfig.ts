'use strict';

import ReligionCategory from './categories/category';
import * as Categories from './categories/categories';
import NameGenerator from '../names/generator';
import HumanSet from '../names/races/human';

export default class ReligionGeneratorConfig {
  categories: ReligionCategory[];
  nameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;

  constructor() {
    this.categories = Categories.all();

    let genSet = new HumanSet();

    this.nameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
