import { c as create_ssr_component, g as getContext, a as add_attribute, f as each, e as escape } from "../../../chunks/ssr.js";
import * as RND from "@ironarachne/rng";
import { a as all$2, d as describe, g as generate$4, b as getDefaultConfig$3 } from "../../../chunks/climates.js";
import "../../../chunks/sentry-release-injection-file.js";
import { g as generate$6 } from "../../../chunks/fantasy.js";
import { c as generate$5, o as getHonorific } from "../../../chunks/characters.js";
import { g as getFantasy } from "../../../chunks/premade_configs.js";
import { H as HeraldryGenerator } from "../../../chunks/generator.js";
import * as MUN from "@ironarachne/made-up-names";
import * as Words from "@ironarachne/words";
import { r as roll } from "../../../chunks/dice.js";
import random from "random";
import seedrandom from "seedrandom";
import { H as HeraldrySVGRenderer } from "../../../chunks/svg.js";
function generate$3() {
  let climate = RND.item(all$2());
  climate.description = describe(climate);
  let config = getDefaultConfig$3();
  config.climate = climate;
  const biome = generate$4(config);
  let environment = { biome, climate, description: "" };
  environment.description = `${RND.item(biome.descriptions)} ${RND.item(biome.features)}`;
  environment.description += " " + environment.climate.description;
  return environment;
}
function all$1() {
  let kingdom = {
    name: "kingdom",
    minTiles: 10,
    maxTiles: 50,
    grantedTitle: {
      femaleTitle: "Queen",
      maleTitle: "King",
      femaleHonorific: "Queen",
      maleHonorific: "King",
      hasLands: true,
      landName: "Kingdom of",
      precedence: 7
    },
    commonality: 5,
    isStandalone: true,
    parentType: null
  };
  let empire = {
    name: "empire",
    minTiles: 50,
    maxTiles: 100,
    grantedTitle: {
      femaleTitle: "Empress",
      maleTitle: "Emperor",
      femaleHonorific: "Empress",
      maleHonorific: "Emperor",
      hasLands: true,
      landName: "Empire of",
      precedence: 8
    },
    commonality: 5,
    isStandalone: true,
    parentType: null
  };
  return [
    {
      name: "earldom",
      minTiles: 2,
      maxTiles: 4,
      grantedTitle: {
        femaleTitle: "Earl",
        maleTitle: "Earl",
        femaleHonorific: "Lady",
        maleHonorific: "Lord",
        hasLands: true,
        landName: "Earldom of",
        precedence: 2
      },
      commonality: 5,
      isStandalone: false,
      parentType: kingdom
    },
    {
      name: "county",
      minTiles: 4,
      maxTiles: 6,
      grantedTitle: {
        femaleTitle: "Countess",
        maleTitle: "Count",
        femaleHonorific: "Countess",
        maleHonorific: "Count",
        hasLands: true,
        landName: "County of",
        precedence: 3
      },
      commonality: 20,
      isStandalone: false,
      parentType: kingdom
    },
    {
      name: "barony",
      minTiles: 6,
      maxTiles: 8,
      grantedTitle: {
        femaleTitle: "Baroness",
        maleTitle: "Baron",
        femaleHonorific: "Baroness",
        maleHonorific: "Baron",
        hasLands: true,
        landName: "Barony of",
        precedence: 4
      },
      commonality: 10,
      isStandalone: false,
      parentType: kingdom
    },
    {
      name: "duchy",
      minTiles: 8,
      maxTiles: 10,
      grantedTitle: {
        femaleTitle: "Duchess",
        maleTitle: "Duke",
        femaleHonorific: "Duchess",
        maleHonorific: "Duke",
        hasLands: true,
        landName: "Duchy of",
        precedence: 5
      },
      commonality: 5,
      isStandalone: false,
      parentType: kingdom
    },
    {
      name: "grand duchy",
      minTiles: 10,
      maxTiles: 12,
      grantedTitle: {
        femaleTitle: "Grand Duchess",
        maleTitle: "Grand Duke",
        femaleHonorific: "Grand Duchess",
        maleHonorific: "Grand Duke",
        hasLands: true,
        landName: "Grand Duchy of",
        precedence: 6
      },
      commonality: 2,
      isStandalone: false,
      parentType: kingdom
    },
    {
      name: "principality",
      minTiles: 12,
      maxTiles: 14,
      grantedTitle: {
        femaleTitle: "Princess",
        maleTitle: "Prince",
        femaleHonorific: "Princess",
        maleHonorific: "Prince",
        hasLands: true,
        landName: "Principality of",
        precedence: 7
      },
      commonality: 2,
      isStandalone: false,
      parentType: kingdom
    },
    {
      name: "province",
      minTiles: 12,
      maxTiles: 14,
      grantedTitle: {
        femaleTitle: "Governor",
        maleTitle: "Governor",
        femaleHonorific: "Governor",
        maleHonorific: "Governor",
        hasLands: true,
        landName: "Province of",
        precedence: 7
      },
      commonality: 1,
      isStandalone: false,
      parentType: empire
    },
    kingdom,
    empire
  ];
}
function generate$2(config) {
  let realmType = RND.weighted(config.realmTypes);
  if (config.nameGeneratorSet.country === null) {
    throw new Error("RealmGenerator requires a country name generator set.");
  }
  let name = config.nameGeneratorSet.country.generate(1)[0];
  name = `the ${Words.title(realmType.name)} of ${name}`;
  let herGen = new HeraldryGenerator();
  let heraldry = herGen.generate();
  let authority = randomAuthority(realmType, config.nameGeneratorSet);
  return {
    name,
    adjective: name,
    description: "",
    heraldry,
    authority,
    grantedTitle: realmType.grantedTitle,
    tiles: [],
    claims: [],
    parent: -1,
    realmType
  };
}
function getDefaultConfig$2() {
  return {
    nameGeneratorSet: MUN.getSetByName("human", MUN.fantasyRaceSets()),
    realmTypes: all$1(),
    mapWidth: 40,
    mapHeight: 30,
    mapTiles: []
  };
}
function randomAuthority(realmType, nameGeneratorSet) {
  let charGenConfig = getFantasy();
  charGenConfig.ageCategoryNames = ["adult"];
  charGenConfig.familyNameGenerator = nameGeneratorSet.family;
  charGenConfig.femaleNameGenerator = nameGeneratorSet.female;
  charGenConfig.maleNameGenerator = nameGeneratorSet.male;
  charGenConfig.useAdaptiveNames = false;
  let authority = generate$5(charGenConfig);
  authority.titles.push(realmType.grantedTitle);
  let herGen = new HeraldryGenerator();
  authority.heraldry = herGen.generate();
  return authority;
}
const Borough = {
  name: "borough",
  minSize: 1e4,
  maxSize: 19999,
  sizeClass: "medium",
  possibleDescriptions: [
    "The buildings here are tall and tightly packed together, with narrow streets winding between them.",
    "This borough is divided into several distinct districts, each with its own unique architecture and atmosphere.",
    "The center of this borough is dominated by a massive marketplace, surrounded by a ring of shops and residences.",
    "There are many factories and mills in this borough, with tall chimneys belching smoke into the air.",
    "The buildings here are mostly made of stone or brick, and are quite ornate and impressive.",
    "The streets of this borough are lined with small shops and stalls, selling all manner of goods.",
    "There are many parks and gardens scattered throughout this borough, offering a welcome respite from the hustle and bustle of city life.",
    "The buildings here are a mix of old and new, with modern high-rises standing next to ancient, crumbling ruins.",
    "This borough is known for its grand architecture, with many magnificent cathedrals and government buildings."
  ]
};
const City = {
  name: "city",
  minSize: 2e4,
  maxSize: 49999,
  sizeClass: "large",
  possibleDescriptions: [
    "This city is built around a grand castle, with towers that pierce the sky and walls that have withstood the test of time.",
    "The streets of this city are lined with buildings of every shape and size, from towering spires to humble cottages.",
    "This city is a marvel of engineering, with aqueducts, bridges, and tunnels that connect its various districts.",
    "The buildings in this city are a testament to the skill and artistry of its craftsmen, with intricate carvings and decorations adorning their facades.",
    "This city is surrounded by a sturdy wall, with guard towers and gates that keep out unwanted visitors.",
    "The center of this city is dominated by a grand cathedral, with stained-glass windows and soaring arches that inspire awe in all who see them.",
    "The main square of this city is a bustling hub of activity, with market stalls and street performers vying for attention.",
    "The winding alleys of this city are lit by lanterns at night, creating a mysterious and romantic atmosphere.",
    "This city is a patchwork of different architectural styles, with each district showcasing its own unique character and flair."
  ]
};
const Hamlet = {
  name: "hamlet",
  minSize: 10,
  maxSize: 49,
  sizeClass: "small",
  possibleDescriptions: [
    "Buildings here are scattered and small, with thatched roofs and walls of rough-hewn timber.",
    "The farms here are clustered together, their fields carefully tended and surrounded by low stone walls.",
    "There are only a handful of farms scattered around a single community building here, which serves as the center of local life.",
    "The hamlet is surrounded by wilderness, with a few clearings where buildings and fields have been established.",
    "The buildings in the hamlet are simple but sturdy, with chimneys belching smoke into the crisp morning air.",
    "This hamlet is situated on a hilltop, with commanding views of the surrounding countryside.",
    "The hamlet consists of a small cluster of houses and barns, with a narrow dirt road leading off into the distance.",
    "There is a small stream running through the hamlet, providing water for the villagers and their crops."
  ]
};
const Metropolis = {
  name: "metropolis",
  minSize: 5e4,
  maxSize: 3e6,
  sizeClass: "large",
  possibleDescriptions: [
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
  ]
};
const Town = {
  name: "town",
  minSize: 500,
  maxSize: 9999,
  sizeClass: "medium",
  possibleDescriptions: [
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
  ]
};
const Village = {
  name: "village",
  minSize: 50,
  maxSize: 499,
  sizeClass: "small",
  possibleDescriptions: [
    "There is a single inn, a blacksmith, and a few houses in town, with farms surrounding it. Smoke rises from the chimneys, and the sound of animals can be heard in the distance.",
    "This is a dense collection of farms with a number of communal buildings in the center, including a mill and a chapel. The farms are surrounded by low stone walls to protect them from marauding animals.",
    "A knot of communal buildings marks the center of this village, including a town hall and a small market. The farms radiate out in a rough circle around it, with a stream running through the center of the village.",
    "The village is nestled in a valley, surrounded by rolling hills covered in fields of wheat and barley. A small stream winds through the center of town, and the air is fragrant with the smell of fresh-baked bread.",
    "The village is built on the side of a hill, with narrow paths winding between the houses. The buildings are made of wood and thatch, and are tightly packed together for warmth and protection from the wind.",
    "The village is known for its skilled weavers, and the sound of looms can be heard from many of the houses. The weavers work with colorful threads, creating intricate patterns in their textiles.",
    "Despite its small size, the village has a strong sense of community, with neighbors looking out for one another and coming together for festivals and celebrations throughout the year."
  ]
};
function all() {
  return [Hamlet, Village, Town, Borough, City, Metropolis];
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
function randomDescription$1(category) {
  let description = RND.item(category.possibleDescriptions);
  return description;
}
function randomPopulation(category) {
  return random.int(category.minSize, category.maxSize);
}
function generate$1(config) {
  const settlementName = config.nameGenerator !== null ? config.nameGenerator.generate(1)[0] : "Settlement";
  const settlementCategory = RND.item(bySizeClass(config.size));
  const settlement = {
    name: settlementName,
    category: settlementCategory,
    environment: config.environment,
    description: "",
    population: randomPopulation(settlementCategory),
    prosperity: roll("2d6")
  };
  settlement.description = randomDescription(settlement);
  return settlement;
}
function getDefaultConfig$1() {
  let environment = generate$3();
  let genSet = MUN.getSetByName("fantasy", MUN.cultureSets());
  let nameGenerator = genSet.town;
  let size = "any";
  return {
    environment,
    nameGenerator,
    size
  };
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
  description += " " + randomDescription$1(settlement.category);
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
function generate(config) {
  let region = {
    name: "",
    environment: {},
    description: "",
    dominantCulture: {},
    settlements: [],
    mainRealm: 0,
    realms: [],
    authority: {},
    organizations: [],
    settlementTiles: [],
    terrainTiles: []
  };
  let nameGenSet;
  if (config.dominantCulture != null) {
    region.dominantCulture = config.dominantCulture;
    nameGenSet = region.dominantCulture.generatorSet;
  } else {
    nameGenSet = config.nameGeneratorSet;
  }
  region.environment = generate$3();
  region.settlements = randomSettlements(region.environment, nameGenSet);
  region.organizations = randomOrganizations();
  region.description = region.environment.description;
  let realmGenConfig = getDefaultConfig$2();
  realmGenConfig.nameGeneratorSet = nameGenSet;
  let mainRealm = generate$2(realmGenConfig);
  region.realms.push(mainRealm);
  region.mainRealm = 0;
  if (!mainRealm.realmType.isStandalone) {
    let parentRealmConfig = getDefaultConfig$2();
    parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;
    if (mainRealm.realmType.parentType == null) {
      throw new Error("Realm type has no parent type.");
    }
    parentRealmConfig.realmTypes = [mainRealm.realmType.parentType];
    let parentRealm = generate$2(parentRealmConfig);
    region.realms.push(parentRealm);
    mainRealm.parent = 1;
  }
  let numberOfNeighbors = random.int(config.minRealms, config.maxRealms);
  for (let i = 0; i < numberOfNeighbors; i++) {
    realmGenConfig.nameGeneratorSet = MUN.getSetByName("fantasy", MUN.allSets());
    if (RND.simple(100) > 70) {
      let neighborNameGenSet = RND.item(MUN.cultureSets());
      realmGenConfig.nameGeneratorSet = neighborNameGenSet;
    }
    let neighbor = generate$2(realmGenConfig);
    if (!neighbor.realmType.isStandalone) {
      if (RND.simple(100) > 50) {
        neighbor.parent = mainRealm.parent;
      } else {
        let parentRealmConfig = getDefaultConfig$2();
        if (neighbor.realmType.parentType == null) {
          throw new Error("Realm type has no parent type.");
        }
        parentRealmConfig.realmTypes = [neighbor.realmType.parentType];
        parentRealmConfig.nameGeneratorSet = realmGenConfig.nameGeneratorSet;
        let parentRealm = generate$2(parentRealmConfig);
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
function getDefaultConfig() {
  return {
    nameGeneratorSet: MUN.getSetByName("fantasy", MUN.cultureSets()),
    dominantCulture: null,
    mapWidth: 40,
    mapHeight: 30,
    minRealms: 2,
    maxRealms: 4
  };
}
function randomOrganizations() {
  const orgs = [];
  const numberOfOrganizations = random.int(1, 3);
  for (let i = 0; i < numberOfOrganizations; i++) {
    orgs.push(generate$6());
  }
  return orgs;
}
function randomSettlements(environment, nameGeneratorSet) {
  let settlementGenConfig = getDefaultConfig$1();
  settlementGenConfig.nameGenerator = nameGeneratorSet.town;
  settlementGenConfig.size = "large";
  settlementGenConfig.environment = environment;
  const capital = generate$1(settlementGenConfig);
  const numberOfMediumTowns = random.int(1, 3);
  const numberOfSmallTowns = random.int(3, 5);
  const towns = [];
  capital.description += " This is the capital of the region.";
  towns.push(capital);
  for (let i = 0; i < numberOfMediumTowns; i++) {
    settlementGenConfig.size = "medium";
    const town = generate$1(settlementGenConfig);
    towns.push(town);
  }
  for (let i = 0; i < numberOfSmallTowns; i++) {
    settlementGenConfig.size = "small";
    const town = generate$1(settlementGenConfig);
    towns.push(town);
  }
  return towns;
}
const css = {
  code: 'div.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h1.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h2.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h3.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h5.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,p.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,img.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,strong.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,label.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,article.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,section.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,section.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h2.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h3.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,h5.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-size:2rem;line-height:2rem}h5.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-size:1.25rem;border-bottom:1px solid #333}p.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin:1rem 0}label.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-weight:700;margin-right:1rem}article.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin:1rem 0}input.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g,select.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{margin-bottom:1rem}strong.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-weight:700}section.main.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{padding:0.5rem}#seed.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{font-family:monospace}.fantasy.svelte-8c1n7g button.svelte-8c1n7g.svelte-8c1n7g{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-8c1n7g button.svelte-8c1n7g.svelte-8c1n7g:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-8c1n7g button.svelte-8c1n7g.svelte-8c1n7g:disabled{background:#666;color:#777;border-color:#999}div.ruler.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{display:grid;column-gap:1rem;margin-bottom:1rem;grid-template-columns:210px auto}div.ruler-arms.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{align-self:start;width:200px;height:220px;margin:0 auto}div.neighbor.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{display:grid;column-gap:1rem;margin-bottom:0.5rem;grid-template-columns:80px auto}div.neighbor.svelte-8c1n7g>div.svelte-8c1n7g.svelte-8c1n7g{align-self:start}div.neighbor.svelte-8c1n7g>div.svelte-8c1n7g>p.svelte-8c1n7g{margin:0}div.neighbor-arms.svelte-8c1n7g.svelte-8c1n7g.svelte-8c1n7g{justify-self:center;width:80px;height:88px;margin:0 auto}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const user = getContext("user");
  let useSavedCulture = false;
  let seed = RND.randomString(13);
  let nameSet = RND.item(MUN.cultureSets());
  let nameSets = MUN.cultureSets();
  random.use(seedrandom(seed));
  let config = getDefaultConfig();
  config.nameGeneratorSet = nameSet;
  let heraldryRenderer = new HeraldrySVGRenderer();
  let region = generate(config);
  let ruler = region.authority;
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1w8gppc_START -->${$$result.title = `<title>Region Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1w8gppc_END -->`, ""} <section class="fantasy main svelte-8c1n7g"><h1 class="svelte-8c1n7g" data-svelte-h="svelte-qth4ep">Region Generator</h1> <p class="svelte-8c1n7g" data-svelte-h="svelte-pq4136">Generate fantasy regions.</p> <div class="input-group svelte-8c1n7g"><label for="seed" class="svelte-8c1n7g" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-8c1n7g"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-8c1n7g"><label for="names" class="svelte-8c1n7g" data-svelte-h="svelte-1mjeby7">Name Set</label> <select name="names" id="nameSet" class="svelte-8c1n7g"><option value="any" data-svelte-h="svelte-1j2tppc">any</option>${each(nameSets, (nameSet2) => {
    return `<option${add_attribute("value", nameSet2.name, 0)}>${escape(nameSet2.name)}</option>`;
  })}</select></div> ${user.savedCultures !== void 0 && user.savedCultures.length > 0 ? `<div class="input-group svelte-8c1n7g"><label for="useSavedCulture" class="svelte-8c1n7g" data-svelte-h="svelte-14j9oxd">Use a saved culture for naming?</label> <input type="checkbox" name="useSavedCulture" id="useSavedCulture" class="svelte-8c1n7g"${add_attribute("checked", useSavedCulture, 1)}></div> <div class="input-group svelte-8c1n7g"><label for="savedCulture" class="svelte-8c1n7g" data-svelte-h="svelte-32ylm8">Select a saved culture to load</label> <select class="svelte-8c1n7g">${each(user.savedCultures, (saved) => {
    return `<option${add_attribute("value", saved.name, 0)}>${escape(saved.name)}</option>`;
  })}</select></div>` : ``} <button class="svelte-8c1n7g" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-8c1n7g" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-8c1n7g">${escape(Words.capitalize(region.name))}</h2> <p class="svelte-8c1n7g">${escape(region.description)}</p> ${region.dominantCulture.name !== void 0 ? `<p class="svelte-8c1n7g">The dominant culture here is the ${escape(region.dominantCulture.name)}.</p>` : ``} ${region.realms[region.mainRealm].parent != -1 ? `<div class="parent-realm svelte-8c1n7g"><p class="svelte-8c1n7g">${escape(Words.title(region.name))} is part of ${escape(region.realms[region.realms[region.mainRealm].parent].name)} <!-- HTML_TAG_START -->${heraldryRenderer.render(region.realms[region.realms[region.mainRealm].parent].heraldry.device, 20, 22)}<!-- HTML_TAG_END -->.</p></div>` : ``} <h3 class="svelte-8c1n7g">Ruler: ${escape(getHonorific(ruler))} ${escape(ruler.firstName)} ${escape(ruler.lastName)}</h3> <div class="ruler svelte-8c1n7g">${ruler.heraldry !== null ? `<div class="ruler-arms svelte-8c1n7g" data-svelte-h="svelte-1oepa58"><img alt="Ruler heraldry" id="ruler-arms" class="svelte-8c1n7g"></div>` : ``} <div class="svelte-8c1n7g"><p class="svelte-8c1n7g">${escape(Words.capitalize(region.name))} is ruled by ${escape(getHonorific(ruler))} ${escape(ruler.firstName)} ${escape(ruler.lastName)}. ${escape(ruler.description)}</p></div></div> <h3 class="svelte-8c1n7g" data-svelte-h="svelte-1d5axrk">Nearby Sovereignties</h3> ${each(region.realms, (neighbor, index) => {
    return `${index != region.mainRealm && neighbor.parent == -1 ? `<div class="neighbor svelte-8c1n7g"><div class="neighbor-arms svelte-8c1n7g"><!-- HTML_TAG_START -->${heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}<!-- HTML_TAG_END --></div> <div class="svelte-8c1n7g"><p class="svelte-8c1n7g"><strong class="svelte-8c1n7g">${escape(Words.title(neighbor.name))}</strong></p> <p class="svelte-8c1n7g">Ruled by ${escape(getHonorific(neighbor.authority))} ${escape(neighbor.authority.name)}, ${escape(Words.article(neighbor.authority.species.adjective))} ${escape(neighbor.authority.species.adjective)} ${escape(neighbor.authority.ageCategory.noun)}.</p> ${region.realms[region.mainRealm].parent == index ? `<p class="svelte-8c1n7g">${escape(Words.title(region.realms[region.mainRealm].name))} is part of this.</p>` : ``}</div> </div>` : ``}`;
  })} <h3 class="svelte-8c1n7g" data-svelte-h="svelte-p9np5t">Nearby Realms</h3> ${each(region.realms, (neighbor, index) => {
    return `${index != region.mainRealm && index != region.realms[region.mainRealm].parent && neighbor.parent != -1 ? `<div class="neighbor svelte-8c1n7g"><div class="neighbor-arms svelte-8c1n7g"><!-- HTML_TAG_START -->${heraldryRenderer.render(neighbor.heraldry.device, 80, 88)}<!-- HTML_TAG_END --></div> <div class="svelte-8c1n7g"><p class="svelte-8c1n7g"><strong class="svelte-8c1n7g">${escape(Words.title(neighbor.name))}</strong>, part of ${escape(region.realms[neighbor.parent].name)} <!-- HTML_TAG_START -->${heraldryRenderer.render(region.realms[neighbor.parent].heraldry.device, 20, 22)}<!-- HTML_TAG_END -->.</p> <p class="svelte-8c1n7g">Ruled by ${escape(getHonorific(neighbor.authority))} ${escape(neighbor.authority.name)}, ${escape(Words.article(neighbor.authority.species.adjective))} ${escape(neighbor.authority.species.adjective)} ${escape(neighbor.authority.ageCategory.noun)}.</p></div> </div>` : ``}`;
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
