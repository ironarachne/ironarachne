'use strict';

import AgeCategory from '../age/agecategory';
import Gender from '../gender';
import Title from './title';
import type Species from '../species/species';
import PhysicalTrait from '../physicaltraits/physicaltrait';
import PersonalityTrait from './personality/personalitytrait';
import Archetype from '../archetypes/archetype';
import type StatBlock from '../statblock';
import type Item from '../equipment/item';
import * as RND from '../random';
import Arms from '../heraldry/arms';

export default class Character {
  titles: Title[];
  heraldry: Arms | null;
  archetype: Archetype;
  species: Species;
  description: string;
  summary: string;
  gender: Gender;
  age: number;
  ageCategory: AgeCategory;
  height: number;
  weight: number;
  traits: string[];
  personalityTraits: PersonalityTrait[];
  physicalTraits: PhysicalTrait[];
  name: string;
  firstName: string;
  lastName: string;
  status: string;
  statBlock: StatBlock;
  abilities: string[];
  carried: Item[];
  threatLevel: number;
  tags: string[];

  constructor(species: Species) {
    this.titles = [];
    this.abilities = species.abilities;
    this.tags = species.tags;
    this.heraldry = null;
    this.species = species;
    this.description = '';
    this.summary = '';
    this.age = 0;
    this.height = 0;
    this.weight = 0;
    this.traits = [];
    this.physicalTraits = [];
    this.name = '';
    this.firstName = '';
    this.lastName = '';
    this.status = 'alive';
    this.carried = [];
    this.threatLevel = species.threatLevel;
  }

  getHonorific(): string {
    let primaryTitle = this.getPrimaryTitle();

    if (primaryTitle) {
      return primaryTitle.getHonorific(this.gender.name);
    }

    return '';
  }

  getPrimaryTitle(): Title | null {
    let highestPrecedence = 100;
    let primaryTitle = null;

    for (let i = 0; i < this.titles.length; i++) {
      if (this.titles[i].precedence < highestPrecedence) {
        highestPrecedence = this.titles[i].precedence;

        primaryTitle = this.titles[i];
      }
    }

    return primaryTitle;
  }

  getRandomTrait(): string {
    return RND.item(this.traits);
  }

  getTitle(): string {
    let primaryTitle = this.getPrimaryTitle();

    if (primaryTitle) {
      return primaryTitle.getTitle(this.gender.name);
    }

    return '';
  }
}
