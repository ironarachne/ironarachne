"use strict";

import * as AgeCategories from "../age/agecategories";
import Gender from "../gender";
import NameGenerator from "../names/generator";
import PhysicalTrait from "../physicaltraits/physicaltrait";
import Species from "../species/species";
import Human from "../species/human";
import GenericFantasyFamilyGenerator from "../names/generators/genericfantasyfamily";
import GenericFantasyFemaleGenerator from "../names/generators/genericfantasyfemale";
import GenericFantasyMaleGenerator from "../names/generators/genericfantasymale";

export default class CharacterGeneratorConfig {
  ageCategories: string[];
  familyNameGenerator: NameGenerator;
  femaleNameGenerator: NameGenerator;
  maleNameGenerator: NameGenerator;
  speciesOptions: Species[];
  physicalTraitOverrides: PhysicalTrait[];
  useAdaptiveNames: boolean;
  genderOptions: Gender[];

  constructor() {
    this.ageCategories = AgeCategories.getCategoryList();
    this.familyNameGenerator = new GenericFantasyFamilyGenerator();
    this.femaleNameGenerator = new GenericFantasyFemaleGenerator();
    this.maleNameGenerator = new GenericFantasyMaleGenerator();
    this.speciesOptions = [];

    let human = new Human();

    this.genderOptions = human.genders;
    this.useAdaptiveNames = false;
    this.physicalTraitOverrides = [];
  }
}
