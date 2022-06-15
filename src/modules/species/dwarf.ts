'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import GeneratorSet from '../names/generatorset';
import DwarfSet from '../names/races/dwarf';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import type Species from './species';

export default class Dwarf implements Species {
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
    this.name = 'dwarf';
    this.abilities = [];
    this.tags = ['corruptible', 'dwarf', 'martial', 'sentient'];
    this.nameGeneratorSet = new DwarfSet();
    this.pluralName = 'dwarves';
    this.adjective = 'dwarven';
    this.commonality = 20;
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        'hair',
        'hair',
        ['dark', 'black', 'russet', 'brown', 'red'],
        ['hair'],
      ),
      new PhysicalTraitGenerator('skin', 'skin', ['tan', 'bronzed', 'ruddy'], ['skin']),
      new PhysicalTraitGenerator('eyes', 'eyes', ['green', 'brown', 'dark', 'amber'], ['eyes']),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        300,
        AgeCategories.getHumanVariant(3, 0.9, 0.7, 'female'),
      ),
      new Gender('male', 'he', 'him', 'his', 300, AgeCategories.getHumanVariant(3, 1, 0.8, 'male')),
    ];
  }
}
