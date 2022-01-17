"use strict";

import * as Descriptor from "./descriptor";
import * as Material from "./material";
import * as Domains from "../religion/domains";
import * as RND from "../random";
import * as Words from "../words";
import * as Name from "../names/magicitems";

export class Weapon {
  name: string;
  description: string;
  weaponType: string;
  effect: string;

  constructor(name: string, description: string, weaponType: string, effect: string) {
    this.name = name;
    this.description = description;
    this.weaponType = weaponType;
    this.effect = effect;
  }
}

export class WeaponType {
  name: string;
  hands: string;
  category: string;

  constructor(name: string, hands: string, category: string) {
    this.name = name;
    this.hands = hands;
    this.category = category;
  }
}

export class WeaponEffect {
  description: string;
  tags: string[];

  constructor(description: string, tags: string[]) {
    this.description = description;
    this.tags = tags;
  }
}

export function generate(category: string, theme: string): Weapon {
  if (theme == "any") {
    const domains = Domains.getAllDomainNames();
    theme = RND.item(domains);
  }

  if (category == "any") {
    const categories = getAllWeaponCategories();
    category = RND.item(categories);
  }

  const all = getAllDescriptors();

  const types: WeaponType[] = getWeaponTypesOfCategory(category);

  const weaponType: WeaponType = RND.item(types);

  const materialSet = Material.getRandomMaterialSetForCategory(category);
  const bodyMaterial = Material.getRandomMaterialForCategory(materialSet.body);
  const headMaterial = Material.getRandomMaterialForCategory(materialSet.head);
  const ornamentationMaterial = Material.getRandomMaterialForCategory(materialSet.ornamentation);

  let descriptors = Descriptor.getDescriptorsMatchingType(all, category);

  descriptors = Descriptor.getDescriptorsMatchingTag(descriptors, theme);

  const effects = getAllEffectsForTheme(theme);
  const effect = RND.item(effects);

  const descriptor = RND.item(descriptors);
  let descriptorDescription = descriptor.description.replace("{head}", headMaterial.name);
  descriptorDescription = descriptorDescription.replace("{ornamentation}", ornamentationMaterial.name);

  const name = Name.generate();

  let description = Words.article(bodyMaterial.name) + ` ${bodyMaterial.name} ${weaponType.name} `;
  description += descriptorDescription;

  return new Weapon(name, description, weaponType.name, effect);
}

export function checkForMissingMatches(): string {
  const allDomains = Domains.getAllDomainNames();
  const domainsMissingEffects = [];
  const domainsMissingDescriptors = [];
  const domainsMissingWeaponDescriptors = [];

  const descriptors = getAllDescriptors();

  const allWeaponCategories = getAllWeaponCategories();

  for (let i = 0; i < allDomains.length; i++) {
    const countEffects = getAllEffectsForTheme(allDomains[i]);
    if (countEffects.length == 0) {
      domainsMissingEffects.push(allDomains[i]);
    }
    const countDescriptors = Descriptor.getDescriptorsMatchingTag(descriptors, allDomains[i]);
    if (countDescriptors.length == 0) {
      domainsMissingDescriptors.push(allDomains[i]);
    }
    for (let j = 0; j < allWeaponCategories.length; j++) {
      const weaponDescriptors = Descriptor.getDescriptorsMatchingType(descriptors, allWeaponCategories[j]);
      const domainWeaponDescriptors = Descriptor.getDescriptorsMatchingTag(weaponDescriptors, allDomains[i]);
      if (domainWeaponDescriptors.length == 0) {
        domainsMissingWeaponDescriptors.push(allDomains[i] + " for " + allWeaponCategories[j]);
      }
    }
  }

  let theList = "Domains missing effects: " + Words.arrayToPhrase(domainsMissingEffects);
  theList += "; and domains missing descriptors: " + Words.arrayToPhrase(domainsMissingDescriptors);
  theList += "; and domains missing descriptors for specific weapons: " + Words.arrayToPhrase(domainsMissingWeaponDescriptors);

  return theList;
}

