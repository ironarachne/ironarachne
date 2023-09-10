import * as RND from "@ironarachne/rng";

export class MaterialSet {
  name: string;
  body: string;
  head: string;
  ornamentation: string;
  categories: string[];

  constructor(
    name: string,
    body: string,
    head: string,
    ornamentation: string,
    categories: string[],
  ) {
    this.name = name;
    this.body = body;
    this.head = head;
    this.ornamentation = ornamentation;
    this.categories = categories;
  }
}

export class Material {
  name: string;
  category: string;

  constructor(name: string, category: string) {
    this.name = name;
    this.category = category;
  }
}

function getAllMaterialSets(): MaterialSet[] {
  return [
    new MaterialSet("wooden", "wood", "wood", "soft metal", ["staff", "bow", "crossbow"]),
    new MaterialSet("wood and metal", "wood", "hard metal", "soft metal", [
      "staff",
      "club",
      "hammer",
      "polearm",
      "scythe",
      "mace",
      "spear",
    ]),
    new MaterialSet("metal", "hard metal", "hard metal", "soft metal", [
      "sword",
      "knife",
      "dagger",
      "axe",
      "hammer",
      "flail",
      "armor",
    ]),
    new MaterialSet("leather", "leather", "leather", "leather", ["whip", "armor"]),
    new MaterialSet("leather and metal", "leather", "hard metal", "soft metal", ["whip", "armor"]),
    new MaterialSet("wood and stone", "wood", "stone", "soft metal", ["hammer"]),
  ];
}

function getAllMaterials(): Material[] {
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
    new Material("sapphire", "gemstone"),
  ];
}

export function getMaterialSetsForCategory(category: string) {
  const all = getAllMaterialSets();

  const result = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].categories.includes(category)) {
      result.push(all[i]);
    }
  }

  return result;
}

export function getMaterialsForCategory(category: string) {
  const all = getAllMaterials();

  const result = [];

  for (let i = 0; i < all.length; i++) {
    if (all[i].category == category) {
      result.push(all[i]);
    }
  }

  return result;
}

export function getRandomMaterialSetForCategory(category: string) {
  const options = getMaterialSetsForCategory(category);

  return RND.item(options);
}

export function getRandomMaterialForCategory(category: string) {
  const options = getMaterialsForCategory(category);

  return RND.item(options);
}
