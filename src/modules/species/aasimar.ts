'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import FantasySet from '../names/cultures/fantasy';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class Aasimar implements Species {
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
    this.name = 'aasimar';
    this.abilities = ['healing touch', 'summon light'];
    this.tags = ['aasimar', 'celestial', 'human', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'aasimar';
    this.adjective = 'aasimar';
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
      'underdark',
    ];
    this.creatureTypes = ['humanoid'];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        'hair',
        'hair',
        ['black', 'blonde', 'brown', 'dark', 'light', 'red', 'russet', 'white'],
        ['hair'],
      ),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        ['bronzed', 'light', 'pale', 'tan', 'white', 'black', 'brown'],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['amber', 'blue', 'brown', 'dark', 'green', 'gold', 'silver'],
        ['eyes'],
      ),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        160,
        AgeCategories.getHumanVariant(1.6, 0.9, 0.95, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        160,
        AgeCategories.getHumanVariant(1.6, 0.9, 0.95, 'male'),
      ),
    ];
  }
}
