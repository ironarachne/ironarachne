'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import TrollSet from '../names/races/troll';

export default class Troll implements Species {
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
    this.name = 'troll';
    this.abilities = ['regenerate slowly unless burned'];
    this.tags = ['corruptible', 'troll', 'greenskin', 'martial', 'sentient'];
    this.nameGeneratorSet = new TrollSet();
    this.pluralName = 'trolls';
    this.adjective = 'troll';
    this.commonality = 10;
    this.threatLevel = 2;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        'hair',
        'hair',
        ['black', 'brown', 'dark', 'red', 'russet'],
        ['hair'],
      ),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        ['black', 'dark green', 'dark grey', 'grey', 'light green', 'green', 'grey', 'olive'],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['amber', 'red', 'brown', 'dark', 'yellow', 'orange', 'grey'],
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
        AgeCategories.getHumanVariant(0.8, 1.15, 1.2, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        80,
        AgeCategories.getHumanVariant(0.8, 1.2, 1.25, 'male'),
      ),
    ];
  }
}
