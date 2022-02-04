'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import HalfElfSet from '../names/races/halfelf';

export default class HalfElf implements Species {
  name: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  adjective: string;
  commonality: number;
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];

  constructor() {
    this.name = 'half-elf';
    this.nameGeneratorSet = new HalfElfSet();
    this.pluralName = 'half-elves';
    this.adjective = 'half-elven';
    this.commonality = 15;
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
        185,
        AgeCategories.getHumanVariant(1.85, 0.9, 0.95, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        185,
        AgeCategories.getHumanVariant(1.85, 0.9, 0.95, 'male'),
      ),
    ];
  }
}