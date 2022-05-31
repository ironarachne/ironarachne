'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import HalflingSet from '../names/races/halfling';

export default class Halfling implements Species {
  name: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  abilities: string[];
  tags: string[];

  constructor() {
    this.name = 'halfling';
    this.abilities = [];
    this.tags = ['halfling', 'sentient'];
    this.nameGeneratorSet = new HalflingSet();
    this.pluralName = 'halflings';
    this.adjective = 'halfling';
    this.commonality = 20;
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
        ['bronzed', 'light', 'pale', 'tan', 'white'],
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
      new Gender(
        'female',
        'she',
        'her',
        'her',
        150,
        AgeCategories.getHumanVariant(1.5, 0.5, 0.6, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        150,
        AgeCategories.getHumanVariant(1.5, 0.5, 0.6, 'male'),
      ),
    ];
  }
}
