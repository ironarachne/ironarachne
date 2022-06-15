'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import TieflingSet from '../names/races/tiefling';

export default class Tiefling implements Species {
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
    this.name = 'tiefling';
    this.abilities = [];
    this.tags = ['corruptible', 'tiefling', 'demonic', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new TieflingSet();
    this.pluralName = 'tieflings';
    this.adjective = 'tiefling';
    this.commonality = 5;
    this.threatLevel = 1;
    const hornLengths = ['short', 'long'];
    const hornTypes = ['curved', 'straight', 'curled', 'spiraled'];
    let hornAppearances = [];
    for (let j = 0; j < hornTypes.length; j++) {
      for (let i = 0; i < hornLengths.length; i++) {
        hornAppearances.push(`${hornLengths[i]} and ${hornTypes[j]}`);
      }
      hornAppearances.push(hornTypes[j]);
    }

    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        'hair',
        'hair',
        [
          'black',
          'brown',
          'dark',
          'red',
          'russet',
          'blue',
          'dark blue',
          'dark red',
          'dark purple',
          'purple',
        ],
        ['hair'],
      ),
      new PhysicalTraitGenerator('horns', 'horns', hornAppearances, ['horns']),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        [
          'tan',
          'light',
          'bronzed',
          'white',
          'pale',
          'red',
          'purple',
          'blue',
          'ochre',
          'yellow',
          'brown',
          'black',
        ],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['black', 'red', 'white', 'silver', 'gold', 'blue', 'green'],
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
        AgeCategories.getHumanVariant(1.2, 1.1, 1.0, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        120,
        AgeCategories.getHumanVariant(1.2, 1.2, 1.0, 'male'),
      ),
    ];
  }
}
