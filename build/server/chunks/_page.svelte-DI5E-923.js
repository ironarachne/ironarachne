import { c as create_ssr_component, f as each, b as add_attribute, e as escape } from './ssr-kRdx30EW.js';
import { g as getAllDomainNames, b as getSpecificDomain, a as allDomains } from './domains-d4Eq1_4R.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import './sentry-release-injection-file-o9u5woV9.js';
import random from 'random';
import seedrandom from 'seedrandom';

class Descriptor {
  description;
  objectTypes;
  tags;
  constructor(description, objectTypes, tags) {
    this.description = description;
    this.objectTypes = objectTypes;
    this.tags = tags;
  }
}
function getDescriptorsMatchingType(descriptors, objectType) {
  const result = [];
  for (let i = 0; i < descriptors.length; i++) {
    if (descriptors[i].objectTypes.includes(objectType)) {
      result.push(descriptors[i]);
    }
  }
  return result;
}
function getDescriptorsMatchingTag(descriptors, tag) {
  const result = [];
  for (let i = 0; i < descriptors.length; i++) {
    if (descriptors[i].tags.includes(tag)) {
      result.push(descriptors[i]);
    }
  }
  return result;
}
class MaterialSet {
  name;
  body;
  head;
  ornamentation;
  categories;
  constructor(name, body, head, ornamentation, categories) {
    this.name = name;
    this.body = body;
    this.head = head;
    this.ornamentation = ornamentation;
    this.categories = categories;
  }
}
class Material {
  name;
  category;
  constructor(name, category) {
    this.name = name;
    this.category = category;
  }
}
function getAllMaterialSets() {
  return [
    new MaterialSet("wooden", "wood", "wood", "soft metal", ["staff", "bow", "crossbow"]),
    new MaterialSet("wood and metal", "wood", "hard metal", "soft metal", [
      "staff",
      "club",
      "hammer",
      "polearm",
      "scythe",
      "mace",
      "spear"
    ]),
    new MaterialSet("metal", "hard metal", "hard metal", "soft metal", [
      "sword",
      "knife",
      "dagger",
      "axe",
      "hammer",
      "flail",
      "armor"
    ]),
    new MaterialSet("leather", "leather", "leather", "leather", ["whip", "armor"]),
    new MaterialSet("leather and metal", "leather", "hard metal", "soft metal", ["whip", "armor"]),
    new MaterialSet("wood and stone", "wood", "stone", "soft metal", ["hammer"])
  ];
}
function getAllMaterials() {
  return [
    new Material("copper", "soft metal"),
    new Material("bronze", "hard metal"),
    new Material("brass", "soft metal"),
    new Material("silver", "soft metal"),
    new Material("gold", "soft metal"),
    new Material("iron", "hard metal"),
    new Material("steel", "hard metal"),
    new Material("oak", "wood"),
    new Material("elm", "wood"),
    new Material("cedar", "wood"),
    new Material("pine", "wood"),
    new Material("ironwood", "wood"),
    new Material("maple", "wood"),
    new Material("teak", "wood"),
    new Material("leather", "leather"),
    new Material("crystal", "gemstone"),
    new Material("granite", "stone"),
    new Material("sandstone", "stone"),
    new Material("shale", "stone"),
    new Material("ruby", "gemstone"),
    new Material("sapphire", "gemstone")
  ];
}
function getMaterialSetsForCategory(category) {
  const all = getAllMaterialSets();
  const result = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].categories.includes(category)) {
      result.push(all[i]);
    }
  }
  return result;
}
function getMaterialsForCategory(category) {
  const all = getAllMaterials();
  const result = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].category == category) {
      result.push(all[i]);
    }
  }
  return result;
}
function getRandomMaterialSetForCategory(category) {
  const options = getMaterialSetsForCategory(category);
  return RND.item(options);
}
function getRandomMaterialForCategory(category) {
  const options = getMaterialsForCategory(category);
  return RND.item(options);
}
class Weapon {
  name;
  description;
  weaponType;
  effect;
  constructor(name, description, weaponType, effect) {
    this.name = name;
    this.description = description;
    this.weaponType = weaponType;
    this.effect = effect;
  }
}
class WeaponType {
  name;
  hands;
  category;
  constructor(name, hands, category) {
    this.name = name;
    this.hands = hands;
    this.category = category;
  }
}
function generate(category, theme) {
  if (theme == "any") {
    const domains = getAllDomainNames();
    theme = RND.item(domains);
  }
  if (category == "any") {
    const categories = getAllWeaponCategories();
    category = RND.item(categories);
  }
  const all = getAllDescriptors();
  const types = getWeaponTypesOfCategory(category);
  const weaponType = RND.item(types);
  const materialSet = getRandomMaterialSetForCategory(category);
  const bodyMaterial = getRandomMaterialForCategory(materialSet.body);
  const headMaterial = getRandomMaterialForCategory(materialSet.head);
  const ornamentationMaterial = getRandomMaterialForCategory(materialSet.ornamentation);
  let descriptors = getDescriptorsMatchingType(all, category);
  descriptors = getDescriptorsMatchingTag(descriptors, theme);
  const effects = getAllEffectsForTheme(theme);
  const effect = RND.item(effects);
  const descriptor = RND.item(descriptors);
  let descriptorDescription = descriptor.description.replace("{head}", headMaterial.name);
  descriptorDescription = descriptorDescription.replace(
    "{ornamentation}",
    ornamentationMaterial.name
  );
  const name = MUN.magicItem();
  let description = Words.article(bodyMaterial.name) + ` ${bodyMaterial.name} ${weaponType.name} `;
  description += descriptorDescription;
  return new Weapon(name, description, weaponType.name, effect);
}
function getAllDescriptors() {
  const bladed = ["sword", "axe", "knife", "dagger", "scythe"];
  const hilted = ["sword", "dagger"];
  const shafted = ["staff", "spear", "polearm"];
  const blunt = ["hammer", "mace", "club"];
  const blunthead = ["hammer", "mace"];
  const woodbodied = [
    "staff",
    "bow",
    "crossbow",
    "club",
    "spear",
    "polearm",
    "scythe",
    "mace",
    "hammer"
  ];
  const staff = ["staff"];
  const whip = ["whip"];
  const descriptors = [
    new Descriptor("topped with a {head} wing", staff, ["air", "wing", "bird"]),
    new Descriptor("topped with a cluster of carved {head} wings", staff, [
      "air",
      "wing",
      "bird"
    ]),
    new Descriptor("carved with sunrises in relief", blunt, [
      "air",
      "the sun",
      "dawn",
      "good"
    ]),
    new Descriptor("with a {ornamentation} hilt engraved with a sunrise", hilted, [
      "air",
      "the sun",
      "dawn"
    ]),
    new Descriptor("with a {ornamentation} hilt engraved with a starlit sky", hilted, [
      "stars",
      "night",
      "air"
    ]),
    new Descriptor("with a {ornamentation} hilt engraved with a crescent moon", hilted, [
      "the moon",
      "night"
    ]),
    new Descriptor("with a {ornamentation} hilt engraved with a cloud", hilted, [
      "cloud",
      "air"
    ]),
    new Descriptor("with a {ornamentation} hilt engraved with a thunderbolt", hilted, [
      "thunder",
      "storm"
    ]),
    new Descriptor("with two tails ending in barbs", whip, [
      "animals",
      "monsters",
      "war"
    ]),
    new Descriptor("with three tails ending in barbs", whip, [
      "animals",
      "monsters",
      "war"
    ]),
    new Descriptor("with nine tails ending in barbs", whip, [
      "animals",
      "monsters",
      "war"
    ]),
    new Descriptor("with a wickedly serrated blade", bladed, [
      "war",
      "evil",
      "hate",
      "destruction"
    ]),
    new Descriptor("with a blade engraved in malevolent runes", bladed, [
      "war",
      "evil",
      "hate",
      "demons",
      "revenge"
    ]),
    new Descriptor("with a multicolored blade", bladed, ["art", "chaos"]),
    new Descriptor("carved with sunrises in relief", woodbodied, [
      "sky",
      "the sun",
      "dawn",
      "good"
    ]),
    new Descriptor("carved with an erupting volcano", woodbodied, [
      "fire",
      "destruction"
    ]),
    new Descriptor("carved with depictions of many beasts", woodbodied, [
      "animals",
      "forest"
    ]),
    new Descriptor("carved with a large, ornate tree", woodbodied, ["forest", "nature"]),
    new Descriptor("carved with leaves", woodbodied, ["autumn", "forest", "nature"]),
    new Descriptor("with a {ornamentation} hilt engraved with a scale", hilted, [
      "justice",
      "balance",
      "trade"
    ]),
    new Descriptor("with several tails that seem to shimmer and shift", whip, [
      "chaos",
      "trickery"
    ]),
    new Descriptor("with a blade that seems to shimmer and shift", bladed, [
      "chaos",
      "trickery"
    ]),
    new Descriptor(
      "with a {head} head decorated with an eight-pointed star made of {ornamentation}",
      blunthead,
      ["chaos"]
    ),
    new Descriptor("with a blade enshrouded in darkness", bladed, [
      "darkness",
      "evil",
      "fear",
      "hate",
      "thieves"
    ]),
    new Descriptor("with a skull-shaped head made of {head}", blunthead, [
      "death",
      "evil",
      "fear"
    ]),
    new Descriptor("with a {ornamentation} hilt shaped like a skull", hilted, [
      "death",
      "evil",
      "fear"
    ]),
    new Descriptor(
      "with a {head} blade that looks like a perpetually-moving sea of demons",
      bladed,
      ["demons", "evil"]
    ),
    new Descriptor("carved with a setting sun laid in {ornamentation}", woodbodied, [
      "dusk",
      "darkness"
    ]),
    new Descriptor(
      "topped with a {head} head carved with a mountain in relief",
      blunthead,
      ["earth"]
    ),
    new Descriptor("carved with a scene of people dancing", woodbodied, [
      "fertility",
      "music"
    ]),
    new Descriptor("carved with a scene of a couple entwined", woodbodied, [
      "fertility",
      "love"
    ]),
    new Descriptor("with a {head} blade carved with dancing flames", bladed, ["fire"]),
    new Descriptor("whose top is a {head} carving of a fox", staff, [
      "foxes",
      "animals"
    ]),
    new Descriptor(
      "with a carving of a resplendent sun in {ornamentation}",
      woodbodied,
      ["good", "the sun", "life", "summer"]
    ),
    new Descriptor("engraved with a scene of a harvest", bladed, ["harvests"]),
    new Descriptor("with carvings of radiant light throughout the shaft", woodbodied, [
      "healing",
      "good",
      "light",
      "hope",
      "life"
    ]),
    new Descriptor("engraved with hands outstretched", bladed, [
      "hope",
      "healing",
      "good",
      "mercy"
    ]),
    new Descriptor("carved with horses running", woodbodied, ["horses"]),
    new Descriptor("engraved with a horse's head", bladed, ["horses"]),
    new Descriptor("with a {head} blade engraved with a blindfolded face", bladed, [
      "justice"
    ]),
    new Descriptor("with a carving of a stag", woodbodied, ["forest", "hunting"]),
    new Descriptor("with many intricate paintings of books", staff, ["knowledge"]),
    new Descriptor("stained with symbols of books", woodbodied, ["knowledge"]),
    new Descriptor("shaped like many intertwined tongues", staff, ["language"]),
    new Descriptor("covered in engravings of open mouths", bladed, ["language"]),
    new Descriptor("bearing an engraving of a sword laying on a book", bladed, ["law"]),
    new Descriptor("carved in the shape of many intertwined vines", staff, [
      "life",
      "nature",
      "plants"
    ]),
    new Descriptor("inlaid in {ornamentation} with many lightning bolts", bladed, [
      "lightning",
      "thunder"
    ]),
    new Descriptor("inlaid in {ornamentation} with heart symbols", bladed, ["love"]),
    new Descriptor("ornamented with {ornamentation} on the hilt", hilted, ["love"]),
    new Descriptor(
      "ornamented with intertwined {ornamentation} lines running up and down the shaft",
      shafted,
      ["luck"]
    ),
    new Descriptor(
      "topped with a {head} six-sided die inlaid with {ornamentation}",
      blunthead,
      ["luck"]
    ),
    new Descriptor("bearing a carving of an open hand", woodbodied, ["mercy"]),
    new Descriptor("intricately painted with scenes of musicians playing", woodbodied, [
      "music"
    ]),
    new Descriptor("with a {ornamentation} crown on the hilt", hilted, ["nobility"]),
    new Descriptor("carved with roaring waves", woodbodied, ["oceans", "water"]),
    new Descriptor("engraved with stylized waves", bladed, [
      "oceans",
      "water",
      "rivers"
    ]),
    new Descriptor("wrapped in {ornamentation} wire", shafted, ["persistence"]),
    new Descriptor(
      "covered in carvings of flowers inlaid with {ornamentation}",
      woodbodied,
      ["spring", "nature", "plants"]
    ),
    new Descriptor("engraved with shields inlaid with {ornamentation}", bladed, [
      "protection"
    ]),
    new Descriptor("topped with a {ornamentation} flower", blunthead, [
      "spring",
      "nature",
      "plants"
    ]),
    new Descriptor("engraved with a symbol of a fist", bladed, ["strength", "war"]),
    new Descriptor("topped with a {head} head in the shape of a fist", blunthead, [
      "strength",
      "war"
    ]),
    new Descriptor("covered in carvings of crescent moons", woodbodied, [
      "the moon",
      "night"
    ]),
    new Descriptor("with an hourglass inlaid in the hilt", hilted, ["time"]),
    new Descriptor("with an hourglass carved into the shaft", shafted, ["time"]),
    new Descriptor("with engravings of coins on the blade", bladed, ["trade"]),
    new Descriptor("carved with a symbol of a man on horseback", woodbodied, ["travel"]),
    new Descriptor("inlaid in {ornamentation} with snowflakes", bladed, ["winter"]),
    new Descriptor("carved with an open book", woodbodied, ["wisdom", "knowledge"]),
    new Descriptor("engraved with an open eye", bladed, ["wisdom"])
  ];
  const pairings = [
    {
      method: "carved with",
      objects: woodbodied
    },
    {
      method: "engraved with",
      objects: bladed
    },
    {
      method: "painted with",
      objects: woodbodied
    },
    {
      method: "stained to resemble",
      objects: woodbodied
    },
    {
      method: "with a {ornamentation} hilt engraved with",
      objects: hilted
    },
    {
      method: "with a {ornamentation} hilt shaped like",
      objects: hilted
    },
    {
      method: "woven to resemble",
      objects: ["whip"]
    },
    {
      method: "with {head} tips cast to resemble",
      objects: ["flail"]
    }
  ];
  const allDomains$1 = allDomains;
  for (let i = 0; i < allDomains$1.length; i++) {
    for (let j = 0; j < pairings.length; j++) {
      for (let k = 0; k < allDomains$1[i].holySymbols.length; k++) {
        const descriptor = new Descriptor(
          pairings[j].method + " " + Words.article(allDomains$1[i].holySymbols[k]) + " " + allDomains$1[i].holySymbols[k],
          pairings[j].objects,
          [allDomains$1[i].name]
        );
        descriptors.push(descriptor);
      }
    }
  }
  return descriptors;
}
function getAllEffectsForTheme(theme) {
  const domainDetails = getSpecificDomain(theme);
  return domainDetails.weaponEffects.concat(domainDetails.otherEffects);
}
function getAllWeaponCategories() {
  const allTypes = getAllWeaponTypes();
  const result = [];
  for (let i = 0; i < allTypes.length; i++) {
    if (!result.includes(allTypes[i].category)) {
      result.push(allTypes[i].category);
    }
  }
  return result;
}
function getAllWeaponTypes() {
  return [
    new WeaponType("short sword", "1H", "sword"),
    new WeaponType("long sword", "1H", "sword"),
    new WeaponType("broadsword", "1H", "sword"),
    new WeaponType("greatsword", "2H", "sword"),
    new WeaponType("bastard sword", "1H", "sword"),
    new WeaponType("scimitar", "1H", "sword"),
    new WeaponType("falchion", "1H", "sword"),
    new WeaponType("rapier", "1H", "sword"),
    new WeaponType("cutlass", "1H", "sword"),
    new WeaponType("war scythe", "2H", "scythe"),
    new WeaponType("sickle", "1H", "scythe"),
    new WeaponType("morningstar", "1H", "mace"),
    new WeaponType("mace", "1H", "mace"),
    new WeaponType("dagger", "1H", "dagger"),
    new WeaponType("kukri", "1H", "dagger"),
    new WeaponType("knife", "1H", "knife"),
    new WeaponType("hunting knife", "1H", "knife"),
    new WeaponType("long bow", "2H", "bow"),
    new WeaponType("shortbow", "2H", "bow"),
    new WeaponType("quarterstaff", "2H", "staff"),
    new WeaponType("staff", "2H", "staff"),
    new WeaponType("spear", "2H", "spear"),
    new WeaponType("short spear", "1H", "spear"),
    new WeaponType("broad axe", "1H", "axe"),
    new WeaponType("battle axe", "1H", "axe"),
    new WeaponType("throwing axe", "1H", "axe"),
    new WeaponType("double-bladed axe", "1H", "axe"),
    new WeaponType("crossbow", "2H", "crossbow"),
    new WeaponType("hand crossbow", "1H", "crossbow"),
    new WeaponType("war hammer", "1H", "hammer"),
    new WeaponType("maul", "1H", "hammer"),
    new WeaponType("great maul", "2H", "hammer"),
    new WeaponType("club", "1H", "club"),
    new WeaponType("heavy club", "1H", "club"),
    new WeaponType("great club", "2H", "club"),
    new WeaponType("whip", "1H", "whip"),
    new WeaponType("trident", "2H", "spear"),
    new WeaponType("flail", "1H", "flail"),
    new WeaponType("war flail", "1H", "flail"),
    new WeaponType("halberd", "2H", "polearm"),
    new WeaponType("pole axe", "2H", "polearm")
  ];
}
function getWeaponTypesOfCategory(category) {
  const all = getAllWeaponTypes();
  const result = [];
  for (let i = 0; i < all.length; i++) {
    if (all[i].category == category) {
      result.push(all[i]);
    }
  }
  return result;
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx,select.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let themes = getAllDomainNames().sort();
  let categories = getAllWeaponCategories().sort();
  let category = "any";
  let theme = "any";
  let seed = RND.randomString(13);
  let weapon = generate(category, theme);
  function generate$1() {
    random.use(seedrandom(seed));
    weapon = generate(category, theme);
    weapon.description = weapon.name + " is " + weapon.description;
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate$1();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-13os42b_START -->${$$result.title = `<title>Magic Weapon Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-13os42b_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-11honkk">Magic Weapon Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-ffqwwi">This generates a unique magical weapon.</p> <div class="input-group svelte-4q74qx"><label for="theme" class="svelte-4q74qx" data-svelte-h="svelte-1ho886c">Theme</label> <select name="theme" id="theme" class="svelte-4q74qx"><option value="any" data-svelte-h="svelte-1j2tppc">any</option>${each(themes, (item) => {
    return `<option${add_attribute("value", item, 0)}>${escape(item)}</option>`;
  })}</select></div> <div class="input-group svelte-4q74qx"><label for="category" class="svelte-4q74qx" data-svelte-h="svelte-4738v6">Category</label> <select name="category" id="category" class="svelte-4q74qx"><option value="any" data-svelte-h="svelte-1j2tppc">any</option>${each(categories, (item) => {
    return `<option${add_attribute("value", item, 0)}>${escape(item)}</option>`;
  })}</select></div> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-4q74qx">${escape(weapon.name)}</h2> <p class="svelte-4q74qx">${escape(weapon.description)}. It ${escape(weapon.effect)}.</p></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-DI5E-923.js.map
