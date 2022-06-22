'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import DragonbornSet from '../names/races/dragonborn';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class Dragonborn implements Species {
  name: string;
  nameGeneratorSet: GeneratorSet;
  pluralName: string;
  description: string;
  summary: string;
  adjective: string;
  commonality: number;
  environments: string[];
  carried: Item[];
  statBlock: StatBlock;
  creatureTypes: string[];
  physicalTraitGenerators: PhysicalTraitGenerator[];
  genders: Gender[];
  abilities: string[];
  tags: string[];
  threatLevel: number;

  constructor() {
    this.name = 'dragonborn';
    this.abilities = [];
    this.tags = ['corruptible', 'dragonborn', 'dragonkin', 'martial', 'sentient', 'magic'];
    this.nameGeneratorSet = new DragonbornSet();
    this.pluralName = 'dragonborn';
    this.adjective = 'dragonborn';
    this.carried = [];
    this.statBlock = null;
    this.commonality = 10;
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
        'eyes',
        'eyes',
        ['amber', 'blue', 'dark', 'green', 'orange', 'red', 'turquoise', 'white', 'yellow'],
        ['eyes'],
      ),
      new PhysicalTraitGenerator(
        'scales',
        'skin',
        [
          'amethyst',
          'black',
          'blue',
          'brass',
          'bronze',
          'copper',
          'crystal',
          'emerald',
          'gold',
          'green',
          'red',
          'sapphire',
          'silver',
          'topaz',
          'white',
        ],
        ['scales', 'skin'],
      ),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        80,
        AgeCategories.getHumanVariant(0.8, 1.5, 1.05, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        80,
        AgeCategories.getHumanVariant(0.8, 1.7, 1.1, 'male'),
      ),
    ];
  }
}
