import * as MUN from "@ironarachne/made-up-names";
import { b as getCategoryList, i as inchesToFeetExpression, c as cmToInches, k as kgToPounds, d as getCategoryFromName, e as getHumanVariant, h as humanStandardFemale, f as humanStandardMale } from "./agecategories.js";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import "lodash";
class PersonalityTrait {
  name;
  score;
  descriptor;
  positiveDescriptor;
  negativeDescriptor;
  constructor(name, negativeDescriptor, positiveDescriptor) {
    this.name = name;
    this.score = 0;
    this.descriptor = "";
    this.negativeDescriptor = negativeDescriptor;
    this.positiveDescriptor = positiveDescriptor;
  }
}
class Gender {
  name;
  subjectivePronoun;
  objectivePronoun;
  possessivePronoun;
  maxAge;
  ageCategories;
  constructor(name, subj, obj, pos, maxAge, ageCategories) {
    this.name = name;
    this.subjectivePronoun = subj;
    this.objectivePronoun = obj;
    this.possessivePronoun = pos;
    this.maxAge = maxAge;
    this.ageCategories = ageCategories;
  }
}
class PhysicalTrait {
  name;
  description;
  category;
  tags;
  constructor(name, description, category, tags) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.tags = tags;
  }
}
class Character {
  titles;
  heraldry;
  archetype;
  species;
  description;
  summary;
  gender;
  age;
  ageCategory;
  height;
  weight;
  traits;
  personalityTraits;
  physicalTraits;
  name;
  firstName;
  lastName;
  status;
  statBlock;
  abilities;
  carried;
  threatLevel;
  tags;
  constructor(species) {
    this.titles = [];
    this.abilities = species.abilities;
    this.tags = species.tags;
    this.heraldry = null;
    this.species = species;
    this.description = "";
    this.summary = "";
    this.age = 0;
    this.height = 0;
    this.weight = 0;
    this.traits = [];
    this.physicalTraits = [];
    this.name = "";
    this.firstName = "";
    this.lastName = "";
    this.status = "alive";
    this.carried = [];
    this.threatLevel = species.threatLevel;
  }
  getHonorific() {
    let primaryTitle = this.getPrimaryTitle();
    if (primaryTitle) {
      return primaryTitle.getHonorific(this.gender.name);
    }
    return "";
  }
  getPrimaryTitle() {
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
  getRandomTrait() {
    return RND.item(this.traits);
  }
  getTitle() {
    let primaryTitle = this.getPrimaryTitle();
    if (primaryTitle) {
      return primaryTitle.getTitle(this.gender.name);
    }
    return "";
  }
}
class CharacterGeneratorConfig {
  ageCategories;
  familyNameGenerator;
  femaleNameGenerator;
  maleNameGenerator;
  speciesOptions;
  physicalTraitOverrides;
  useAdaptiveNames;
  genderNameOptions;
  constructor() {
    this.ageCategories = getCategoryList();
    let genSet = new MUN.HumanSet();
    if (genSet.family === null) {
      throw new Error("Family name generator not found");
    }
    if (genSet.female === null) {
      throw new Error("Female name generator not found");
    }
    if (genSet.male === null) {
      throw new Error("Male name generator not found");
    }
    this.familyNameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
    this.speciesOptions = [];
    this.genderNameOptions = ["male", "female"];
    this.useAdaptiveNames = false;
    this.physicalTraitOverrides = [];
  }
}
function all$1() {
  return [
    new PersonalityTrait("aggressiveness", "passive", "belligerent"),
    new PersonalityTrait("altruism", "selfish", "selfless"),
    new PersonalityTrait("bravery", "cowardly", "brave"),
    new PersonalityTrait("competitiveness", "cooperative", "competitive"),
    new PersonalityTrait("confidence", "uncertain", "confident"),
    new PersonalityTrait("creativity", "unimaginative", "creative"),
    new PersonalityTrait("eloquence", "plain-spoken", "eloquent"),
    new PersonalityTrait("friendliness", "aloof", "friendly"),
    new PersonalityTrait("honesty", "dishonest", "honest"),
    new PersonalityTrait("industriousness", "lazy", "hard-working"),
    new PersonalityTrait("intelligence", "stupid", "smart"),
    new PersonalityTrait("kindness", "cruel", "kind"),
    new PersonalityTrait("loyalty", "disloyal", "loyal"),
    new PersonalityTrait("optimism", "pessimistic", "optimistic"),
    new PersonalityTrait("politeness", "rude", "polite"),
    new PersonalityTrait("thoughtfulness", "unthinking", "thoughtful"),
    new PersonalityTrait("tolerance", "intolerant", "tolerant"),
    new PersonalityTrait("wisdom", "foolish", "wise")
  ];
}
class PersonalityGeneratorConfig {
  numberOfPositiveTraits;
  numberOfNegativeTraits;
  traits;
  constructor() {
    this.numberOfNegativeTraits = 1;
    this.numberOfPositiveTraits = 2;
    this.traits = all$1();
  }
}
class PersonalityGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let traits = [];
    RND.shuffle(this.config.traits);
    for (let i = 0; i < this.config.numberOfPositiveTraits; i++) {
      let trait = this.config.traits.pop();
      if (trait === void 0) {
        throw new Error("Personality trait is undefined.");
      }
      trait.score = random.int(1, 50);
      trait.descriptor = trait.positiveDescriptor;
      traits.push(trait);
    }
    for (let i = 0; i < this.config.numberOfNegativeTraits; i++) {
      let trait = this.config.traits.pop();
      if (trait === void 0) {
        throw new Error("Personality trait is undefined.");
      }
      trait.score = random.int(-50, -1);
      trait.descriptor = trait.negativeDescriptor;
      traits.push(trait);
    }
    return traits;
  }
}
class CharacterGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  describe(character) {
    let description = "";
    const sbj = character.gender.subjectivePronoun;
    const ucSbj = Words.capitalize(sbj);
    const genderNoun = character.ageCategory.noun;
    const height = character.height + " cm (" + inchesToFeetExpression(cmToInches(character.height)) + ")";
    const weight = character.weight + " kg (" + Math.round(kgToPounds(character.weight)) + " lb.)";
    const spPhrase = character.species.adjective + " " + genderNoun;
    const traits = Words.arrayToPhrase(describeTraits(character));
    description = RND.item([
      `${character.firstName} ${character.lastName} is a ${height} tall ${spPhrase}. ${ucSbj} is ${character.age} years old. ${character.firstName} has ${traits}. `,
      `${character.firstName} is ${Words.article(spPhrase)} ${spPhrase} of ${character.age} years. ${ucSbj} is ${height} tall and weighs ${weight}. ${ucSbj} has ${traits}. `
    ]);
    description += describePersonality(character) + ".";
    return description;
  }
  generate() {
    const species = RND.weighted(this.config.speciesOptions);
    const ageCategoryName = RND.item(this.config.ageCategories);
    const genderName = RND.item(this.config.genderNameOptions);
    let gender;
    for (let i = 0; i < species.genders.length; i++) {
      if (species.genders[i].name === genderName) {
        gender = species.genders[i];
      }
    }
    let familyNameGenerator = this.config.familyNameGenerator;
    let femaleNameGenerator = this.config.femaleNameGenerator;
    let maleNameGenerator = this.config.maleNameGenerator;
    if (this.config.useAdaptiveNames) {
      familyNameGenerator = species.nameGeneratorSet.family;
      femaleNameGenerator = species.nameGeneratorSet.female;
      maleNameGenerator = species.nameGeneratorSet.male;
    }
    let firstNames = [];
    const lastNames = familyNameGenerator.generate(30);
    if (gender.name === "female") {
      firstNames = femaleNameGenerator.generate(30);
    } else {
      firstNames = maleNameGenerator.generate(30);
    }
    const character = new Character(species);
    const ageCategory = getCategoryFromName(ageCategoryName, gender.ageCategories);
    character.age = ageCategory.randomAge();
    character.ageCategory = ageCategory;
    character.gender = gender;
    character.height = ageCategory.randomHeight();
    character.weight = ageCategory.randomWeight();
    character.personalityTraits = getRandomPersonality();
    character.physicalTraits = getRandomTraits(species);
    if (this.config.physicalTraitOverrides.length > 0) {
      character.physicalTraits = this.config.physicalTraitOverrides;
    }
    character.firstName = RND.item(firstNames);
    character.lastName = RND.item(lastNames);
    character.name = `${character.firstName} ${character.lastName}`;
    character.description = this.describe(character);
    return character;
  }
}
function describePersonality(character) {
  let traits = [];
  for (let i = 0; i < character.personalityTraits.length; i++) {
    traits.push(character.personalityTraits[i].descriptor);
  }
  let description = Words.capitalize(character.gender.subjectivePronoun) + " is " + Words.arrayToPhrase(traits);
  return description;
}
function describeTraits(character) {
  let traits = [];
  for (let i = 0; i < character.physicalTraits.length; i++) {
    traits.push(character.physicalTraits[i].description);
  }
  return traits;
}
function getRandomPersonality() {
  const numberOfPositiveTraits = random.int(1, 2);
  const numberOfNegativeTraits = random.int(0, 1);
  const genConfig = new PersonalityGeneratorConfig();
  genConfig.numberOfNegativeTraits = numberOfNegativeTraits;
  genConfig.numberOfPositiveTraits = numberOfPositiveTraits;
  let generator = new PersonalityGenerator(genConfig);
  return generator.generate();
}
function getRandomTraits(species) {
  const traits = [];
  for (let i = 0; i < species.physicalTraitGenerators.length; i++) {
    const newTrait = species.physicalTraitGenerators[i].generate();
    traits.push(newTrait);
  }
  return traits;
}
class PhysicalTraitGenerator {
  name;
  category;
  options;
  tags;
  constructor(name, category, options, tags) {
    this.name = name;
    this.category = category;
    this.options = options;
    this.tags = tags;
  }
  generate() {
    let description = RND.item(this.options) + " " + this.name;
    return new PhysicalTrait(this.name, description, this.category, this.tags);
  }
}
class Aarakocra {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "aarakocra";
    this.abilities = ["flight"];
    this.tags = ["corruptible", "aarakocra", "flying", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "aarakocras";
    this.adjective = "aarakocra";
    this.commonality = 5;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    const wingLengths = ["short", "long"];
    const wingTypes = ["black-tipped", "sleek", "knife-edged", "graceful", "full"];
    let wingAppearances = [];
    for (let j = 0; j < wingTypes.length; j++) {
      for (let i = 0; i < wingLengths.length; i++) {
        wingAppearances.push(`${wingLengths[i]} and ${wingTypes[j]}`);
      }
      wingAppearances.push(wingTypes[j]);
    }
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator("wings", "wings", wingAppearances, ["wings"]),
      new PhysicalTraitGenerator(
        "feathers",
        "feathers",
        ["white", "mottled", "brown", "russet", "black", "grey", "red", "orange"],
        ["feathers"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["yellow", "red", "white", "silver", "gold", "blue", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        120,
        getHumanVariant(1.2, 0.7, 0.95, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        120,
        getHumanVariant(1.2, 0.8, 0.95, "male")
      )
    ];
  }
}
class Aasimar {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "aasimar";
    this.abilities = ["healing touch", "summon light"];
    this.tags = ["aasimar", "celestial", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "aasimar";
    this.adjective = "aasimar";
    this.commonality = 5;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet", "white"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white", "black", "brown"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green", "gold", "silver"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        160,
        getHumanVariant(1.6, 0.9, 0.95, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        160,
        getHumanVariant(1.6, 0.9, 0.95, "male")
      )
    ];
  }
}
class Bugbear {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "bugbear";
    this.abilities = [];
    this.tags = ["corruptible", "bugbear", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.OrcSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "bugbears";
    this.adjective = "bugbear";
    this.commonality = 5;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid", "goblinoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "brown", "dark", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        getHumanVariant(0.8, 1.05, 1.1, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        getHumanVariant(0.8, 1.1, 1.15, "male")
      )
    ];
  }
}
class Centaur {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "centaur";
    this.abilities = [];
    this.tags = ["centaur", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "centaurs";
    this.adjective = "centaur";
    this.commonality = 5;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban"
    ];
    this.creatureTypes = ["fey"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      ),
      new PhysicalTraitGenerator(
        "horse-hide",
        "horse-hide",
        ["black", "brown", "dark", "light", "white"],
        ["horse-hide"]
      ),
      new PhysicalTraitGenerator(
        "hooves",
        "hooves",
        ["heavy", "small", "sharp", "black", "white", "hairy"],
        ["hooves"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        185,
        getHumanVariant(1.85, 1.45, 1.25, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        185,
        getHumanVariant(1.85, 1.5, 1.3, "male")
      )
    ];
  }
}
class DarkElf {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "dark elf";
    this.abilities = [];
    this.tags = ["corruptible", "dark elf", "elf", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.ElfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "dark elves";
    this.adjective = "dark elven";
    this.commonality = 5;
    this.environments = ["forest", "mountain", "underdark"];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator("hair", "hair", ["white", "light grey"], ["hair"]),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "jet black", "dark grey", "grey", "light grey", "blue-grey"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["blue", "purple", "brown", "dark", "amber", "grey", "red"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        700,
        getHumanVariant(7, 0.6, 0.9, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        700,
        getHumanVariant(7, 0.6, 0.95, "male")
      )
    ];
  }
}
class DeepGnome {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "deep gnome";
    this.abilities = ["can see in the dark"];
    this.tags = ["corruptible", "deep gnome", "gnome", "sentient", "magic"];
    this.nameGeneratorSet = new MUN.GnomeSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "deep gnomes";
    this.adjective = "deep gnomish";
    this.commonality = 5;
    this.environments = ["underdark"];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator("hair", "hair", ["black", "dark", "light", "white"], ["hair"]),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["grey", "dark grey", "pale", "light grey", "bone white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "black", "brown", "dark", "white"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        500,
        getHumanVariant(5, 0.4, 0.4, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        500,
        getHumanVariant(5, 0.5, 0.5, "male")
      )
    ];
  }
}
class Dragonborn {
  name;
  nameGeneratorSet;
  pluralName;
  description;
  summary;
  adjective;
  commonality;
  environments;
  carried;
  statBlock;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "dragonborn";
    this.abilities = [];
    this.tags = ["corruptible", "dragonborn", "dragonkin", "martial", "sentient", "magic"];
    this.nameGeneratorSet = new MUN.DragonbornSet();
    this.pluralName = "dragonborn";
    this.adjective = "dragonborn";
    this.carried = [];
    this.statBlock = null;
    this.commonality = 10;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "dark", "green", "orange", "red", "turquoise", "white", "yellow"],
        ["eyes"]
      ),
      new PhysicalTraitGenerator(
        "scales",
        "skin",
        [
          "amethyst",
          "black",
          "blue",
          "brass",
          "bronze",
          "copper",
          "crystal",
          "emerald",
          "gold",
          "green",
          "red",
          "sapphire",
          "silver",
          "topaz",
          "white"
        ],
        ["scales", "skin"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        getHumanVariant(0.8, 1.5, 1.05, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        getHumanVariant(0.8, 1.7, 1.1, "male")
      )
    ];
  }
}
class Duergar {
  name;
  nameGeneratorSet;
  pluralName;
  description;
  summary;
  adjective;
  commonality;
  environments;
  carried;
  statBlock;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "duergar";
    this.abilities = ["can see in the dark"];
    this.tags = ["corruptible", "duergar", "dwarf", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.DwarfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "duergar";
    this.adjective = "duergar";
    this.commonality = 5;
    this.environments = ["underdark"];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["dark", "black", "russet", "brown", "red"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["grey", "blue-grey", "dark grey", "light grey"],
        ["skin"]
      ),
      new PhysicalTraitGenerator("eyes", "eyes", ["black", "red", "dark", "amber"], ["eyes"])
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        300,
        getHumanVariant(3, 0.9, 0.75, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        300,
        getHumanVariant(3, 1, 0.75, "male")
      )
    ];
  }
}
class Dwarf {
  name;
  nameGeneratorSet;
  pluralName;
  description;
  summary;
  adjective;
  commonality;
  environments;
  carried;
  statBlock;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "dwarf";
    this.abilities = [];
    this.tags = ["corruptible", "dwarf", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.DwarfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "dwarves";
    this.adjective = "dwarven";
    this.commonality = 20;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["dark", "black", "russet", "brown", "red"],
        ["hair"]
      ),
      new PhysicalTraitGenerator("skin", "skin", ["tan", "bronzed", "ruddy"], ["skin"]),
      new PhysicalTraitGenerator("eyes", "eyes", ["green", "brown", "dark", "amber"], ["eyes"])
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        300,
        getHumanVariant(3, 0.9, 0.75, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        300,
        getHumanVariant(3, 1, 0.75, "male")
      )
    ];
  }
}
class Elf {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "elf";
    this.abilities = [];
    this.tags = ["corruptible", "elf", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.ElfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "elves";
    this.adjective = "elven";
    this.commonality = 30;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["tan", "light", "bronzed", "white", "pale"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["blue", "green", "brown", "dark", "amber", "grey"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        700,
        getHumanVariant(7, 0.6, 0.9, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        700,
        getHumanVariant(7, 0.6, 0.95, "male")
      )
    ];
  }
}
class Firbolg {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "firbolg";
    this.abilities = ["can turn invisible when not attacking"];
    this.tags = ["firbolg", "giant", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.FantasySet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "firbolgs";
    this.adjective = "firbolg";
    this.commonality = 5;
    this.environments = ["forest", "grassland", "hill", "mountain"];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 2;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        500,
        getHumanVariant(5, 1.75, 1.75, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        500,
        getHumanVariant(5, 1.9, 1.8, "male")
      )
    ];
  }
}
class Gnome {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "gnome";
    this.abilities = [];
    this.tags = ["corruptible", "gnome", "sentient", "magic"];
    this.nameGeneratorSet = new MUN.GnomeSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "gnomes";
    this.adjective = "gnomish";
    this.commonality = 20;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        500,
        getHumanVariant(5, 0.4, 0.4, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        500,
        getHumanVariant(5, 0.5, 0.4, "male")
      )
    ];
  }
}
class Goblin {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "goblin";
    this.abilities = [];
    this.tags = ["goblin", "sentient"];
    this.nameGeneratorSet = new MUN.GoblinSet();
    this.pluralName = "goblins";
    this.adjective = "goblin";
    this.commonality = 20;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["goblinoid", "humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["green", "grey", "pale", "dark green", "brown"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "orange"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        150,
        getHumanVariant(1.5, 0.5, 0.6, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        150,
        getHumanVariant(1.5, 0.5, 0.6, "male")
      )
    ];
  }
}
class HalfElf {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "half-elf";
    this.abilities = [];
    this.tags = ["corruptible", "half-elf", "elf", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.HalfElfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "half-elves";
    this.adjective = "half-elven";
    this.commonality = 15;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        185,
        getHumanVariant(1.85, 0.9, 0.95, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        185,
        getHumanVariant(1.85, 0.9, 0.95, "male")
      )
    ];
  }
}
class HalfOrc {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "half-orc";
    this.abilities = [];
    this.tags = ["corruptible", "half-orc", "orc", "human", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.HalfOrcSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "half-orcs";
    this.adjective = "half-orc";
    this.commonality = 10;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "bronzed", "ebony", "green", "grey", "light", "olive", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        getHumanVariant(0.8, 0.85, 0.9, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        getHumanVariant(0.8, 0.9, 0.95, "male")
      )
    ];
  }
}
class Halfling {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "halfling";
    this.abilities = [];
    this.tags = ["halfling", "sentient"];
    this.nameGeneratorSet = new MUN.HalflingSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "halflings";
    this.adjective = "halfling";
    this.commonality = 20;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["bronzed", "light", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        150,
        getHumanVariant(1.5, 0.5, 0.6, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        150,
        getHumanVariant(1.5, 0.5, 0.6, "male")
      )
    ];
  }
}
class HighElf {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "elf";
    this.abilities = [];
    this.tags = ["high elf", "elf", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.ElfSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "high elves";
    this.adjective = "high elven";
    this.commonality = 30;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["tan", "light", "bronzed", "white", "pale"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["blue", "green", "brown", "dark", "amber", "grey"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        700,
        getHumanVariant(7, 0.6, 0.9, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        700,
        getHumanVariant(7, 0.6, 0.95, "male")
      )
    ];
  }
}
class Hobgoblin {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "hobgoblin";
    this.abilities = [];
    this.tags = ["corruptible", "hobgoblin", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.OrcSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "hobgoblins";
    this.adjective = "hobgoblin";
    this.commonality = 5;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid", "goblinoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "brown", "dark", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["red", "dark grey", "grey", "russet", "bronze"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        getHumanVariant(0.8, 1.05, 1.1, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        getHumanVariant(0.8, 1.1, 1.15, "male")
      )
    ];
  }
}
class Human {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "human";
    this.abilities = [];
    this.tags = ["corruptible", "human", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.HumanSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "humans";
    this.adjective = "human";
    this.commonality = 200;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "blonde", "brown", "dark", "light", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "bronzed", "ebony", "light", "pale", "tan", "white"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "blue", "brown", "dark", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender("female", "she", "her", "her", 100, humanStandardFemale()),
      new Gender("male", "he", "him", "his", 100, humanStandardMale())
    ];
  }
}
class Orc {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "orc";
    this.abilities = [];
    this.tags = ["corruptible", "orc", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.OrcSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "orcs";
    this.adjective = "orc";
    this.commonality = 10;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "brown", "dark", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        getHumanVariant(0.8, 1.05, 1.1, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        getHumanVariant(0.8, 1.1, 1.15, "male")
      )
    ];
  }
}
class Tiefling {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "tiefling";
    this.abilities = [];
    this.tags = ["corruptible", "tiefling", "demonic", "martial", "magic", "sentient"];
    this.nameGeneratorSet = new MUN.TieflingSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "tieflings";
    this.adjective = "tiefling";
    this.commonality = 5;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 1;
    const hornLengths = ["short", "long"];
    const hornTypes = ["curved", "straight", "curled", "spiraled"];
    let hornAppearances = [];
    for (let j = 0; j < hornTypes.length; j++) {
      for (let i = 0; i < hornLengths.length; i++) {
        hornAppearances.push(`${hornLengths[i]} and ${hornTypes[j]}`);
      }
      hornAppearances.push(hornTypes[j]);
    }
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        [
          "black",
          "brown",
          "dark",
          "red",
          "russet",
          "blue",
          "dark blue",
          "dark red",
          "dark purple",
          "purple"
        ],
        ["hair"]
      ),
      new PhysicalTraitGenerator("horns", "horns", hornAppearances, ["horns"]),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        [
          "tan",
          "light",
          "bronzed",
          "white",
          "pale",
          "red",
          "purple",
          "blue",
          "ochre",
          "yellow",
          "brown",
          "black"
        ],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["black", "red", "white", "silver", "gold", "blue", "green"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        120,
        getHumanVariant(1.2, 1.1, 1, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        120,
        getHumanVariant(1.2, 1.2, 1, "male")
      )
    ];
  }
}
class Troll {
  name;
  nameGeneratorSet;
  pluralName;
  adjective;
  description;
  summary;
  commonality;
  carried;
  statBlock;
  environments;
  creatureTypes;
  physicalTraitGenerators;
  genders;
  abilities;
  tags;
  threatLevel;
  constructor() {
    this.name = "troll";
    this.abilities = ["regenerate slowly unless burned"];
    this.tags = ["corruptible", "troll", "greenskin", "martial", "sentient"];
    this.nameGeneratorSet = new MUN.TrollSet();
    this.carried = [];
    this.statBlock = null;
    this.pluralName = "trolls";
    this.adjective = "troll";
    this.commonality = 10;
    this.environments = [
      "arctic",
      "coastal",
      "desert",
      "forest",
      "grassland",
      "hill",
      "mountain",
      "urban",
      "underdark"
    ];
    this.creatureTypes = ["humanoid"];
    this.threatLevel = 2;
    this.physicalTraitGenerators = [
      new PhysicalTraitGenerator(
        "hair",
        "hair",
        ["black", "brown", "dark", "red", "russet"],
        ["hair"]
      ),
      new PhysicalTraitGenerator(
        "skin",
        "skin",
        ["black", "dark green", "dark grey", "grey", "light green", "green", "grey", "olive"],
        ["skin"]
      ),
      new PhysicalTraitGenerator(
        "eyes",
        "eyes",
        ["amber", "red", "brown", "dark", "yellow", "orange", "grey"],
        ["eyes"]
      )
    ];
    this.genders = [
      new Gender(
        "female",
        "she",
        "her",
        "her",
        80,
        getHumanVariant(0.8, 1.15, 1.2, "female")
      ),
      new Gender(
        "male",
        "he",
        "him",
        "his",
        80,
        getHumanVariant(0.8, 1.2, 1.25, "male")
      )
    ];
  }
}
function all() {
  let result = [];
  result = result.concat(goblinoids());
  result = result.concat(fantastical());
  result = result.concat(pc());
  return result;
}
function goblinoids() {
  let result = [new Bugbear(), new Goblin(), new Hobgoblin(), new Orc(), new Troll()];
  return result;
}
function fantastical() {
  let result = [
    new Aarakocra(),
    new Aasimar(),
    new Centaur(),
    new DarkElf(),
    new DeepGnome(),
    new Duergar(),
    new Firbolg(),
    new HighElf()
  ];
  return result;
}
function pc() {
  return [
    new Dragonborn(),
    new Dwarf(),
    new Elf(),
    new Gnome(),
    new HalfElf(),
    new Halfling(),
    new HalfOrc(),
    new Human(),
    new Tiefling()
  ];
}
export {
  CharacterGenerator as C,
  all as a,
  CharacterGeneratorConfig as b,
  pc as p
};
