'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import GoblinSet from '../names/races/goblin';

export default class Goblin implements Species {
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
    this.name = 'goblin';
    this.abilities = [];
    this.tags = ['goblin', 'sentient'];
    this.nameGeneratorSet = new GoblinSet();
    this.pluralName = 'goblins';
    this.adjective = 'goblin';
    this.commonality = 20;
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
        ['green', 'grey', 'pale', 'dark green', 'brown'],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['amber', 'red', 'brown', 'dark', 'orange'],
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
