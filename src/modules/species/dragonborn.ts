'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import DragonbornSet from '../names/races/dragonborn';

export default class Dragonborn implements Species {
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
    this.name = 'dragonborn';
    this.abilities = [];
    this.tags = ['corruptible', 'dragonborn', 'dragonkin', 'martial', 'sentient'];
    this.nameGeneratorSet = new DragonbornSet();
    this.pluralName = 'dragonborn';
    this.adjective = 'dragonborn';
    this.commonality = 10;
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
