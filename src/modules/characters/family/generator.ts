"use strict";

import * as AgeCategories from "../../age/agecategories";
import Character from "../character";
import CharacterGenerator from "../generator";
import CharacterGeneratorConfig from "../generatorconfig";
import Family from "./family";
import FamilyMember from "./familymember";
import FamilyGeneratorConfig from "./generatorconfig";

import random from "random";
import Gender from "../../gender";
import * as RND from "../../random";

export default class FamilyGenerator {
  config: FamilyGeneratorConfig;

  constructor(config: FamilyGeneratorConfig) {
    this.config = config;
  }

  generate(): Family {
    let family = new Family();
    family.familyNameGenerator = this.config.rootFamilyNameGenerator;
    family.femaleNameGenerator = this.config.rootFemaleNameGenerator;
    family.maleNameGenerator = this.config.rootMaleNameGenerator;

    let charGenConfig = new CharacterGeneratorConfig();
    charGenConfig.speciesOptions = [this.config.species];
    charGenConfig.ageCategories = ["young adult"];
    charGenConfig.familyNameGenerator = family.familyNameGenerator;
    charGenConfig.femaleNameGenerator = family.femaleNameGenerator;
    charGenConfig.maleNameGenerator = family.maleNameGenerator;
    charGenConfig.genderOptions = [this.config.species.genders[0]];

    let charGen = new CharacterGenerator(charGenConfig);

    let parent1 = new FamilyMember(0);
    parent1.character = charGen.generate();
    parent1.character.age += 5;
    parent1.character.description = charGen.describe(parent1.character);

    let mateGender = getMateGender(parent1.character.gender, this.config.species.genders);
    charGen.config.genderOptions = [mateGender];
    let parent2 = new FamilyMember(1);
    parent2.character = charGen.generate();
    parent2.character.age += 5;
    parent2.character.description = charGen.describe(parent2.character);

    if (parent1.character.gender.name == this.config.dominantFamilyNameGender.name) {
      parent2.character.lastName = parent1.character.lastName;
      family.name = parent1.character.lastName;
    } else {
      parent1.character.lastName = parent2.character.lastName;
      family.name = parent2.character.lastName;
    }

    parent1.mate = parent2.id;
    parent2.mate = parent1.id;

    family.members.push(parent1);
    family.members.push(parent2);

    for (let i=0;i<this.config.iterations;i++) {
      family = this.iterate(family);
    }

    return family;
  }

  iterate(family: Family): Family {
    const ageStep = 5;
    let charGenConfig = new CharacterGeneratorConfig();
    const charGen = new CharacterGenerator(charGenConfig);

    for (let i=0;i<family.members.length;i++) {
      if (family.members[i].character.status == "alive") {
        family.members[i].character.age += ageStep;
      }

      if (family.members[i].character.age > AgeCategories.getMaxAge(family.members[i].character.gender.ageCategories)) {
        family.members[i].character.status = "dead";
      } else {
        let newAgeCategory = AgeCategories.getCategoryFromAge(family.members[i].character.age, family.members[i].character.gender.ageCategories);
        if (newAgeCategory.name != family.members[i].character.ageCategory.name) {
          family.members[i].character.height = newAgeCategory.randomHeight();
          family.members[i].character.weight = newAgeCategory.randomWeight();
        }
        family.members[i].character.ageCategory = newAgeCategory;
      }

      family.members[i].character.description = charGen.describe(family.members[i].character);

      if (family.members[i].character.status == "dead") {
        continue;
      }

      if (RND.chance(100) > 95) {
        // There's a 5% chance something horrible kills this person
        family.members[i].character.status = "dead";
        continue;
      }

      if (needsChildren(family.members[i]) && RND.chance(100) > 30) {
        let numberOfChildren = random.int(1, 4);
        for (let j=0;j<numberOfChildren;j++) {
          let child = getNewChild(i, family.members[i].mate, family);
          let newMember = new FamilyMember(family.members.length);
          newMember.character = child;
          newMember.parents = [i, family.members[i].mate];
          family.members[i].children.push(newMember.id);
          family.members[family.members[i].mate].children.push(newMember.id);

          if (family.members[i].character.gender.name == this.config.dominantFamilyNameGender.name) {
            newMember.character.lastName = family.members[i].character.lastName;
          } else {
            newMember.character.lastName = family.members[family.members[i].mate].character.lastName;
          }

          family.members.push(newMember);
        }
      }

      if (needsMate(family.members[i]) && RND.chance(100) > 50) {
        let mate = getNewMate(family.members[i], family);
        let newMember = new FamilyMember(family.members.length);
        newMember.character = mate;
        newMember.mate = i;
        family.members[i].mate = newMember.id;

        if (family.members[i].character.gender.name == this.config.dominantFamilyNameGender.name) {
          newMember.character.lastName = family.members[i].character.lastName;
        } else {
          family.members[i].character.lastName = newMember.character.lastName;
        }

        family.members.push(newMember);
      }
    }

    return family;
  }
}

function getNewChild(parent1Index: number, parent2Index: number, family: Family): Character {
  let parent1 = family.members[parent1Index].character;
  let parent2 = family.members[parent2Index].character;

  let physicalTraits = parent1.physicalTraits.concat(parent2.physicalTraits);
  let uniqueNames = [];
  let traitOverrides = [];
  physicalTraits = RND.shuffle(physicalTraits);
  for (let i=0;i<physicalTraits.length;i++) {
    if (!uniqueNames.includes(physicalTraits[i].name)) {
      traitOverrides.push(physicalTraits[i]);
      uniqueNames.push(physicalTraits[i].name);
    }
  }

  let charConfig = new CharacterGeneratorConfig();
  charConfig.speciesOptions = [parent1.species, parent2.species];
  charConfig.ageCategories = ["infant"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  charConfig.genderOptions = parent1.species.genders;
  charConfig.physicalTraitOverrides = traitOverrides;

  let charGen = new CharacterGenerator(charConfig);

  let child = charGen.generate();

  return child;
}

function getNewMate(member: FamilyMember, family: Family): Character {
  let gender = member.character.gender;

  let charConfig = new CharacterGeneratorConfig();
  charConfig.speciesOptions = [member.character.species];
  charConfig.ageCategories = ["adult"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  charConfig.genderOptions = [getMateGender(gender, member.character.species.genders)];

  let charGen = new CharacterGenerator(charConfig);

  let mate = charGen.generate();

  return mate;
}

function getMateGender(gender1: Gender, genders: Gender[]): Gender {
  for (let i=0;i<genders.length;i++) {
    if (genders[i].name != gender1.name) {
      return genders[i];
    }
  }

  return gender1;
}

function needsChildren(member: FamilyMember): boolean {
  if (member.mate != -1 && member.children.length == 0 && member.character.ageCategory.name == "adult") {
    return true;
  }

  return false;
}

function needsMate(member: FamilyMember): boolean {
  if (member.character.ageCategory.name == "adult" && member.mate == -1) {
    return true;
  }

  return false;
}
