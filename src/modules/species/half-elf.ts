'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import HalfElfSet from '../names/races/halfelf';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class HalfElf implements Species {
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
    this.name = 'half-elf';
    this.abilities = [];
    this.tags = ['corruptible', 'half-elf', 'elf', 'human', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new HalfElfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'half-elves';
    this.adjective = 'half-elven';
    this.commonality = 15;
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
