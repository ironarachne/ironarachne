'use strict';

import * as AgeCategories from '../age/agecategories';
import Gender from '../gender';
import type Species from './species';
import PhysicalTraitGenerator from '../physicaltraits/generator';
import GeneratorSet from '../names/generatorset';
import GnomeSet from '../names/races/gnome';
import type Item from '../equipment/item';
import type StatBlock from '../statblock';

export default class DeepGnome implements Species {
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
    this.name = 'deep gnome';
    this.abilities = ['can see in the dark'];
    this.tags = ['corruptible', 'deep gnome', 'gnome', 'sentient', 'magic'];
    this.nameGeneratorSet = new GnomeSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = 'deep gnomes';
    this.adjective = 'deep gnomish';
    this.commonality = 5;
    this.environments = ['underdark'];
    this.creatureTypes = ['humanoid'];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator('hair', 'hair', ['black', 'dark', 'light', 'white'], ['hair']),
      new PhysicalTraitGenerator(
        'skin',
        'skin',
        ['grey', 'dark grey', 'pale', 'light grey', 'bone white'],
        ['skin'],
      ),
      new PhysicalTraitGenerator(
        'eyes',
        'eyes',
        ['amber', 'black', 'brown', 'dark', 'white'],
        ['eyes'],
      ),
    ];
    this.genders = [
      new Gender(
        'female',
        'she',
        'her',
        'her',
        500,
        AgeCategories.getHumanVariant(5, 0.4, 0.4, 'female'),
      ),
      new Gender(
        'male',
        'he',
        'him',
        'his',
        500,
        AgeCategories.getHumanVariant(5, 0.5, 0.5, 'male'),
      ),
    ];
  }
}