function getAllDescriptors(): Descriptor.Descriptor[] {
  const bladed = ["sword", "axe", "knife", "dagger", "scythe"];
  const hilted = ["sword", "dagger"];
  const shafted = ["staff", "spear", "polearm"];
  const blunt = ["hammer", "mace", "club"];
  const blunthead = ["hammer", "mace"];
  const woodbodied = ["staff", "bow", "crossbow", "club", "spear", "polearm", "scythe", "mace", "hammer"];
  const staff = ["staff"];
  const whip = ["whip"];

  const descriptors = [
    new Descriptor.Descriptor("topped with a {head} wing", staff, ["air", "wing", "bird"]),
    new Descriptor.Descriptor("topped with a cluster of carved {head} wings", staff, ["air", "wing", "bird"]),
    new Descriptor.Descriptor("carved with sunrises in relief", blunt, ["air", "the sun", "dawn", "good"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt engraved with a sunrise", hilted, ["air", "the sun", "dawn"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt engraved with a starlit sky", hilted, ["stars", "night", "air"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt engraved with a crescent moon", hilted, ["the moon", "night"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt engraved with a cloud", hilted, ["cloud", "air"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt engraved with a thunderbolt", hilted, ["thunder", "storm"]),
    new Descriptor.Descriptor("with two tails ending in barbs", whip, ["animals", "monsters", "war"]),
    new Descriptor.Descriptor("with three tails ending in barbs", whip, ["animals", "monsters", "war"]),
    new Descriptor.Descriptor("with nine tails ending in barbs", whip, ["animals", "monsters", "war"]),
    new Descriptor.Descriptor("with a wickedly serrated blade", bladed, ["war", "evil", "hate", "destruction"]),
    new Descriptor.Descriptor("with a blade engraved in malevolent runes", bladed, ["war", "evil", "hate", "demons", "revenge"]),
    new Descriptor.Descriptor("with a multicolored blade", bladed, ["art", "chaos"]),
    new Descriptor.Descriptor("carved with sunrises in relief", woodbodied, ["sky", "the sun", "dawn", "good"]),
    new Descriptor.Descriptor("carved with an erupting volcano", woodbodied, ["fire", "destruction"]),
    new Descriptor.Descriptor("carved with depictions of many beasts", woodbodied, ["animals", "forest"]),
    new Descriptor.Descriptor("carved with a large, ornate tree", woodbodied, ["forest", "nature"]),
    new Descriptor.Descriptor("carved with leaves", woodbodied, ["autumn", "forest", "nature"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt engraved with a scale", hilted, ["justice", "balance", "trade"]),
    new Descriptor.Descriptor("with several tails that seem to shimmer and shift", whip, ["chaos", "trickery"]),
    new Descriptor.Descriptor("with a blade that seems to shimmer and shift", bladed, ["chaos", "trickery"]),
    new Descriptor.Descriptor("with a {head} head decorated with an eight-pointed star made of {ornamentation}", blunthead, ["chaos"]),
    new Descriptor.Descriptor("with a blade enshrouded in darkness", bladed, ["darkness", "evil", "fear", "hate", "thieves"]),
    new Descriptor.Descriptor("with a skull-shaped head made of {head}", blunthead, ["death", "evil", "fear"]),
    new Descriptor.Descriptor("with a {ornamentation} hilt shaped like a skull", hilted, ["death", "evil", "fear"]),
    new Descriptor.Descriptor("with a {head} blade that looks like a perpetually-moving sea of demons", bladed, ["demons", "evil"]),
    new Descriptor.Descriptor("carved with a setting sun laid in {ornamentation}", woodbodied, ["dusk", "darkness"]),
    new Descriptor.Descriptor("topped with a {head} head carved with a mountain in relief", blunthead, ["earth"]),
    new Descriptor.Descriptor("carved with a scene of people dancing", woodbodied, ["fertility", "music"]),
    new Descriptor.Descriptor("carved with a scene of a couple entwined", woodbodied, ["fertility", "love"]),
    new Descriptor.Descriptor("with a {head} blade carved with dancing flames", bladed, ["fire"]),
    new Descriptor.Descriptor("whose top is a {head} carving of a fox", staff, ["foxes", "animals"]),
    new Descriptor.Descriptor("with a carving of a resplendent sun in {ornamentation}", woodbodied, ["good", "the sun", "life", "summer"]),
    new Descriptor.Descriptor("engraved with a scene of a harvest", bladed, ["harvests"]),
    new Descriptor.Descriptor("with carvings of radiant light throughout the shaft", woodbodied, ["healing", "good", "light", "hope", "life"]),
    new Descriptor.Descriptor("engraved with hands outstretched", bladed, ["hope", "healing", "good", "mercy"]),
    new Descriptor.Descriptor("carved with horses running", woodbodied, ["horses"]),
    new Descriptor.Descriptor("engraved with a horse's head", bladed, ["horses"]),
    new Descriptor.Descriptor("with a {head} blade engraved with a blindfolded face", bladed, ["justice"]),
    new Descriptor.Descriptor("with a carving of a stag", woodbodied, ["forest", "hunting"]),
    new Descriptor.Descriptor("with many intricate paintings of books", staff, ["knowledge"]),
    new Descriptor.Descriptor("stained with symbols of books", woodbodied, ["knowledge"]),
    new Descriptor.Descriptor("shaped like many intertwined tongues", staff, ["language"]),
    new Descriptor.Descriptor("covered in engravings of open mouths", bladed, ["language"]),
    new Descriptor.Descriptor("bearing an engraving of a sword laying on a book", bladed, ["law"]),
    new Descriptor.Descriptor("carved in the shape of many intertwined vines", staff, ["life", "nature", "plants"]),
    new Descriptor.Descriptor("inlaid in {ornamentation} with many lightning bolts", bladed, ["lightning", "thunder"]),
    new Descriptor.Descriptor("inlaid in {ornamentation} with heart symbols", bladed, ["love"]),
    new Descriptor.Descriptor("ornamented with {ornamentation} on the hilt", hilted, ["love"]),
    new Descriptor.Descriptor("ornamented with intertwined {ornamentation} lines running up and down the shaft", shafted, ["luck"]),
    new Descriptor.Descriptor("topped with a {head} six-sided die inlaid with {ornamentation}", blunthead, ["luck"]),
    new Descriptor.Descriptor("bearing a carving of an open hand", woodbodied, ["mercy"]),
    new Descriptor.Descriptor("intricately painted with scenes of musicians playing", woodbodied, ["music"]),
    new Descriptor.Descriptor("with a {ornamentation} crown on the hilt", hilted, ["nobility"]),
    new Descriptor.Descriptor("carved with roaring waves", woodbodied, ["oceans", "water"]),
    new Descriptor.Descriptor("engraved with stylized waves", bladed, ["oceans", "water", "rivers"]),
    new Descriptor.Descriptor("wrapped in {ornamentation} wire", shafted, ["persistence"]),
    new Descriptor.Descriptor("covered in carvings of flowers inlaid with {ornamentation}", woodbodied, ["spring", "nature", "plants"]),
    new Descriptor.Descriptor("engraved with shields inlaid with {ornamentation}", bladed, ["protection"]),
    new Descriptor.Descriptor("topped with a {ornamentation} flower", blunthead, ["spring", "nature", "plants"]),
    new Descriptor.Descriptor("engraved with a symbol of a fist", bladed, ["strength", "war"]),
    new Descriptor.Descriptor("topped with a {head} head in the shape of a fist", blunthead, ["strength", "war"]),
    new Descriptor.Descriptor("covered in carvings of crescent moons", woodbodied, ["the moon", "night"]),
    new Descriptor.Descriptor("with an hourglass inlaid in the hilt", hilted, ["time"]),
    new Descriptor.Descriptor("with an hourglass carved into the shaft", shafted, ["time"]),
    new Descriptor.Descriptor("with engravings of coins on the blade", bladed, ["trade"]),
    new Descriptor.Descriptor("carved with a symbol of a man on horseback", woodbodied, ["travel"]),
    new Descriptor.Descriptor("inlaid in {ornamentation} with snowflakes", bladed, ["winter"]),
    new Descriptor.Descriptor("carved with an open book", woodbodied, ["wisdom", "knowledge"]),
    new Descriptor.Descriptor("engraved with an open eye", bladed, ["wisdom"]),
  ];

  const pairings = [
    {
      method: "carved with",
      objects: woodbodied,
    },
    {
      method: "engraved with",
      objects: bladed,
    },
    {
      method: "painted with",
      objects: woodbodied,
    },
    {
      method: "stained to resemble",
      objects: woodbodied,
    },
    {
      method: "with a {ornamentation} hilt engraved with",
      objects: hilted,
    },
    {
      method: "with a {ornamentation} hilt shaped like",
      objects: hilted,
    },
    {
      method: "woven to resemble",
      objects: ["whip"],
    },
    {
      method: "with {head} tips cast to resemble",
      objects: ["flail"],
    },
  ];

  const allDomains = Domains.all();

  for (let i = 0; i < allDomains.length; i++) {
    for (let j = 0; j < pairings.length; j++) {
      for (let k = 0; k < allDomains[i].holySymbols.length; k++) {
        const descriptor = new Descriptor.Descriptor(pairings[j].method + " " + Words.article(allDomains[i].holySymbols[k]) + " " + allDomains[i].holySymbols[k], pairings[j].objects, [allDomains[i].name]);
        descriptors.push(descriptor);
      }
    }
  }

  return descriptors;
}

function getAllEffectsForTheme(theme: string): string[] {
  const domainDetails = Domains.getSpecificDomain(theme);

  return domainDetails.weaponEffects.concat(domainDetails.otherEffects);
}

export function getAllWeaponCategories(): string[] {
  const allTypes = getAllWeaponTypes();

  const result: string[] = [];

  for (let i = 0; i < allTypes.length; i++) {
    if (!result.includes(allTypes[i].category)) {
      result.push(allTypes[i].category);
    }
  }

  return result;
}

function getAllWeaponTypes(): WeaponType[] {
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
    new WeaponType("pole axe", "2H", "polearm"),
  ];
}

function getWeaponTypesOfCategory(category: string): WeaponType[] {
  const all = getAllWeaponTypes();

  const result = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].category == category) {
      result.push(all[i]);
    }
  }

  return result;
}
