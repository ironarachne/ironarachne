'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import HumanSet from '../names/races/human';

export default class Human implements Species {
  name: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  abilities: string[];
  tags: string[];
  threatLevel: number;

  constructor() {
    this.name = 'human';
    this.abilities = [];
    this.tags = ['corruptible', 'human', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new HumanSet();
    this.pluralName = 'humans';
    this.adjective = 'human';
    this.commonality = 200;
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        'hair',
        'hair',
        ['black', 'blonde', 'brown', 'dark', 'light', 'red', 'russet'],
        ['hair'],
      ),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        ['black', 'bronzed', 'ebony', 'light', 'pale', 'tan', 'white'],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['amber', 'blue', 'brown', 'dark', 'green'],
        ['eyes'],
      ),
    ];
    this.genders = [
      new Gender('female', 'she', 'her', 'her', 100, AgeCategories.humanStandardFemale()),
      new Gender('male', 'he', 'him', 'his', 100, AgeCategories.humanStandardMale()),
    ];
  }
}
