import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import "./sentry-release-injection-file.js";
import { l as human, c as generate } from "./characters.js";
import { D as Domain, a as allDomains } from "./domains.js";
import { g as getFantasy } from "./premade_configs.js";
import * as MUN from "@ironarachne/made-up-names";
class Relationship {
  noun;
  target;
  verb;
  strength;
  constructor(noun, verb, target, strength) {
    this.noun = noun;
    this.verb = verb;
    this.target = target;
    this.strength = strength;
  }
}
class RelationshipGenerator {
  strength;
  constructor(strength) {
    this.strength = strength;
  }
  generate() {
    let verb = "";
    let noun = "";
    if (this.strength == -1) {
      verb = RND.item(["dislikes", "distrusts", "mistrusts", "is annoyed by"]);
      noun = "enemy";
    } else if (this.strength == -2) {
      verb = RND.item(["fears", "hates", "loathes", "can't stand"]);
      noun = "enemy";
    } else if (this.strength == 0) {
      verb = RND.item([
        "is intrigued by",
        "is ambivalent towards",
        "is neutral towards",
        "is suspicious of"
      ]);
      noun = "acquaintance";
    } else if (this.strength == 1) {
      verb = RND.item(["likes", "is amused by", "enjoys the company of", "enjoys", "trusts"]);
      noun = "friend";
    } else {
      verb = RND.item(["loves", "deeply trusts", "adores"]);
      noun = "friend";
    }
    return new Relationship(noun, verb, 0, this.strength);
  }
}
class DomainSet {
  primary;
  secondaries;
  constructor() {
    this.primary = new Domain();
    this.secondaries = [];
  }
}
class Realm {
  name;
  description;
  personalityTraits;
  appearanceTraits;
  constructor() {
    this.name = "";
    this.description = "";
    this.personalityTraits = [];
    this.appearanceTraits = [];
  }
}
class Deity {
  name;
  species;
  gender;
  ageCategory;
  domains;
  titles;
  realm;
  description;
  personalityTraits;
  personality;
  appearance;
  holyItem;
  holySymbol;
  isAlive;
  constructor() {
    this.name = "";
    this.species = human;
    this.gender = human.genders[0];
    this.ageCategory = human.ageCategories[0];
    this.domains = new DomainSet();
    this.titles = [];
    this.realm = new Realm();
    this.description = "";
    this.personality = "";
    this.personalityTraits = [];
    this.appearance = "";
    this.holyItem = "";
    this.holySymbol = "";
    this.isAlive = true;
  }
  describe() {
    const speciesAdj = this.species.adjective;
    const subjectivePronoun = this.gender.pronouns.subjective;
    let noun = "god";
    const domainNames = [];
    domainNames.push(this.domains.primary.name);
    for (let i = 0; i < this.domains.secondaries.length; i++) {
      domainNames.push(this.domains.secondaries[i].name);
    }
    if (this.gender.name === "female") {
      noun = "goddess";
    }
    let description = `${this.name} appears as ${Words.article(speciesAdj)} ${speciesAdj} ${this.ageCategory.noun}.`;
    description += ` ${Words.capitalize(subjectivePronoun)} has ${this.appearance}. ${this.personality}.`;
    description += ` ${this.name} is the ${noun} of ${Words.arrayToPhrase(domainNames)}.`;
    description += ` ${Words.capitalize(subjectivePronoun)} resides in ${Words.uncapitalize(
      this.realm.name
    )}.`;
    return description;
  }
}
function newDeity(name, species, gender, ageCategory, realm, domains) {
  let deity = new Deity();
  deity.name = name;
  deity.species = species;
  deity.gender = gender;
  deity.ageCategory = ageCategory;
  deity.domains = domains;
  deity.realm = realm;
  return deity;
}
class DeityGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let possibleHolyItems = [];
    let possibleHolySymbols = [];
    const characterDetails = generate(this.config.characterGeneratorConfig);
    if (this.config.maleNameGenerator === null) {
      throw new Error("male name generator not set");
    } else if (this.config.femaleNameGenerator === null) {
      throw new Error("female name generator not set");
    }
    let deityName = this.config.femaleNameGenerator.generate(1)[0];
    if (characterDetails.gender.name == "male") {
      deityName = this.config.maleNameGenerator.generate(1)[0];
    }
    let realm = RND.item(this.config.realms);
    if (realm === void 0) {
      throw new Error("realm is undefined");
    }
    let deity = newDeity(
      deityName,
      characterDetails.species,
      characterDetails.gender,
      characterDetails.ageCategory,
      realm,
      this.config.domainSet
    );
    possibleHolyItems = this.config.domainSet.primary.holyItems;
    possibleHolySymbols = this.config.domainSet.primary.holySymbols;
    deity.holyItem = RND.item(possibleHolyItems);
    deity.holySymbol = RND.item(possibleHolySymbols);
    const chanceOfRealmTrait = RND.simple(100);
    const physicalTraits = characterDetails.physicalTraits;
    let appearanceTraits = [];
    for (let i = 0; i < physicalTraits.length; i++) {
      appearanceTraits.push(physicalTraits[i].description);
    }
    if (chanceOfRealmTrait > 80) {
      let realmTrait = RND.item(deity.realm.appearanceTraits);
      if (realmTrait === void 0) {
        console.log(JSON.stringify(deity.realm));
        throw new Error("realm appearance trait is undefined");
      }
      appearanceTraits.push(realmTrait.phrase);
    }
    deity.personalityTraits = characterDetails.personalityTraits;
    deity.personality = describePersonality(deity);
    deity.appearance = Words.arrayToPhrase(appearanceTraits);
    deity.description = deity.describe();
    return deity;
  }
}
function describePersonality(deity) {
  let traits = [];
  for (let i = 0; i < deity.personalityTraits.length; i++) {
    traits.push(deity.personalityTraits[i].descriptor);
  }
  return Words.capitalize(deity.gender.pronouns.subjective) + " is " + Words.arrayToPhrase(traits);
}
class DeityGeneratorConfig {
  domainSet;
  realms;
  characterGeneratorConfig;
  femaleNameGenerator;
  maleNameGenerator;
  constructor() {
    let charGenConfig = getFantasy();
    this.realms = [];
    this.domainSet = new DomainSet();
    this.characterGeneratorConfig = charGenConfig;
    let genSet = new MUN.HumanSet();
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
class DomainGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let domainSet = new DomainSet();
    this.config.domains = RND.shuffle(this.config.domains);
    if (this.config.domains.length < this.config.numberOfDomains) {
      throw new Error("Not enough domains in domain generator config for the requested number of domains.");
    }
    let primary = this.config.domains.pop();
    if (primary !== void 0) {
      domainSet.primary = primary;
    } else {
      throw new Error("No primary domain found.");
    }
    for (let i = 0; i < this.config.numberOfDomains; i++) {
      const d = this.config.domains.pop();
      if (d === void 0) {
        throw new Error("No secondary domain found.");
      }
      domainSet.secondaries.push(d);
    }
    return domainSet;
  }
}
class DomainGeneratorConfig {
  numberOfDomains;
  domains;
  constructor() {
    this.numberOfDomains = 1;
    this.domains = JSON.parse(JSON.stringify(allDomains));
  }
}
class Pantheon {
  name;
  description;
  members;
  leader;
  constructor() {
    this.name = "";
    this.description = "";
    this.members = [];
    this.leader = -1;
  }
}
class PantheonMember {
  deity;
  relationships;
  constructor() {
    this.deity = new Deity();
    this.relationships = [];
  }
}
class PantheonGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let pantheon = new Pantheon();
    let deityGenConfig = new DeityGeneratorConfig();
    deityGenConfig.characterGeneratorConfig.speciesOptions = this.config.speciesOptions;
    deityGenConfig.realms = this.config.realms;
    deityGenConfig.femaleNameGenerator = this.config.femaleNameGenerator;
    deityGenConfig.maleNameGenerator = this.config.maleNameGenerator;
    const numberOfDeities = random.int(this.config.minDeities, this.config.maxDeities);
    const domainSets = randomDomainSets(numberOfDeities);
    for (let i = 0; i < domainSets.length; i++) {
      let member = new PantheonMember();
      deityGenConfig.domainSet = domainSets[i];
      let deityGen = new DeityGenerator(deityGenConfig);
      let deity = deityGen.generate();
      member.deity = deity;
      pantheon.members.push(member);
    }
    let relationshipGenerator = new RelationshipGenerator(0);
    let numberOfRelationships = random.int(1, 3);
    for (let j = 0; j < numberOfRelationships; j++) {
      for (let i = 0; i < pantheon.members.length; i++) {
        relationshipGenerator.strength = random.int(-2, 2);
        const target = random.int(0, pantheon.members.length - 1);
        if (target != i) {
          let alreadyExists = false;
          for (let k = 0; k < pantheon.members[i].relationships.length; k++) {
            if (pantheon.members[i].relationships[k].target == target) {
              alreadyExists = true;
            }
          }
          if (!alreadyExists) {
            let outward = relationshipGenerator.generate();
            outward.target = target;
            pantheon.members[i].relationships.push(outward);
            let inward = relationshipGenerator.generate();
            inward.target = i;
            pantheon.members[target].relationships.push(inward);
          }
        }
      }
    }
    if (pantheon.members.length > 1) {
      for (let i = 0; i < pantheon.members.length; i++) {
        let relationships = [];
        for (let x = 0; x < pantheon.members[i].relationships.length; x++) {
          relationships.push(
            getRelationshipPhrase(
              pantheon.members[i].relationships[x],
              pantheon.members[pantheon.members[i].relationships[x].target].deity.name
            )
          );
        }
        const relationshipDescription = " " + pantheon.members[i].deity.name + " " + Words.arrayToPhrase(relationships) + ".";
        pantheon.members[i].deity.description += relationshipDescription;
      }
    }
    return pantheon;
  }
}
function getRelationshipPhrase(relationship, targetName) {
  return RND.item([`${relationship.verb} ${targetName}`]);
}
function randomDomainSets(numberOfSets) {
  let domainGenConfig = new DomainGeneratorConfig();
  let domainGen = new DomainGenerator(domainGenConfig);
  let sets = [];
  let allDomains2 = RND.shuffle(JSON.parse(JSON.stringify(domainGenConfig.domains)));
  for (let i = 0; i < numberOfSets; i++) {
    let domains = [];
    for (let j = 0; j < domainGen.config.numberOfDomains + 1; j++) {
      domains.push(allDomains2.pop());
    }
    domainGen.config.domains = domains;
    let domainSet = domainGen.generate();
    sets.push(domainSet);
  }
  return sets;
}
class PantheonGeneratorConfig {
  domains;
  realms;
  minDeities;
  maxDeities;
  speciesOptions;
  femaleNameGenerator;
  maleNameGenerator;
  constructor() {
    this.domains = JSON.parse(JSON.stringify(allDomains));
    this.realms = [];
    this.speciesOptions = [human];
    this.minDeities = 1;
    this.maxDeities = 16;
    let genSet = new MUN.HumanSet();
    if (genSet.female == null) {
      throw new Error("no female name generator in set");
    } else if (genSet.male == null) {
      throw new Error("no male name generator in set");
    }
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
function byAnyTag(traits, tags) {
  const results = [];
  for (let i = 0; i < traits.length; i++) {
    for (let j = 0; j < tags.length; j++) {
      if (traits[i].tags.includes(tags[j])) {
        results.push(traits[i]);
      }
    }
  }
  return results;
}
const allTraits = [
  { phrase: "six feathered wings", bodyPart: "wings", tags: ["sky"] },
  { phrase: "four feathered wings", bodyPart: "wings", tags: ["sky"] },
  { phrase: "two large feathered wings", bodyPart: "wings", tags: ["sky", "dreamlike"] },
  { phrase: "large leathery wings", bodyPart: "wings", tags: ["sky", "death"] },
  { phrase: "a lion's tail'", bodyPart: "tail", tags: ["earth", "forest"] },
  { phrase: "a whip-like tail", bodyPart: "tail", tags: ["earth", "death"] },
  { phrase: "two tails", bodyPart: "tail", tags: ["alien"] },
  { phrase: "the horns of a goat", bodyPart: "horns", tags: ["earth", "forest"] },
  { phrase: "the horns of a ram", bodyPart: "horns", tags: ["earth", "forest"] },
  { phrase: "the antlers of a stag", bodyPart: "horns", tags: ["forest"] },
  { phrase: "the antlers of a deer", bodyPart: "horns", tags: ["forest", "surreal"] },
  { phrase: "short, pointed horns", bodyPart: "horns", tags: ["earth", "death"] },
  { phrase: "tall, straight horns", bodyPart: "horns", tags: ["earth", "death"] },
  { phrase: "glowing blue eyes", bodyPart: "eyes", tags: ["water"] },
  { phrase: "glowing yellow eyes", bodyPart: "eyes", tags: ["sky", "water"] },
  { phrase: "glowing red eyes", bodyPart: "eyes", tags: ["earth", "death", "alien"] },
  { phrase: "glowing orange eyes", bodyPart: "eyes", tags: ["earth", "sky"] },
  { phrase: "glowing green eyes", bodyPart: "eyes", tags: ["earth", "forest"] },
  { phrase: "glowing purple eyes", bodyPart: "eyes", tags: ["death", "alien"] },
  { phrase: "eyes that burn with an inner fire", bodyPart: "eyes", tags: ["sky"] },
  { phrase: "four eyes", bodyPart: "eyes", tags: ["alien"] },
  { phrase: "six eyes", bodyPart: "eyes", tags: ["alien"] },
  { phrase: "eight eyes", bodyPart: "eyes", tags: ["alien"] },
  { phrase: "no eyes", bodyPart: "eyes", tags: ["death", "alien"] },
  { phrase: "reptilian eyes", bodyPart: "eyes", tags: ["forest", "earth"] },
  { phrase: "scales instead of skin", bodyPart: "skin", tags: ["earth", "forest"] },
  { phrase: "skin that glows faintly", bodyPart: "skin", tags: ["sky"] },
  { phrase: "skin made of living rock", bodyPart: "skin", tags: ["earth"] },
  { phrase: "blue skin", bodyPart: "skin", tags: ["water"] },
  { phrase: "green skin", bodyPart: "skin", tags: ["water"] },
  { phrase: "crystalline skin", bodyPart: "skin", tags: ["earth"] },
  { phrase: "translucent grey skin", bodyPart: "skin", tags: ["death"] },
  { phrase: "dull grey skin", bodyPart: "skin", tags: ["death"] },
  { phrase: "skin covered in leaves", bodyPart: "skin", tags: ["forest"] },
  { phrase: "skin made of star-lit blackness", bodyPart: "skin", tags: ["alien"] },
  { phrase: "iridescent skin", bodyPart: "skin", tags: ["alien", "surreal"] },
  { phrase: "eight tentacles", bodyPart: "tentacles", tags: ["alien"] },
  { phrase: "six tentacles", bodyPart: "tentacles", tags: ["alien"] },
  { phrase: "four tentacles", bodyPart: "tentacles", tags: ["alien"] },
  { phrase: "the head of a lion", bodyPart: "head", tags: ["forest"] },
  { phrase: "the head of a bear", bodyPart: "head", tags: ["forest"] },
  { phrase: "the head of a dragon", bodyPart: "head", tags: ["earth", "forest"] },
  { phrase: "the head of a swan", bodyPart: "head", tags: ["sky", "water"] },
  { phrase: "the head of a deer", bodyPart: "head", tags: ["forest"] },
  { phrase: "the head of a cat", bodyPart: "head", tags: ["earth", "desert"] },
  { phrase: "the head of a wolf", bodyPart: "head", tags: ["earth", "forest"] },
  { phrase: "twelve feathered wings", bodyPart: "wings", tags: ["sky", "dreamlike"] },
  { phrase: "bat-like wings", bodyPart: "wings", tags: ["night", "moon"] },
  { phrase: "insect-like wings", bodyPart: "wings", tags: ["earth", "forest"] },
  { phrase: "crystal-clear wings", bodyPart: "wings", tags: ["sky", "surreal"] },
  { phrase: "feathered wings that shimmer", bodyPart: "wings", tags: ["sky", "water"] },
  { phrase: "a serpent's tail", bodyPart: "tail", tags: ["earth", "water"] },
  { phrase: "a tail with a bioluminescent tip", bodyPart: "tail", tags: ["water", "surreal"] },
  { phrase: "three tails", bodyPart: "tail", tags: ["surreal"] },
  { phrase: "twisted horns with glowing runes", bodyPart: "horns", tags: ["magic", "surreal"] },
  { phrase: "curved horns with gemstone inlays", bodyPart: "horns", tags: ["earth", "wealth"] },
  { phrase: "feathery antlers with ethereal wisps", bodyPart: "horns", tags: ["forest", "dreamlike"] },
  { phrase: "horns that emit a haunting melody", bodyPart: "horns", tags: ["earth", "music"] },
  { phrase: "pearlescent eyes that change colors", bodyPart: "eyes", tags: ["sky", "water"] },
  { phrase: "eyes with galaxies swirling within", bodyPart: "eyes", tags: ["sky", "cosmic"] },
  { phrase: "eyes that see into other dimensions", bodyPart: "eyes", tags: ["surreal", "alien"] },
  { phrase: "eyes with a mesmerizing hypnotic gaze", bodyPart: "eyes", tags: ["magic", "surreal"] },
  { phrase: "eyes that mirror the emotions of others", bodyPart: "eyes", tags: ["empathy", "surreal"] },
  { phrase: "eyes that emit sparks of lightning", bodyPart: "eyes", tags: ["storm", "electricity"] },
  { phrase: "eyes on flexible stalks", bodyPart: "eyes", tags: ["alien", "surreal"] },
  { phrase: "molten lava-like skin", bodyPart: "skin", tags: ["volcano", "fire"] },
  { phrase: "shimmering opalescent skin", bodyPart: "skin", tags: ["sky", "water"] },
  { phrase: "butterfly wings with shifting patterns", bodyPart: "wings", tags: ["dream", "surreal"] },
  { phrase: "floating ethereal wings of light", bodyPart: "wings", tags: ["dream", "surreal"] },
  { phrase: "wings made of iridescent mist", bodyPart: "wings", tags: ["dream", "surreal"] },
  { phrase: "feathers that change color with emotions", bodyPart: "wings", tags: ["dream", "empathy"] },
  { phrase: "a tail of shimmering stardust", bodyPart: "tail", tags: ["dream", "cosmic"] },
  { phrase: "tail that trails rainbows as you move", bodyPart: "tail", tags: ["dream", "surreal"] },
  { phrase: "a tail with glowing constellations", bodyPart: "tail", tags: ["dream", "cosmic"] },
  { phrase: "horns that emit soft, soothing melodies", bodyPart: "horns", tags: ["dream", "music"] },
  { phrase: "horns adorned with floating gemstones", bodyPart: "horns", tags: ["dream", "surreal"] },
  { phrase: "horns that sparkle like starlight", bodyPart: "horns", tags: ["dream", "cosmic"] },
  { phrase: "eyes that reflect the landscapes of dreams", bodyPart: "eyes", tags: ["dream", "surreal"] },
  { phrase: "eyes with ever-changing patterns of light", bodyPart: "eyes", tags: ["dream", "surreal"] },
  { phrase: "eyes that shimmer like enchanted pools", bodyPart: "eyes", tags: ["dream", "water"] },
  { phrase: "skin that shifts like flowing watercolors", bodyPart: "skin", tags: ["dream", "surreal"] },
  { phrase: "skin that glows softly with inner thoughts", bodyPart: "skin", tags: ["dream", "empathy"] },
  { phrase: "skin covered in delicate, luminescent vines", bodyPart: "skin", tags: ["dream", "forest"] },
  { phrase: "skin that shimmers like a mirage", bodyPart: "skin", tags: ["dream", "desert"] },
  { phrase: "skin that resembles the surface of a nebula", bodyPart: "skin", tags: ["dream", "cosmic"] },
  { phrase: "skin that changes texture with emotions", bodyPart: "skin", tags: ["dream", "empathy"] },
  { phrase: "a head crowned with floating ethereal flames", bodyPart: "head", tags: ["dream", "fire"] },
  { phrase: "a head with a halo of radiant energy", bodyPart: "head", tags: ["dream", "surreal"] },
  { phrase: "fiery wings with ember-like feathers", bodyPart: "wings", tags: ["fire", "heat"] },
  { phrase: "wings that resemble molten lava flows", bodyPart: "wings", tags: ["fire", "earth"] },
  { phrase: "smoldering wings that leave trails of sparks", bodyPart: "wings", tags: ["fire", "surreal"] },
  { phrase: "earthen wings with intricate rock formations", bodyPart: "wings", tags: ["earth", "mountain"] },
  { phrase: "wings made of intertwined vines and roots", bodyPart: "wings", tags: ["earth", "forest"] },
  { phrase: "crystalline wings that shimmer like gemstones", bodyPart: "wings", tags: ["earth", "jewel"] },
  { phrase: "a tail with a fiery, flickering tip", bodyPart: "tail", tags: ["fire", "surreal"] },
  { phrase: "tail adorned with rugged, earthy textures", bodyPart: "tail", tags: ["earth", "mountain"] },
  { phrase: "tail with geode-like patterns and colors", bodyPart: "tail", tags: ["earth", "jewel"] },
  { phrase: "horns that resemble twisting flames", bodyPart: "horns", tags: ["fire", "heat"] },
  { phrase: "horns made of sturdy, petrified wood", bodyPart: "horns", tags: ["earth", "forest"] },
  { phrase: "horns with patterns reminiscent of ancient runes", bodyPart: "horns", tags: ["earth", "magic"] },
  { phrase: "eyes that flicker like burning embers", bodyPart: "eyes", tags: ["fire", "heat"] },
  { phrase: "eyes with deep, earthy hues like rich soil", bodyPart: "eyes", tags: ["earth", "nature"] },
  { phrase: "eyes that reflect the molten core of the earth", bodyPart: "eyes", tags: ["earth", "cosmic"] },
  { phrase: "skin that glows with inner fire", bodyPart: "skin", tags: ["fire", "surreal"] },
  { phrase: "skin with a texture resembling cracked earth", bodyPart: "skin", tags: ["earth", "desert"] },
  { phrase: "skin covered in intricate, glowing tribal patterns", bodyPart: "skin", tags: ["earth", "magic"] },
  { phrase: "a head crowned with blazing, fiery tendrils", bodyPart: "head", tags: ["fire", "surreal"] },
  { phrase: "a head with rugged, stone-like features", bodyPart: "head", tags: ["earth", "mountain"] },
  { phrase: "a head adorned with gemstone-encrusted horns", bodyPart: "head", tags: ["earth", "jewel"] }
];
function byRealmConcept(concept) {
  return byAnyTag(allTraits, concept.appearanceTags);
}
class RealmConcept {
  name;
  nameOptions;
  appearanceTags;
  personalityTags;
  descriptionOptions;
  constructor(name, nameOptions, appearanceTags, personalityTags, descriptionOptions) {
    this.name = name;
    this.nameOptions = nameOptions;
    this.appearanceTags = appearanceTags;
    this.personalityTags = personalityTags;
    this.descriptionOptions = descriptionOptions;
  }
}
const realmConcepts = [
  new RealmConcept(
    "sky",
    [
      "The Eternal Heavens",
      "The Heavens Above",
      "Heaven",
      "The Sky",
      "The Heavens",
      "The Celestial Realm",
      "The Empyrean",
      "The Firmament"
    ],
    ["sky", "clouds", "sun", "moon", "stars", "rainbows", "light"],
    ["mercurial", "caring", "wise", "flexible", "majestic", "powerful", "graceful", "serene"],
    [
      "Far above the mortal world, {name} is a realm of light and splendor.",
      "{name} is a realm of light and beauty, where celestial beings roam.",
      "The skies of {name} are awash with vibrant colors and shimmering stars."
    ]
  ),
  new RealmConcept(
    "earth",
    [
      "The Earth",
      "The Mortal Realm",
      "The Material Plane",
      "The Mundane World",
      "The Physical Plane",
      "The Human World"
    ],
    ["earth", "mountains", "rivers", "forests", "deserts", "oceans", "caves", "valleys"],
    ["stable", "stubborn", "physical", "grounded", "tenacious", "reliable", "practical"],
    [
      "{name} is where mortals reside, going about their daily lives.",
      "{name} is the home of all mortal beings, full of bustling cities and quiet countryside."
    ]
  ),
  new RealmConcept(
    "forest",
    [
      "The Forest",
      "The Eternal Forest",
      "The Divine Forest",
      "The Sylvan Realm",
      "The Verdant Wilds",
      "The Green Domain"
    ],
    ["forest", "trees", "plants", "animals", "rivers", "mountains"],
    ["caring", "stable", "peaceful", "graceful", "majestic", "wise", "mystical"],
    [
      "Hidden far from the mortal world, {name} is deep and mysterious, full of secrets and ancient magic.",
      "{name} is an infinite forest of beauty and mystery, where the spirits of the wild roam free.",
      "The forests of {name} are alive with the sound of birdsong and rustling leaves."
    ]
  ),
  new RealmConcept(
    "underworld",
    [
      "The Underworld",
      "The Afterlife",
      "The Kingdom of Death",
      "The Great Beyond",
      "The Netherworld",
      "The Land of the Dead"
    ],
    ["death", "shadow", "bones", "ghosts", "souls", "void"],
    ["angry", "brooding", "peaceful", "wise", "merciful", "judgmental", "powerful"],
    [
      "{name} is where souls go to rest after death, guided by the spirits of the departed.",
      "{name} is a realm of perpetual darkness where the dead rest forever, watched over by the reapers of the underworld.",
      "The halls of {name} are filled with the whispers of the dead, their spirits forever lingering in the shadows."
    ]
  ),
  new RealmConcept(
    "ocean",
    [
      "The Vast Sea",
      "The Sea",
      "The Endless Ocean",
      "The Divine Sea",
      "The Ever-Changing Tides",
      "The Fathomless Depths",
      "The Coral Kingdom",
      "The Ocean of Storms"
    ],
    ["water", "salt", "waves", "foam", "currents", "whirlpools", "tides", "depths"],
    ["mercurial", "aloof", "cruel", "flexible", "violent", "majestic", "mysterious"],
    [
      "{name} is a realm apart from mortal seas, full of life and infinitely deep.",
      "The deep and restless waters of {name} hide many secrets.",
      "Beneath the surface of {name} lies a kingdom of wonder and terror."
    ]
  ),
  new RealmConcept(
    "mountain",
    [
      "The Great Mountain",
      "The Mountain",
      "The Divine Mountain",
      "The Endless Peak",
      "The Celestial Summit",
      "The Sky-Splitting Colossus",
      "The Stone Sentinel",
      "The Cradle of the Gods"
    ],
    ["earth", "rock", "stone", "ice", "snow", "summit", "peak", "valley"],
    ["aloof", "wise", "physical", "stable", "majestic", "immovable", "mysterious"],
    [
      "{name} is far larger than any mountain of the mortal world.",
      "{name} is covered in lush forests and cascading waterfalls, a towering paradise.",
      "Beneath the peaks and valleys of {name} lies a realm of fire and darkness."
    ]
  ),
  new RealmConcept(
    "void",
    [
      "The Nameless Void",
      "The Endless Void",
      "The Void",
      "The Dark Beyond",
      "The Endless Dark",
      "The Abyss",
      "The Great Emptiness",
      "The Eternal Nothingness"
    ],
    ["alien", "darkness", "emptiness", "silence", "cold", "nothingness", "absence"],
    ["alien", "clever", "unknowable", "silent", "watchful", "impenetrable"],
    [
      "{name} is home to things unknowable and alien.",
      "There are mysteries in {name} that no mortal can hope to perceive, let alone understand.",
      "{name} is a realm of eternal darkness and emptiness, where the very fabric of reality is twisted and distorted."
    ]
  ),
  new RealmConcept(
    "dream",
    [
      "The Realm of Dreams",
      "The Dreamlands",
      "The Land of Nod",
      "The Ethereal Plane",
      "The Realm of Imagination",
      "The World of Sleep"
    ],
    ["ethereal", "fantastical", "dreamlike", "otherworldly", "surreal", "shimmering"],
    ["mysterious", "whimsical", "fickle", "curious", "enigmatic", "playful"],
    [
      "{name} is a place where the impossible becomes reality and where the line between dreams and waking life is blurred.",
      "The ethereal beauty of {name} is home to creatures born of pure imagination and fantasy.",
      "In {name}, the landscape constantly shifts and changes, shaped by the whims of the dreamers who call it home.",
      "The dreamscape of {name} is a realm of infinite possibilities, where anything can happen and nothing is truly impossible.",
      "{name} is a place where the innermost thoughts and desires of mortals manifest into reality, for better or for worse.",
      "Those who journey into {name} often find themselves caught in a never-ending cycle of dreams and nightmares."
    ]
  )
];
function newRealm(name, description, personalityTraits, appearanceTraits) {
  let realm = new Realm();
  realm.name = name;
  realm.description = description;
  realm.personalityTraits = personalityTraits;
  realm.appearanceTraits = appearanceTraits;
  return realm;
}
class RealmGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    const realms = [];
    const numberOfRealms = this.config.numberOfRealms;
    let allConcepts = JSON.parse(JSON.stringify(realmConcepts));
    allConcepts = RND.shuffle(allConcepts);
    for (let i = 0; i < numberOfRealms; i++) {
      const concept = allConcepts.pop();
      if (typeof concept == "object") {
        const realmName = RND.item(concept.nameOptions);
        const appearanceTraits = byRealmConcept(concept);
        if (appearanceTraits.length < 1) {
          throw new Error(`No appearance traits found for realm concept ${concept.name}.`);
        }
        let description = RND.item(concept.descriptionOptions).replace(
          "{name}",
          Words.uncapitalize(realmName)
        );
        description = Words.capitalize(description);
        const realm = newRealm(realmName, description, [], appearanceTraits);
        realms.push(realm);
      }
    }
    return realms;
  }
}
class RealmGeneratorConfig {
  numberOfRealms;
  requireDualistic;
  constructor() {
    this.numberOfRealms = 2;
    this.requireDualistic = false;
  }
}
class Religion {
  name;
  description;
  realms;
  pantheon;
  constructor(name) {
    this.name = name;
    this.description = "";
    this.realms = [];
    this.pantheon = null;
  }
}
class ReligionGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let realmGenConfig = new RealmGeneratorConfig();
    let realmGen = new RealmGenerator(realmGenConfig);
    const realms = realmGen.generate();
    const category = RND.item(this.config.categories);
    const religion = new Religion(this.config.nameGenerator.generate(1)[0]);
    religion.realms = realms;
    if (category.hasDeities) {
      let pantheonGenConfig = new PantheonGeneratorConfig();
      pantheonGenConfig.realms = realms;
      pantheonGenConfig.speciesOptions = this.config.deitySpeciesOptions;
      pantheonGenConfig.minDeities = category.minDeities;
      pantheonGenConfig.maxDeities = category.maxDeities;
      pantheonGenConfig.femaleNameGenerator = this.config.femaleNameGenerator;
      pantheonGenConfig.maleNameGenerator = this.config.maleNameGenerator;
      let pantheonGen = new PantheonGenerator(pantheonGenConfig);
      let pantheon = pantheonGen.generate();
      pantheon.description = category.description;
      religion.pantheon = pantheon;
      if (category.hasLeader) {
        religion.pantheon.leader = random.int(0, religion.pantheon.members.length - 1);
        let leaderTitle = "Queen of the Gods";
        if (religion.pantheon.members[religion.pantheon.leader].deity.gender.name === "male") {
          leaderTitle = "King of the Gods";
        }
        religion.pantheon.members[religion.pantheon.leader].deity.titles.push(leaderTitle);
        religion.pantheon.description += ` ${religion.pantheon.members[religion.pantheon.leader].deity.name} is the ${leaderTitle}.`;
      }
    }
    if (religion.pantheon !== null) {
      religion.description = religion.pantheon.description + " " + randomGatheringTimes() + " " + Words.capitalize(randomGatheringPlace()) + ".";
    } else {
      religion.description = category.description + " " + randomGatheringTimes() + " " + Words.capitalize(randomGatheringPlace()) + ".";
    }
    return religion;
  }
}
function randomGatheringPlace() {
  let description = RND.item([
    "{follower} gather in {place} for {service}",
    "{follower} congregate in {place} to be led in {service} by {leader}",
    "{follower} meet in {place} to engage in {service} and hear from {leader}",
    "At {place}, {follower} come together for {service} led by {leader}",
    "Join {follower} at {place} for {service} and fellowship with {leader}",
    "{follower} assemble in {place} to participate in {service} and share with {leader}",
    "{follower} unite at {place} for {service} and to learn from {leader}",
    "At {place}, {follower} come together to seek guidance and wisdom from {leader} through {service}"
  ]);
  const follower = RND.item([
    "adherents",
    "believers",
    "disciples",
    "devotees",
    "faithful",
    "followers",
    "pilgrims",
    "worshippers",
    "zealots"
  ]);
  const place = RND.item([
    "temples",
    "churches",
    "mosques",
    "synagogues",
    "chapels",
    "shrines",
    "sanctuaries",
    "meeting halls",
    "community centers",
    "outdoor arenas"
  ]);
  const service = RND.item([
    "silent meditation",
    "guided meditation",
    "chanting",
    "prayer",
    "sacrament",
    "communion",
    "worship",
    "ritual dance",
    "ritual music",
    "structured recitation",
    "spontaneous sharing",
    "teachings and discussions",
    "ritual sacrifice"
  ]);
  const leader = RND.item([
    "priest",
    "priestess",
    "minister",
    "shaman",
    "spiritual guide",
    "community leader",
    "wise elder",
    "prophet",
    "guru",
    "ascended master",
    "enlightened one",
    "mystic",
    "oracle"
  ]);
  description = description.replace("{follower}", follower).replace("{place}", place).replace("{service}", service).replace("{leader}", Words.article(leader) + " " + leader);
  return description;
}
function randomGatheringTimes() {
  let description = RND.item([
    "Regular gatherings happen once a week.",
    "Regular gatherings happen daily.",
    "Regular gatherings happen once a month.",
    "Weekly gatherings take place every {weekday}.",
    "They come together every {weekday} for a time of {service}.",
    "Their community meets {frequency} for {service} at {time}.",
    "Their gatherings occur {frequency}, bringing {follower} together for {service}.",
    "They gather {frequency} at {place} for {service} and {activity}.",
    "Every {weekday} they gather for {service}, followed by {activity}.",
    "Their gatherings happen {frequency} at {place} and feature {service}, {activity}, and food/drink.",
    "People are invited to the {occasion} gathering, where they partake in {service} and {activity}."
  ]);
  description = description.replace(
    "{weekday}",
    RND.item(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
  ).replace("{frequency}", RND.item(["weekly", "bi-weekly", "monthly", "quarterly", "annually"])).replace(
    "{follower}",
    RND.item(["worshipers", "devotees", "believers", "faithful", "followers", "pilgrims"])
  ).replace(
    "{service}",
    RND.item(["prayer", "worship", "meditation", "reflection", "ritual", "sermon", "teaching"])
  ).replace("{time}", RND.item(["sunrise", "midday", "sunset", "evening", "night"])).replace(
    "{place}",
    RND.item([
      "the temple",
      "the church",
      "the mosque",
      "the synagogue",
      "the chapel",
      "the shrine",
      "the sanctuary",
      "the meeting hall"
    ])
  ).replace(
    "{activity}",
    RND.item([
      "fellowship",
      "conversation",
      "sharing",
      "food and drink",
      "community service",
      "study"
    ])
  ).replace("{occasion}", RND.item(["special", "holiday", "festive", "solemn"]));
  return description;
}
class ReligionCategory {
  name;
  description;
  hasDeities;
  hasLeader;
  minDeities;
  maxDeities;
  constructor() {
    this.name = "";
    this.description = "";
    this.hasDeities = false;
    this.hasLeader = false;
    this.minDeities = 0;
    this.maxDeities = 0;
  }
}
class Monotheism extends ReligionCategory {
  constructor() {
    super();
    this.name = "monotheism";
    this.description = "This religion " + RND.item(["has a single all-powerful god", "is monotheistic"]) + ".";
    this.hasDeities = true;
    this.minDeities = 1;
    this.maxDeities = 1;
  }
}
class Polytheism extends ReligionCategory {
  constructor() {
    super();
    this.name = "polytheism";
    this.description = "This religion " + RND.item(["has several gods", "is polytheistic"]) + ".";
    this.hasDeities = true;
    this.hasLeader = true;
    this.minDeities = 2;
    this.maxDeities = 16;
  }
}
class Shamanism extends ReligionCategory {
  constructor() {
    super();
    this.name = "shamanism";
    this.description = "This religion is shamanistic.";
  }
}
function all() {
  return [new Monotheism(), new Polytheism(), new Shamanism()];
}
class ReligionGeneratorConfig {
  categories;
  deitySpeciesOptions;
  nameGenerator;
  femaleNameGenerator;
  maleNameGenerator;
  constructor() {
    this.categories = all();
    this.deitySpeciesOptions = [human];
    let genSet = new MUN.HumanSet();
    if (genSet.family === null) {
      throw new Error("No family name generator found.");
    } else if (genSet.female === null) {
      throw new Error("No female name generator found");
    } else if (genSet.male === null) {
      throw new Error("No male name generator found");
    }
    this.nameGenerator = genSet.family;
    this.femaleNameGenerator = genSet.female;
    this.maleNameGenerator = genSet.male;
  }
}
export {
  ReligionGeneratorConfig as R,
  ReligionGenerator as a,
  all as b
};
//# sourceMappingURL=generatorconfig.js.map
