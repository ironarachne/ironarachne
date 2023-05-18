'use strict';

import * as AgeCategories from '../age/agecategories';
import type Item from '../equipment/item';
import Gender from '../gender';
import GeneratorSet from '../names/generatorset';
import DwarfSet from '../names/races/dwarf';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import type StatBlock from '../statblock';
import type Species from './species';

export default class Duergar implements Species {
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
    this.name = 'duergar';
    this.abilities = ['can see in the dark'];
    this.tags = ['corruptible', 'duergar', 'dwarf', 'martial', 'sentient'];
    this.nameGeneratorSet = new DwarfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'duergar';
    this.adjective = 'duergar';
    this.commonality = 5;
    this.environments = ['underdark'];
    this.creatureTypes = ['humanoid'];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        'hair',
        'hair',
        ['dark', 'black', 'russet', 'brown', 'red'],
        ['hair'],
      ),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        ['grey', 'blue-grey', 'dark grey', 'light grey'],
        ['skin'],
      ),
      new PhysicalTraitGenerator('eyes', 'eyes', ['black', 'red', 'dark', 'amber'], ['eyes']),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        300,
        AgeCategories.getHumanVariant(3, 0.9, 0.75, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        300,
        AgeCategories.getHumanVariant(3, 1, 0.75, 'male'),
      ),
    ];
  }
}
