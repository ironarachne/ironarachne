'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import FantasySet from '../names/cultures/fantasy';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class Aarakocra implements Species {
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
    this.name = 'aarakocra';
    this.abilities = ['flight'];
    this.tags = ['corruptible', 'aarakocra', 'flying', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'aarakocras';
    this.adjective = 'aarakocra';
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
    this.creatureTypes = ['humanoid'];
    this.threatLevel = 1;
    const wingLengths = ['short', 'long'];
    const wingTypes = ['black-tipped', 'sleek', 'knife-edged', 'graceful', 'full'];
    let wingAppearances = [];
    for (let j = 0; j < wingTypes.length; j++) {
      for (let i = 0; i < wingLengths.length; i++) {
        wingAppearances.push(`${wingLengths[i]} and ${wingTypes[j]}`);
      }
      wingAppearances.push(wingTypes[j]);
    }

    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator('wings', 'wings', wingAppearances, ['wings']),
      new PhysicalTraitGenerator(
        'feathers',
        'feathers',
        ['white', 'mottled', 'brown', 'russet', 'black', 'grey', 'red', 'orange'],
        ['feathers'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['yellow', 'red', 'white', 'silver', 'gold', 'blue', 'green'],
        ['eyes'],
      ),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        120,
        AgeCategories.getHumanVariant(1.2, 0.7, 0.95, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        120,
        AgeCategories.getHumanVariant(1.2, 0.8, 0.95, 'male'),
      ),
    ];
  }
}
