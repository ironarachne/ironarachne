import { c as create_ssr_component, g as getContext, a as add_attribute, f as each, e as escape } from "../../../chunks/ssr.js";
import * as RND from "@ironarachne/rng";
import * as MUN from "@ironarachne/made-up-names";
import "../../../chunks/sentry-release-injection-file.js";
import random$1 from "random";
import { r as random, d as describe, B as BiomeGenerator, a as BiomeGeneratorConfig } from "../../../chunks/climates.js";
import { T as Title, g as generate } from "../../../chunks/fantasy.js";
import { C as CharacterGenerator } from "../../../chunks/generatorconfig2.js";
import { g as getFantasy } from "../../../chunks/premadeconfigs.js";
import { H as HeraldryGenerator, a as HeraldrySVGRenderer } from "../../../chunks/svg.js";
import * as Words from "@ironarachne/words";
import { r as roll } from "../../../chunks/dice.js";
import seedrandom from "seedrandom";
class RegionGeneratorConfig {
  nameGeneratorSet;
  dominantCulture;
  mapWidth;
  mapHeight;
  minRealms;
  maxRealms;
  constructor() {
    this.nameGeneratorSet = new MUN.FantasySet();
    this.dominantCulture = null;
    this.mapWidth = 40;
    this.mapHeight = 30;
    this.minRealms = 2;
    this.maxRealms = 4;
  }
}
class Environment {
  biome;
  climate;
  description;
  constructor(biome, climate) {
    this.biome = biome;
    this.climate = climate;
  }
}
class EnvironmentGenerator {
  generate() {
    let climate = random();
    climate.description = describe(climate);
    const biomeGeneratorConfig = new BiomeGeneratorConfig(climate);
    const biomeGen = new BiomeGenerator(biomeGeneratorConfig);
    const biome = biomeGen.generate();
    let environment = new Environment(biome, climate);
    environment.description = `${RND.item(biome.descriptions)} ${RND.item(biome.features)}`;
    environment.description += " " + environment.climate.description;
    return environment;
  }
}
class RealmType {
  name;
  minTiles;
  maxTiles;
  grantedTitle;
  commonality;
  isStandalone;
  parentType;
  constructor(name, minTiles, maxTiles, grantedTitle, commonality, isStandalone, parentType) {
    this.name = name;
    this.minTiles = minTiles;
    this.maxTiles = maxTiles;
    this.grantedTitle = grantedTitle;
    this.commonality = commonality;
    this.isStandalone = isStandalone;
    this.parentType = parentType;
  }
}
class Realm {
  name;
  adjective;
  description;
  heraldry;
  // TODO: use an abstract representation of imagery, so we can optionally do mon or flags instead of heraldry
  authority;
  grantedTitle;
  tiles;
  claims;
  parent;
  // array index of the parent realm
  realmType;
  constructor() {
    this.name = "";
    this.adjective = "";
    this.description = "";
    this.tiles = [];
    this.claims = [];
    this.parent = -1;
  }
}
class RealmGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let realm = new Realm();
    realm.realmType = RND.weighted(this.config.realmTypes);
    if (this.config.nameGeneratorSet.country === null) {
      throw new Error("RealmGenerator requires a country name generator set.");
    }
    let name = this.config.nameGeneratorSet.country.generate(1)[0];
    realm.name = `the ${Words.title(realm.realmType.name)} of ${name}`;
    let herGen = new HeraldryGenerator();
    realm.heraldry = herGen.generate();
    realm.authority = randomAuthority(realm.realmType, this.config.nameGeneratorSet);
    return realm;
  }
}
function randomAuthority(realmType, nameGeneratorSet) {
  let charGenConfig = getFantasy();
  charGenConfig.ageCategories = ["adult"];
  if (nameGeneratorSet.family === null) {
    throw new Error("RealmGenerator requires a family name generator set.");
  }
  if (nameGeneratorSet.female === null) {
    throw new Error("RealmGenerator requires a female name generator set.");
  }
  if (nameGeneratorSet.male === null) {
    throw new Error("RealmGenerator requires a male name generator set.");
  }
  charGenConfig.familyNameGenerator = nameGeneratorSet.family;
  charGenConfig.femaleNameGenerator = nameGeneratorSet.female;
  charGenConfig.maleNameGenerator = nameGeneratorSet.male;
  charGenConfig.useAdaptiveNames = false;
  const charGen = new CharacterGenerator(charGenConfig);
  let authority = charGen.generate();
  authority.titles.push(realmType.grantedTitle);
  let herGen = new HeraldryGenerator();
  authority.heraldry = herGen.generate();
  return authority;
}
function all$1() {
  let kingdom = new RealmType(
    "kingdom",
    10,
    50,
    new Title("Queen", "King", "Queen", "King", true, "Kingdom of", 7),
    5,
    true,
    null
  );
  let empire = new RealmType(
    "empire",
    50,
    100,
    new Title("Empress", "Emperor", "Empress", "Emperor", true, "Empire of", 8),
    5,
    true,
    null
  );
  return [
    new RealmType(
      "earldom",
      2,
      4,
      new Title("Earl", "Earl", "Lady", "Lord", true, "Earldom of", 2),
      5,
      false,
      kingdom
    ),
    new RealmType(
      "county",
      4,
      6,
      new Title("Countess", "Count", "Countess", "Count", true, "County of", 3),
      20,
      false,
      kingdom
    ),
    new RealmType(
      "barony",
      6,
      8,
      new Title("Baroness", "Baron", "Baroness", "Baron", true, "Barony of", 4),
      10,
      false,
      kingdom
    ),
    new RealmType(
      "duchy",
      8,
      10,
      new Title("Duchess", "Duke", "Duchess", "Duke", true, "Duchy of", 5),
      5,
      false,
      kingdom
    ),
    new RealmType(
      "grand duchy",
      10,
      12,
      new Title(
        "Grand Duchess",
        "Grand Duke",
        "Grand Duchess",
        "Grand Duke",
        true,
        "Grand Duchy of",
        6
      ),
      2,
      false,
      kingdom
    ),
    new RealmType(
      "principality",
      12,
      14,
      new Title("Princess", "Prince", "Princess", "Prince", true, "Principality of", 7),
      2,
      false,
      kingdom
    ),
    new RealmType(
      "province",
      12,
      14,
      new Title("Governor", "Governor", "Governor", "Governor", true, "Province of", 7),
      1,
      false,
      empire
    ),
    kingdom,
    empire
  ];
}
class RealmGeneratorConfig {
  nameGeneratorSet;
  realmTypes;
  mapTiles;
  mapWidth;
  mapHeight;
  constructor() {
    this.nameGeneratorSet = new MUN.FantasySet();
    this.realmTypes = all$1();
    this.mapWidth = 40;
    this.mapHeight = 30;
    this.mapTiles = [];
  }
}
class SettlementCategory {
  name;
  minSize;
  maxSize;
  sizeClass;
  possibleDescriptions;
  constructor() {
    this.name = "";
    this.minSize = 0;
    this.maxSize = 0;
    this.sizeClass = "";
    this.possibleDescriptions = [];
  }
  randomDescription() {
    let description = RND.item(this.possibleDescriptions);
    return description;
  }
  randomPopulation() {
    return random$1.int(this.minSize, this.maxSize);
  }
}
class Borough extends SettlementCategory {
  constructor() {
    super();
    this.name = "borough";
    this.minSize = 1e4;
    this.maxSize = 19999;
    this.sizeClass = "medium";
    this.possibleDescriptions = [
      "The buildings here are tall and tightly packed together, with narrow streets winding between them.",
      "This borough is divided into several distinct districts, each with its own unique architecture and atmosphere.",
      "The center of this borough is dominated by a massive marketplace, surrounded by a ring of shops and residences.",
      "There are many factories and mills in this borough, with tall chimneys belching smoke into the air.",
      "The buildings here are mostly made of stone or brick, and are quite ornate and impressive.",
      "The streets of this borough are lined with small shops and stalls, selling all manner of goods.",
      "There are many parks and gardens scattered throughout this borough, offering a welcome respite from the hustle and bustle of city life.",
      "The buildings here are a mix of old and new, with modern high-rises standing next to ancient, crumbling ruins.",
      "This borough is known for its grand architecture, with many magnificent cathedrals and government buildings."
    ];
  }
}
class City extends SettlementCategory {
  constructor() {
    super();
    this.name = "city";
    this.minSize = 2e4;
    this.maxSize = 49999;
    this.sizeClass = "large";
    this.possibleDescriptions = [
      "This city is built around a grand castle, with towers that pierce the sky and walls that have withstood the test of time.",
      "The streets of this city are lined with buildings of every shape and size, from towering spires to humble cottages.",
      "This city is a marvel of engineering, with aqueducts, bridges, and tunnels that connect its various districts.",
      "The buildings in this city are a testament to the skill and artistry of its craftsmen, with intricate carvings and decorations adorning their facades.",
      "This city is surrounded by a sturdy wall, with guard towers and gates that keep out unwanted visitors.",
      "The center of this city is dominated by a grand cathedral, with stained-glass windows and soaring arches that inspire awe in all who see them.",
      "The main square of this city is a bustling hub of activity, with market stalls and street performers vying for attention.",
      "The winding alleys of this city are lit by lanterns at night, creating a mysterious and romantic atmosphere.",
      "This city is a patchwork of different architectural styles, with each district showcasing its own unique character and flair."
    ];
  }
}
class Hamlet extends SettlementCategory {
  constructor() {
    super();
    this.name = "hamlet";
    this.minSize = 10;
    this.maxSize = 49;
    this.sizeClass = "small";
    this.possibleDescriptions = [
      "Buildings here are scattered and small, with thatched roofs and walls of rough-hewn timber.",
      "The farms here are clustered together, their fields carefully tended and surrounded by low stone walls.",
      "There are only a handful of farms scattered around a single community building here, which serves as the center of local life.",
      "The hamlet is surrounded by wilderness, with a few clearings where buildings and fields have been established.",
      "The buildings in the hamlet are simple but sturdy, with chimneys belching smoke into the crisp morning air.",
      "This hamlet is situated on a hilltop, with commanding views of the surrounding countryside.",
      "The hamlet consists of a small cluster of houses and barns, with a narrow dirt road leading off into the distance.",
      "There is a small stream running through the hamlet, providing water for the villagers and their crops."
    ];
  }
}
class Metropolis extends SettlementCategory {
  constructor() {
    super();
    this.name = "metropolis";
    this.minSize = 5e4;
    this.maxSize = 3e6;
    this.sizeClass = "large";
    this.possibleDescriptions = [
      "This grand metropolis is a center of culture and learning, with renowned universities and libraries that draw scholars from across the land.",
      "The winding streets of this ancient metropolis are lined with taverns, inns, and shops selling all manner of exotic goods.",
      "Despite its immense size, this metropolis is a tightly-knit community where everyone knows their neighbors and traditions are deeply rooted.",
      "This sprawling metropolis is surrounded by towering walls and fortified gates, protecting it from invaders and marauders.",
      "The grand castle at the heart of this metropolis is the seat of the ruling monarch, and its knights are famed for their valor and chivalry.",
      "This metropolis is a hub of trade and commerce, with bustling markets and guilds that wield immense power.",
      "The streets of this metropolis are lit by torches and lined with ancient stone buildings, some of which have stood for centuries.",
      "This metropolis is renowned for its skilled craftsmen, who produce exquisite works of art and fine weaponry.",
      "The dark alleys and hidden courtyards of this metropolis are home to thieves, assassins, and other unsavory characters.",
      "Despite the challenges it faces, this metropolis is a beacon of hope and civilization in a world full of danger and chaos."
    ];
  }
}
class Town extends SettlementCategory {
  constructor() {
    super();
    this.name = "town";
    this.minSize = 500;
    this.maxSize = 9999;
    this.sizeClass = "medium";
    this.possibleDescriptions = [
      "There are multiple inns and taverns here, with brightly colored signs swinging in the breeze.",
      "The town is surrounded by fields and orchards, with the smell of ripe fruit and vegetables wafting through the air.",
      "There is a city hall, a town square, and a number of stores and shops, all housed in buildings of stone and wood.",
      "The town is located on the banks of a river, with a busy dock where barges unload their wares.",
      "The buildings in the town are tightly packed together, with narrow streets winding between them.",
      "The town is known for its skilled craftsmen, and their workshops and forges ring with the sound of hammers on metal.",
      "Many farms surround a dense core of community buildings here.",
      "The town is famous for its annual fair, where vendors from all over the kingdom come to sell their wares.",
      "The town is dominated by a tall clock tower, which chimes the hour with a melodious tune.",
      "Despite its size, the town is peaceful and orderly, with a watchful eye kept on outsiders who might cause trouble."
    ];
  }
}
class Village extends SettlementCategory {
  constructor() {
    super();
    this.name = "village";
    this.minSize = 50;
    this.maxSize = 499;
    this.sizeClass = "small";
    this.possibleDescriptions = [
      "There is a single inn, a blacksmith, and a few houses in town, with farms surrounding it. Smoke rises from the chimneys, and the sound of animals can be heard in the distance.",
      "This is a dense collection of farms with a number of communal buildings in the center, including a mill and a chapel. The farms are surrounded by low stone walls to protect them from marauding animals.",
      "A knot of communal buildings marks the center of this village, including a town hall and a small market. The farms radiate out in a rough circle around it, with a stream running through the center of the village.",
      "The village is nestled in a valley, surrounded by rolling hills covered in fields of wheat and barley. A small stream winds through the center of town, and the air is fragrant with the smell of fresh-baked bread.",
      "The village is built on the side of a hill, with narrow paths winding between the houses. The buildings are made of wood and thatch, and are tightly packed together for warmth and protection from the wind.",
      "The village is known for its skilled weavers, and the sound of looms can be heard from many of the houses. The weavers work with colorful threads, creating intricate patterns in their textiles.",
      "Despite its small size, the village has a strong sense of community, with neighbors looking out for one another and coming together for festivals and celebrations throughout the year."
    ];
  }
}
function all() {
  return [new Hamlet(), new Village(), new Town(), new Borough(), new City(), new Metropolis()];
}
function bySizeClass(sizeClass) {
  const options = all();
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].sizeClass == sizeClass) {
      result.push(options[i]);
    }
  }
  return result;
}
class SettlementGeneratorConfig {
  environment;
  nameGenerator;
  size;
  constructor() {
    let envGen = new EnvironmentGenerator();
    this.environment = envGen.generate();
    let genSet = new MUN.FantasySet();
    this.nameGenerator = genSet.town;
    this.size = "any";
  }
}
class Settlement {
  name;
  description;
  category;
  population;
  prosperity;
  environment;
  constructor(name, category, environment) {
    this.name = name;
    this.category = category;
    this.description = "";
    this.population = 0;
    this.prosperity = 0;
    this.environment = environment;
  }
}
class SettlementGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    const settlementName = this.config.nameGenerator !== null ? this.config.nameGenerator.generate(1)[0] : "Settlement";
    const settlementCategory = RND.item(bySizeClass(this.config.size));
    const settlement = new Settlement(settlementName, settlementCategory, this.config.environment);
    settlement.population = settlement.category.randomPopulation();
    settlement.prosperity = roll("2d6");
    settlement.description = randomDescription(settlement);
    return settlement;
  }
}
function randomDescription(settlement) {
  let description = RND.item([
    "{name} is a {category} of {population} people.",
    "The {category} of {name} has {population} people."
  ]);
  description = description.replace("{category}", settlement.category.name);
  description = description.replace(
    "{population}",
    new Intl.NumberFormat().format(settlement.population)
  );
  description = description.replace("{name}", settlement.name);
  description += " " + settlement.category.randomDescription();
  description += " " + randomProsperity(settlement.prosperity);
  description += " " + randomReputation();
  description += " " + RND.item(settlement.environment.biome.features);
  return description;
}
function randomProsperity(prosperity) {
  let prefixes = [
    "The people here",
    "Most people here",
    "Folks here",
    "Most folks here",
    "People here"
  ];
  let suffixes = [];
  if (prosperity < 4) {
    suffixes = [
      "have little more than what they need to survive",
      "struggle to make ends meet",
      "struggle to have enough to survive"
    ];
  } else if (prosperity < 8) {
    suffixes = [
      "have enough to meet their needs",
      "have just enough to meet their needs",
      "seem to be doing well",
      "have their needs met"
    ];
  } else {
    suffixes = ["have more wealth than most", "are prosperous", "have more than they need"];
  }
  let options = [];
  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      options.push(`${prefixes[i]} ${suffixes[j]}.`);
    }
  }
  return RND.item(options);
}
function randomReputation() {
  let prefixes = [
    "The people are known for",
    "The people are regarded as",
    "Folk here have a reputation for",
    "People here are regarded as",
    "The folk here are known for",
    "They are known for",
    "They are well known for",
    "They are sometimes known for",
    "Some other places regard the people here as",
    "Some places regard the people here as",
    "Some places regard them as",
    "Some regard them as",
    "Some folks regard them as"
  ];
  let suffixes = [
    "being aloof",
    "being suspicious of others",
    "being suspicious of outsiders",
    "being friendly and open",
    "being friendly but devious",
    "being friendly",
    "being greedy",
    "being altruistic",
    "being trusting",
    "being mistrustful",
    "being miserly",
    "being obsessed with status",
    "being hardworking",
    "being devious",
    "being unfriendly",
    "being trustworthy",
    "being lazy",
    "spending too much time making merry",
    "spending too much time slacking off",
    "working hard",
    "working too hard",
    "being unruly",
    "being belligerent"
  ];
  let reputations = [];
  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      reputations.push(`${prefixes[i]} ${suffixes[j]}.`);
    }
  }
  return RND.item(reputations);
}
class Region {
  name;
  environment;
  description;
  dominantCulture;
  settlements;
  mainRealm;
  realms;
  authority;
  organizations;
  settlementTiles;
  terrainTiles;
  constructor() {
    this.name = "";
    this.description = "";
    this.mainRealm = -1;
    this.realms = [];
    this.settlements = [];
    this.organizations = [];
  }
}
class RegionGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let region = new Region();
    const envGen = new EnvironmentGenerator();
    let nameGenSet;
    if (this.config.dominantCulture != null) {
      region.dominantCulture = this.config.dominantCulture;
      nameGenSet = region.dominantCulture.generatorSet;
    } else {
      nameGenSet = this.config.nameGeneratorSet;
    }
    region.environment = envGen.generate();
    region.settlements = randomSettlements(region.environment, nameGenSet);
    region.organizations = randomOrganizations();
    region.description = region.environment.description;
    let realmGenConfig = new RealmGeneratorConfig();
    realmGenConfig.nameGeneratorSet = nameGenSet;
    const realmGen = new RealmGenerator(realmGenConfig);
    let mainRealm = realmGen.generate();
    region.realms.push(mainRealm);
    region.mainRealm = 0;
    if (!mainRealm.realmType.isStandalone) {
      let parentRealmConfig = new RealmGeneratorConfig();
      parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;
      if (mainRealm.realmType.parentType == null) {
        throw new Error("Realm type has no parent type.");
      }
      parentRealmConfig.realmTypes = [mainRealm.realmType.parentType];
      let parentRealmGen = new RealmGenerator(parentRealmConfig);
      let parentRealm = parentRealmGen.generate();
      region.realms.push(parentRealm);
      mainRealm.parent = 1;
    }
    let numberOfNeighbors = random$1.int(this.config.minRealms, this.config.maxRealms);
    for (let i = 0; i < numberOfNeighbors; i++) {
      realmGen.config.nameGeneratorSet = new MUN.FantasySet();
      if (RND.simple(100) > 70) {
        let neighborNameGenSet = RND.item(MUN.cultureSets());
        realmGen.config.nameGeneratorSet = neighborNameGenSet;
      }
      let neighbor = realmGen.generate();
      if (!neighbor.realmType.isStandalone) {
        if (RND.simple(100) > 50) {
          neighbor.parent = mainRealm.parent;
        } else {
          let parentRealmConfig = new RealmGeneratorConfig();
          if (neighbor.realmType.parentType == null) {
            throw new Error("Realm type has no parent type.");
          }
          parentRealmConfig.realmTypes = [neighbor.realmType.parentType];
          parentRealmConfig.nameGeneratorSet = realmGen.config.nameGeneratorSet;
          let parentRealmGen = new RealmGenerator(parentRealmConfig);
          let parentRealm = parentRealmGen.generate();
          region.realms.push(parentRealm);
          neighbor.parent = region.realms.length - 1;
        }
      }
      region.realms.push(neighbor);
    }
    region.authority = mainRealm.authority;
    region.name = mainRealm.name;
    return region;
  }
}
function randomOrganizations() {
  const orgs = [];
  const numberOfOrganizations = random$1.int(1, 3);
  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(generate());
  }
  return orgs;
}
function randomSettlements(environment, nameGeneratorSet) {
  let settlementGenConfig = new SettlementGeneratorConfig();
  settlementGenConfig.nameGenerator = nameGeneratorSet.town;
  settlementGenConfig.size = "large";
  settlementGenConfig.environment = environment;
  let settlementGen = new SettlementGenerator(settlementGenConfig);
  const capital = settlementGen.generate();
  const numberOfMediumTowns = random$1.int(1, 3);
  const numberOfSmallTowns = random$1.int(3, 5);
  const towns = [];
  capital.description += " This is the capital of the region.";
  towns.push(capital);
  for (let i = 0; i < numberOfMediumTowns; i++) {
    settlementGen.config.size = "medium";
    const town = settlementGen.generate();
    towns.push(town);
  }
  for (let i = 0; i < numberOfSmallTowns; i++) {
    settlementGen.config.size = "small";
    const town = settlementGen.generate();
    towns.push(town);
  }
  return towns;
}
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h1.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h2.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h3.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h5.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,p.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,strong.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,label.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,article.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,section.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,section.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h2.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h3.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h5.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-size:2rem;line-height:2rem}h5.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-size:1.25rem;border-bottom:1px solid #333}p.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin:1rem 0}label.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-weight:700;margin-right:1rem}article.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin:1rem 0}input.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,select.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin-bottom:1rem}strong.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-weight:700}section.main.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{padding:0.5rem}#seed.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-family:monospace}.fantasy.svelte-8c1n7g button.svelte-8c1n7g.svelte-8c1n7g{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-8c1n7g button.svelte-8c1n7g.svelte-8c1n7g:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-8c1n7g button.svelte-8c1n7g.svelte-8c1n7g:disabled{background:#666;color:#777;border-color:#999}div.ruler.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{display:grid;column-gap:1rem;margin-bottom:1rem;grid-template-columns:210px auto}div.ruler-arms.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{align-self:start;width:200px;height:220px;margin:0 auto}div.neighbor.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{display:grid;column-gap:1rem;margin-bottom:0.5rem;grid-template-columns:80px auto}div.neighbor.svelte-8c1n7g>div.svelte-8c1n7g.svelte-8c1n7g{align-self:start}div.neighbor.svelte-8c1n7g>div.svelte-8c1n7g>p.svelte-8c1n7g{margin:0}div.neighbor-arms.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{justify-self:center;width:80px;height:88px;margin:0 auto}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const user = getContext("user");
  let useSavedCulture = false;
  let seed = RND.randomString(13);
  let nameSet = RND.item(MUN.cultureSets());
  let nameSets = MUN.cultureSets();
  random$1.use(seedrandom(seed));
  let config = new RegionGeneratorConfig();
  config.nameGeneratorSet = nameSet;
  let generator = new RegionGenerator(config);
  let heraldryRenderer = new HeraldrySVGRenderer();
  let region = generator.generate();
  let ruler = region.authority;
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1w8gppc_START -->${$$result.title = `<title>Region Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1w8gppc_END -->`, ""} <section class="fantasy main svelte-8c1n7g"><h1 class="svelte-8c1n7g" data-svelte-h="svelte-qth4ep">Region Generator</h1> <p class="svelte-8c1n7g" data-svelte-h="svelte-pq4136">Generate fantasy regions.</p> <div class="input-group svelte-8c1n7g"><label for="seed" class="svelte-8c1n7g" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-8c1n7g"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-8c1n7g"><label for="names" class="svelte-8c1n7g" data-svelte-h="svelte-1mjeby7">Name Set</label> <select name="names" id="nameSet" class="svelte-8c1n7g"><option value="any" data-svelte-h="svelte-1j2tppc">any</option>${each(nameSets, (nameSet2) => {
    return `<option${add_attribute("value", nameSet2.name, 0)}>${escape(nameSet2.name)}</option>`;
  })}</select></div> ${user.savedCultures !== void 0 && user.savedCultures.length > 0 ? `<div class="input-group svelte-8c1n7g"><label for="useSavedCulture" class="svelte-8c1n7g" data-svelte-h="svelte-14j9oxd">Use a saved culture for naming?</label> <input type="checkbox" name="useSavedCulture" id="useSavedCulture" class="svelte-8c1n7g"${add_attribute("checked", useSavedCulture, 1)}></div> <div class="input-group svelte-8c1n7g"><label for="savedCulture" class="svelte-8c1n7g" data-svelte-h="svelte-32ylm8">Select a saved culture to load</label> <select class="svelte-8c1n7g">${each(user.savedCultures, (saved) => {
    return `<option${add_attribute("value", saved.name, 0)}>${escape(saved.name)}</option>`;
  })}</select></div>` : ``} <button class="svelte-8c1n7g" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-8c1n7g" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-8c1n7g">${escape(Words.capitalize(region.name))}</h2> <p class="svelte-8c1n7g">${escape(region.description)}</p> ${region.dominantCulture != null ? `<p class="svelte-8c1n7g">The dominant culture here is the ${escape(region.dominantCulture.name)}.</p>` : ``} ${region.realms[region.mainRealm].parent != -1 ? `<div class="parent-realm svelte-8c1n7g"><p class="svelte-8c1n7g">${escape(Words.title(region.name))} is part of ${escape(region.realms[region.realms[region.mainRealm].parent].name)} <!-- HTML_TAG_START -->${heraldryRenderer.render(region.realms[region.realms[region.mainRealm].parent].heraldry.device, 20, 22)}<!-- HTML_TAG_END -->.</p></div>` : ``} <h3 class="svelte-8c1n7g">Ruler: ${escape(ruler.getHonorific())} ${escape(ruler.firstName)} ${escape(ruler.lastName)}</h3> <div class="ruler svelte-8c1n7g">${ruler.heraldry !== null ? `<div class="ruler-arms svelte-8c1n7g"><!-- HTML_TAG_START -->${heraldryRenderer.render(ruler.heraldry.device, 200, 220)}<!-- HTML_TAG_END --></div>` : ``} <div class="svelte-8c1n7g"><p class="svelte-8c1n7g">${escape(Words.capitalize(region.name))} is ruled by ${escape(ruler.getHonorific())} ${escape(ruler.firstName)} ${escape(ruler.lastName)}. ${escape(ruler.description)}</p></div></div> <h3 class="svelte-8c1n7g" data-svelte-h="svelte-1d5axrk">Nearby Sovereignties</h3> ${each(region.realms, (neighbor, index) => {
    return `${index != region.mainRealm && neighbor.parent == -1 ? `<div class="neighbor svelte-8c1n7g"><div class="neighbor-arms svelte-8c1n7g"><!-- HTML_TAG_START -->${heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}<!-- HTML_TAG_END --></div> <div class="svelte-8c1n7g"><p class="svelte-8c1n7g"><strong class="svelte-8c1n7g">${escape(Words.title(neighbor.name))}</strong></p> <p class="svelte-8c1n7g">Ruled by ${escape(neighbor.authority.getHonorific())} ${escape(neighbor.authority.name)}, ${escape(Words.article(neighbor.authority.species.adjective))} ${escape(neighbor.authority.species.adjective)} ${escape(neighbor.authority.ageCategory.noun)}.</p> ${region.realms[region.mainRealm].parent == index ? `<p class="svelte-8c1n7g">${escape(Words.title(region.realms[region.mainRealm].name))} is part of this.</p>` : ``}</div> </div>` : ``}`;
  })} <h3 class="svelte-8c1n7g" data-svelte-h="svelte-p9np5t">Nearby Realms</h3> ${each(region.realms, (neighbor, index) => {
    return `${index != region.mainRealm && index != region.realms[region.mainRealm].parent && neighbor.parent != -1 ? `<div class="neighbor svelte-8c1n7g"><div class="neighbor-arms svelte-8c1n7g"><!-- HTML_TAG_START -->${heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}<!-- HTML_TAG_END --></div> <div class="svelte-8c1n7g"><p class="svelte-8c1n7g"><strong class="svelte-8c1n7g">${escape(Words.title(neighbor.name))}</strong>, part of ${escape(region.realms[neighbor.parent].name)} <!-- HTML_TAG_START -->${heraldryRenderer.render(region.realms[neighbor.parent].heraldry.device, 20, 22)}<!-- HTML_TAG_END -->.</p> <p class="svelte-8c1n7g">Ruled by ${escape(neighbor.authority.getHonorific())} ${escape(neighbor.authority.name)}, ${escape(Words.article(neighbor.authority.species.adjective))} ${escape(neighbor.authority.species.adjective)} ${escape(neighbor.authority.ageCategory.noun)}.</p></div> </div>` : ``}`;
  })} <h3 class="svelte-8c1n7g">Notable Settlements in ${escape(region.name)}</h3> ${each(region.settlements, (settlement) => {
    return `<article class="svelte-8c1n7g"><h5 class="svelte-8c1n7g">${escape(settlement.name)}</h5> <p class="svelte-8c1n7g">${escape(settlement.description)}</p> </article>`;
  })} <h3 class="svelte-8c1n7g" data-svelte-h="svelte-11j2hih">Notable Organizations</h3> ${each(region.organizations, (organization) => {
    return `<article class="svelte-8c1n7g"><h5 class="svelte-8c1n7g">${escape(organization.name)}</h5> <p class="svelte-8c1n7g">${escape(organization.description)}</p> </article>`;
  })} </section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map
