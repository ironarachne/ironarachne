import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import random from 'random';
import './sentry-release-injection-file-f1f7df64.js';
import { A as AgeCategory } from './agecategories-adca03a1.js';
import { H as Human, C as CharacterGenerator } from './generatorconfig2-b6d4f58f.js';
import { a as allDomains, D as Domain } from './domains-26710214.js';
import { g as getFantasy } from './premadeconfigs-f1420d43.js';
import * as MUN from '@ironarachne/made-up-names';

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
class Gender {
  name;
  subjectivePronoun;
  objectivePronoun;
  possessivePronoun;
  maxAge;
  ageCategories;
  constructor() {
    this.name = "";
    this.subjectivePronoun = "";
    this.objectivePronoun = "";
    this.possessivePronoun = "";
    this.maxAge = -1;
    this.ageCategories = [];
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
    this.species = new Human();
    this.gender = new Gender();
    this.ageCategory = new AgeCategory();
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
    const subjectivePronoun = this.gender.subjectivePronoun;
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
    const characterDetails = this.config.characterGenerator.generate();
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
  return Words.capitalize(deity.gender.subjectivePronoun) + " is " + Words.arrayToPhrase(traits);
}
class DeityGeneratorConfig {
  domainSet;
  realms;
  characterGenerator;
  femaleNameGenerator;
  maleNameGenerator;
  constructor() {
    let charGenConfig = getFantasy();
    this.realms = [];
    this.domainSet = new DomainSet();
    this.characterGenerator = new CharacterGenerator(charGenConfig);
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
    deityGenConfig.characterGenerator.config.speciesOptions = this.config.speciesOptions;
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
    this.speciesOptions = [new Human()];
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
class AppearanceTrait {
  phrase;
  bodyPart;
  tags;
  constructor() {
    this.phrase = "";
    this.bodyPart = "";
    this.tags = [];
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
function newTrait(phrase, bodyPart, tags) {
  let trait = new AppearanceTrait();
  trait.phrase = phrase;
  trait.bodyPart = bodyPart;
  trait.tags = tags;
  return trait;
}
const allTraits = [
  newTrait("six feathered wings", "wings", ["sky"]),
  newTrait("four feathered wings", "wings", ["sky"]),
  newTrait("two large feathered wings", "wings", ["sky", "dreamlike"]),
  newTrait("large leathery wings", "wings", ["sky", "death"]),
  newTrait("a lion's tail'", "tail", ["earth", "forest"]),
  newTrait("a whip-like tail", "tail", ["earth", "death"]),
  newTrait("two tails", "tail", ["alien"]),
  newTrait("the horns of a goat", "horns", ["earth", "forest"]),
  newTrait("the horns of a ram", "horns", ["earth", "forest"]),
  newTrait("the antlers of a stag", "horns", ["forest"]),
  newTrait("the antlers of a deer", "horns", ["forest", "surreal"]),
  newTrait("short, pointed horns", "horns", ["earth", "death"]),
  newTrait("tall, straight horns", "horns", ["earth", "death"]),
  newTrait("glowing blue eyes", "eyes", ["water"]),
  newTrait("glowing yellow eyes", "eyes", ["sky", "water"]),
  newTrait("glowing red eyes", "eyes", ["earth", "death", "alien"]),
  newTrait("glowing orange eyes", "eyes", ["earth", "sky"]),
  newTrait("glowing green eyes", "eyes", ["earth", "forest"]),
  newTrait("glowing purple eyes", "eyes", ["death", "alien"]),
  newTrait("eyes that burn with an inner fire", "eyes", ["sky"]),
  newTrait("four eyes", "eyes", ["alien"]),
  newTrait("six eyes", "eyes", ["alien"]),
  newTrait("eight eyes", "eyes", ["alien"]),
  newTrait("no eyes", "eyes", ["death", "alien"]),
  newTrait("reptilian eyes", "eyes", ["forest", "earth"]),
  newTrait("scales instead of skin", "skin", ["earth", "forest"]),
  newTrait("skin that glows faintly", "skin", ["sky"]),
  newTrait("skin made of living rock", "skin", ["earth"]),
  newTrait("blue skin", "skin", ["water"]),
  newTrait("green skin", "skin", ["water"]),
  newTrait("crystalline skin", "skin", ["earth"]),
  newTrait("translucent grey skin", "skin", ["death"]),
  newTrait("dull grey skin", "skin", ["death"]),
  newTrait("skin covered in leaves", "skin", ["forest"]),
  newTrait("skin made of star-lit blackness", "skin", ["alien"]),
  newTrait("iridescent skin", "skin", ["alien", "surreal"]),
  newTrait("eight tentacles", "tentacles", ["alien"]),
  newTrait("six tentacles", "tentacles", ["alien"]),
  newTrait("four tentacles", "tentacles", ["alien"]),
  newTrait("the head of a lion", "head", ["forest"]),
  newTrait("the head of a bear", "head", ["forest"]),
  newTrait("the head of a dragon", "head", ["earth", "forest"]),
  newTrait("the head of a swan", "head", ["sky", "water"]),
  newTrait("the head of a deer", "head", ["forest"]),
  newTrait("the head of a cat", "head", ["earth", "desert"]),
  newTrait("the head of a wolf", "head", ["earth", "forest"]),
  newTrait("twelve feathered wings", "wings", ["sky", "dreamlike"]),
  newTrait("bat-like wings", "wings", ["night", "moon"]),
  newTrait("insect-like wings", "wings", ["earth", "forest"]),
  newTrait("crystal-clear wings", "wings", ["sky", "surreal"]),
  newTrait("feathered wings that shimmer", "wings", ["sky", "water"]),
  newTrait("a serpent's tail", "tail", ["earth", "water"]),
  newTrait("a tail with a bioluminescent tip", "tail", ["water", "surreal"]),
  newTrait("three tails", "tail", ["surreal"]),
  newTrait("twisted horns with glowing runes", "horns", ["magic", "surreal"]),
  newTrait("curved horns with gemstone inlays", "horns", ["earth", "wealth"]),
  newTrait("feathery antlers with ethereal wisps", "horns", ["forest", "dreamlike"]),
  newTrait("horns that emit a haunting melody", "horns", ["earth", "music"]),
  newTrait("pearlescent eyes that change colors", "eyes", ["sky", "water"]),
  newTrait("eyes with galaxies swirling within", "eyes", ["sky", "cosmic"]),
  newTrait("eyes that see into other dimensions", "eyes", ["surreal", "alien"]),
  newTrait("eyes with a mesmerizing hypnotic gaze", "eyes", ["magic", "surreal"]),
  newTrait("eyes that mirror the emotions of others", "eyes", ["empathy", "surreal"]),
  newTrait("eyes that emit sparks of lightning", "eyes", ["storm", "electricity"]),
  newTrait("eyes on flexible stalks", "eyes", ["alien", "surreal"]),
  newTrait("molten lava-like skin", "skin", ["volcano", "fire"]),
  newTrait("shimmering opalescent skin", "skin", ["sky", "water"]),
  newTrait("butterfly wings with shifting patterns", "wings", ["dream", "surreal"]),
  newTrait("floating ethereal wings of light", "wings", ["dream", "surreal"]),
  newTrait("wings made of iridescent mist", "wings", ["dream", "surreal"]),
  newTrait("feathers that change color with emotions", "wings", ["dream", "empathy"]),
  newTrait("a tail of shimmering stardust", "tail", ["dream", "cosmic"]),
  newTrait("tail that trails rainbows as you move", "tail", ["dream", "surreal"]),
  newTrait("a tail with glowing constellations", "tail", ["dream", "cosmic"]),
  newTrait("horns that emit soft, soothing melodies", "horns", ["dream", "music"]),
  newTrait("horns adorned with floating gemstones", "horns", ["dream", "surreal"]),
  newTrait("horns that sparkle like starlight", "horns", ["dream", "cosmic"]),
  newTrait("eyes that reflect the landscapes of dreams", "eyes", ["dream", "surreal"]),
  newTrait("eyes with ever-changing patterns of light", "eyes", ["dream", "surreal"]),
  newTrait("eyes that shimmer like enchanted pools", "eyes", ["dream", "water"]),
  newTrait("skin that shifts like flowing watercolors", "skin", ["dream", "surreal"]),
  newTrait("skin that glows softly with inner thoughts", "skin", ["dream", "empathy"]),
  newTrait("skin covered in delicate, luminescent vines", "skin", ["dream", "forest"]),
  newTrait("skin that shimmers like a mirage", "skin", ["dream", "desert"]),
  newTrait("skin that resembles the surface of a nebula", "skin", ["dream", "cosmic"]),
  newTrait("skin that changes texture with emotions", "skin", ["dream", "empathy"]),
  newTrait("a head crowned with floating ethereal flames", "head", ["dream", "fire"]),
  newTrait("a head with a halo of radiant energy", "head", ["dream", "surreal"]),
  newTrait("fiery wings with ember-like feathers", "wings", ["fire", "heat"]),
  newTrait("wings that resemble molten lava flows", "wings", ["fire", "earth"]),
  newTrait("smoldering wings that leave trails of sparks", "wings", ["fire", "surreal"]),
  newTrait("earthen wings with intricate rock formations", "wings", ["earth", "mountain"]),
  newTrait("wings made of intertwined vines and roots", "wings", ["earth", "forest"]),
  newTrait("crystalline wings that shimmer like gemstones", "wings", ["earth", "jewel"]),
  newTrait("a tail with a fiery, flickering tip", "tail", ["fire", "surreal"]),
  newTrait("tail adorned with rugged, earthy textures", "tail", ["earth", "mountain"]),
  newTrait("tail with geode-like patterns and colors", "tail", ["earth", "jewel"]),
  newTrait("horns that resemble twisting flames", "horns", ["fire", "heat"]),
  newTrait("horns made of sturdy, petrified wood", "horns", ["earth", "forest"]),
  newTrait("horns with patterns reminiscent of ancient runes", "horns", ["earth", "magic"]),
  newTrait("eyes that flicker like burning embers", "eyes", ["fire", "heat"]),
  newTrait("eyes with deep, earthy hues like rich soil", "eyes", ["earth", "nature"]),
  newTrait("eyes that reflect the molten core of the earth", "eyes", ["earth", "cosmic"]),
  newTrait("skin that glows with inner fire", "skin", ["fire", "surreal"]),
  newTrait("skin with a texture resembling cracked earth", "skin", ["earth", "desert"]),
  newTrait("skin covered in intricate, glowing tribal patterns", "skin", ["earth", "magic"]),
  newTrait("a head crowned with blazing, fiery tendrils", "head", ["fire", "surreal"]),
  newTrait("a head with rugged, stone-like features", "head", ["earth", "mountain"]),
  newTrait("a head adorned with gemstone-encrusted horns", "head", ["earth", "jewel"])
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
    this.deitySpeciesOptions = [new Human()];
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

export { ReligionGeneratorConfig as R, ReligionGenerator as a, all as b };
//# sourceMappingURL=generatorconfig-e0bc8e94.js.map
