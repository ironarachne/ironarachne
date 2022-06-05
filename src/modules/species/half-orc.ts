'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import HalfOrcSet from '../names/races/halforc';

export default class HalfOrc implements Species {
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
    this.name = 'half-orc';
    this.abilities = [];
    this.tags = ['corruptible', 'half-orc', 'orc', 'human', 'greenskin', 'martial', 'sentient'];
    this.nameGeneratorSet = new HalfOrcSet();
    this.pluralName = 'half-orcs';
    this.adjective = 'half-orc';
    this.commonality = 10;
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
        ['black', 'bronzed', 'ebony', 'green', 'grey', 'light', 'olive', 'pale', 'tan', 'white'],
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
        80,
        AgeCategories.getHumanVariant(0.8, 0.85, 0.9, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        80,
        AgeCategories.getHumanVariant(0.8, 0.9, 0.95, 'male'),
      ),
    ];
  }
}
