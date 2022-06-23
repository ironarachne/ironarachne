'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import GoblinSet from '../names/races/goblin';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class Goblin implements Species {
  name: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  adjective: string;
  description: string;
  summary: string;
  commonality: number;
  carried: Item[];
  statBlock: StatBlock;
  environments: string[];
  creatureTypes: string[];
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
    this.environments = [
      'arctic',
      'coastal',
      'desert',
      'forest',
      'grassland',
      'hill',
      'mountain',
      'urban',
      'underdark',
    ];
    this.creatureTypes = ['goblinoid', 'humanoid'];
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
