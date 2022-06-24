'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import FantasySet from '../names/cultures/fantasy';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class Centaur implements Species {
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
    this.name = 'centaur';
    this.abilities = [];
    this.tags = ['centaur', 'human', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'centaurs';
    this.adjective = 'centaur';
    this.commonality = 5;
    this.environments = [
      'arctic',
      'coastal',
      'desert',
      'forest',
      'grassland',
      'hill',
      'mountain',
      'urban',
    ];
    this.creatureTypes = ['fey'];
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
      new PhysicalTraitGenerator(
        'horse-hide',
        'horse-hide',
        ['black', 'brown', 'dark', 'light', 'white'],
        ['horse-hide'],
      ),
      new PhysicalTraitGenerator(
        'hooves',
        'hooves',
        ['heavy', 'small', 'sharp', 'black', 'white', 'hairy'],
        ['hooves'],
      ),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        185,
        AgeCategories.getHumanVariant(1.85, 1.45, 1.25, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        185,
        AgeCategories.getHumanVariant(1.85, 1.5, 1.3, 'male'),
      ),
    ];
  }
}
