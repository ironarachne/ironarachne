'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import ElfSet from '../names/races/elf';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class DarkElf implements Species {
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
    this.name = 'dark elf';
    this.abilities = [];
    this.tags = ['corruptible', 'dark elf', 'elf', 'martial', 'magic', 'sentient'];
    this.nameGeneratorSet = new ElfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'dark elves';
    this.adjective = 'dark elven';
    this.commonality = 5;
    this.environments = ['forest', 'mountain', 'underdark'];
    this.creatureTypes = ['humanoid'];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator('hair', 'hair', ['white', 'light grey'], ['hair']),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        ['black', 'jet black', 'dark grey', 'grey', 'light grey', 'blue-grey'],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['blue', 'purple', 'brown', 'dark', 'amber', 'grey', 'red'],
        ['eyes'],
      ),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        700,
        AgeCategories.getHumanVariant(7, 0.6, 0.9, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        700,
        AgeCategories.getHumanVariant(7, 0.6, 0.95, 'male'),
      ),
    ];
  }
}
