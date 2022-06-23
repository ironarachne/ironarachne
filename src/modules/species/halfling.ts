'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import HalflingSet from '../names/races/halfling';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class Halfling implements Species {
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
    this.name = 'halfling';
    this.abilities = [];
    this.tags = ['halfling', 'sentient'];
    this.nameGeneratorSet = new HalflingSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'halflings';
    this.adjective = 'halfling';
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
    this.creatureTypes = ['humanoid'];
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
