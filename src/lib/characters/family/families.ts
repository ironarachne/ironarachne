import * as AgeCategories from "$lib/age/age_categories.js";
import * as Characters from "$lib/characters/characters.js";
import type Gender from "$lib/gender/gender.js";
import * as SizeMatrix from "$lib/size/size_matrix.js";
import human from "$lib/species/sentient/human.js";
import * as MUN from "@ironarachne/made-up-names";
import * as RND from "@ironarachne/rng";
import random from "random";
import type Character from "../character";
import type Family from "./family";
import type FamilyGeneratorConfig from "./family_generator_config";
import type FamilyMember from "./family_member";

export function generate(config: FamilyGeneratorConfig): Family {
  let family: Family = {
    name: "",
    familyNameGenerator: config.rootFamilyNameGenerator,
    femaleNameGenerator: config.rootFemaleNameGenerator,
    maleNameGenerator: config.rootMaleNameGenerator,
    members: [],
  };

  let genderNames = [];
  for (let i = 0; i < config.species.genders.length; i++) {
    genderNames.push(config.species.genders[i].name);
  }

  let charGenConfig = {
    speciesOptions: [config.species],
    ageCategoryNames: [config.species.ageCategories[3].name],
    familyNameGenerator: family.familyNameGenerator,
    femaleNameGenerator: family.femaleNameGenerator,
    maleNameGenerator: family.maleNameGenerator,
    genderNameOptions: genderNames,
    useAdaptiveNames: false,
    physicalTraitOverrides: [],
  };

  let parent1: FamilyMember = {
    id: 0,
    character: Characters.generate(charGenConfig),
    parents: [],
    children: [],
    mate: 0,
  };
  parent1.character.age += 5;
  parent1.character.description = Characters.describe(parent1.character);

  let mateGender = getMateGender(parent1.character.gender, config.species.genders);
  charGenConfig.genderNameOptions = [mateGender.name];
  let parent2: FamilyMember = {
    id: 1,
    character: Characters.generate(charGenConfig),
    parents: [],
    children: [],
    mate: 0,
  };
  parent2.character.age += 5;
  parent2.character.description = Characters.describe(parent2.character);

  if (parent1.character.gender.name == config.dominantFamilyNameGender.name) {
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

  for (let i = 0; i < config.iterations; i++) {
    family = iterate(family, config);
  }

  return family;
}

export function getChildren(family: Family, parent: FamilyMember): FamilyMember[] {
  let children: FamilyMember[] = [];
  for (let i = 0; i < parent.children.length; i++) {
    children.push(family.members[parent.children[i]]);
  }

  return children;
}

export function getDefaultConfig(): FamilyGeneratorConfig {
  let generatorSets = MUN.allSets();
  let generatorSet = MUN.getSetByName("human", generatorSets);
  let config = {
    species: human,
    iterations: 10,
    rootFamilyNameGenerator: generatorSet.family,
    rootFemaleNameGenerator: generatorSet.female,
    rootMaleNameGenerator: generatorSet.male,
    dominantFamilyNameGender: human.genders[1],
  };

  return config;
}

export function getMate(family: Family, person: FamilyMember): FamilyMember {
  return family.members[person.mate];
}

export function getParents(family: Family, person: FamilyMember): FamilyMember[] {
  let parents = [];
  for (let i = 0; i < person.parents.length; i++) {
    parents.push(family.members[person.parents[i]]);
  }

  return parents;
}

export function iterate(family: Family, config: FamilyGeneratorConfig): Family {
  const ageStep = 5;

  for (let i = 0; i < family.members.length; i++) {
    if (family.members[i].character.status == "alive") {
      family.members[i].character.age += ageStep;
    }

    if (
      family.members[i].character.age
        > AgeCategories.getMaxAge(family.members[i].character.species.ageCategories)
    ) {
      // This person died of old age
      family.members[i].character.status = "dead";
    } else {
      // This person aged normally
      let newAgeCategory = AgeCategories.getCategoryFromAge(
        family.members[i].character.age,
        family.members[i].character.species.ageCategories,
      );

      if (newAgeCategory.name != family.members[i].character.ageCategory.name) {
        // This person aged into a new age category and needs a new height and weight
        let sizeGeneratorConfig = SizeMatrix.getSizeConfig(
          family.members[i].character.gender.name,
          newAgeCategory.name,
          family.members[i].character.species.sizeGeneratorConfigMatrix,
        );

        family.members[i].character.height = random.int(sizeGeneratorConfig.minHeight, sizeGeneratorConfig.maxHeight);
        family.members[i].character.weight = random.int(sizeGeneratorConfig.minWeight, sizeGeneratorConfig.maxWeight);
      }
      family.members[i].character.ageCategory = newAgeCategory;
    }

    family.members[i].character.description = Characters.describe(family.members[i].character);

    if (family.members[i].character.status == "dead") {
      continue;
    }

    if (RND.simple(100) > 98) {
      // There's a 2% chance something horrible kills this person
      family.members[i].character.status = "dead";
      continue;
    }

    if (needsChildren(family.members[i]) && RND.simple(100) > 30) {
      let numberOfChildren = random.int(1, 4);
      for (let j = 0; j < numberOfChildren; j++) {
        let child = getNewChild(i, family.members[i].mate, family);
        let newMember: FamilyMember = {
          id: family.members.length,
          character: child,
          children: [],
          parents: [i, family.members[i].mate],
          mate: -1,
        };
        family.members[i].children.push(newMember.id);
        family.members[family.members[i].mate].children.push(newMember.id);

        if (
          family.members[i].character.gender.name == config.dominantFamilyNameGender.name
        ) {
          newMember.character.lastName = family.members[i].character.lastName;
        } else {
          newMember.character.lastName = family.members[family.members[i].mate].character.lastName;
        }

        family.members.push(newMember);
      }
    }

    if (needsMate(family.members[i]) && RND.simple(100) > 50) {
      let mate = getNewMate(family.members[i], family);
      let newMember: FamilyMember = { id: family.members.length, character: mate, children: [], parents: [], mate: i };
      family.members[i].mate = newMember.id;

      if (family.members[i].character.gender.name == config.dominantFamilyNameGender.name) {
        newMember.character.lastName = family.members[i].character.lastName;
      } else {
        family.members[i].character.lastName = newMember.character.lastName;
      }

      family.members.push(newMember);
    }
  }

  return family;
}

function getNewChild(parent1Index: number, parent2Index: number, family: Family): Character {
  let parent1 = family.members[parent1Index].character;
  let parent2 = family.members[parent2Index].character;

  let physicalTraits = parent1.physicalTraits.concat(parent2.physicalTraits);
  let uniqueNames: string[] = [];
  let traitOverrides = [];
  physicalTraits = RND.shuffle(physicalTraits);
  for (let i = 0; i < physicalTraits.length; i++) {
    if (!uniqueNames.includes(physicalTraits[i].name)) {
      traitOverrides.push(physicalTraits[i]);
      uniqueNames.push(physicalTraits[i].name);
    }
  }

  let charConfig = Characters.getDefaultCharacterGeneratorConfig();
  charConfig.speciesOptions = [parent1.species, parent2.species];
  charConfig.ageCategoryNames = ["infant", "toddler"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  let genderNames = [];
  for (let i = 0; i < parent1.species.genders.length; i++) {
    genderNames.push(parent1.species.genders[i].name);
  }
  charConfig.genderNameOptions = genderNames;
  charConfig.physicalTraitOverrides = traitOverrides;

  let child = Characters.generate(charConfig);

  return child;
}

function getNewMate(member: FamilyMember, family: Family): Character {
  let gender = member.character.gender;

  let charConfig = Characters.getDefaultCharacterGeneratorConfig();
  charConfig.speciesOptions = [member.character.species];
  charConfig.ageCategoryNames = ["adult"];
  charConfig.familyNameGenerator = family.familyNameGenerator;
  charConfig.femaleNameGenerator = family.femaleNameGenerator;
  charConfig.maleNameGenerator = family.maleNameGenerator;
  charConfig.genderNameOptions = [getMateGender(gender, member.character.species.genders).name];

  let mate = Characters.generate(charConfig);

  return mate;
}

function getMateGender(gender1: Gender, genders: Gender[]): Gender {
  for (let i = 0; i < genders.length; i++) {
    if (genders[i].name != gender1.name) {
      return genders[i];
    }
  }

  return gender1;
}

function needsChildren(member: FamilyMember): boolean {
  if (
    member.mate != -1
    && member.children.length == 0
    && member.character.ageCategory.name == "adult"
  ) {
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
