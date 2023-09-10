import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import random from 'random';
import './sentry-release-injection-file-e75cc0ec.js';

class Component {
  name;
  description;
  descriptor;
  category;
  subType;
  value;
  quality;
  tags;
  constructor(name, description, descriptor, category, subType, value, quality, tags) {
    this.name = name;
    this.description = description;
    this.descriptor = descriptor;
    this.category = category;
    this.subType = subType;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
function all$8() {
  return [
    new Component(
      "cow leather",
      "a circle of cow leather",
      "cow leather",
      "leather",
      "hard leather",
      1,
      0,
      ["leather"]
    ),
    new Component(
      "bull leather",
      "a circle of bull leather",
      "bull leather",
      "leather",
      "hard leather",
      2,
      1,
      ["leather"]
    ),
    new Component(
      "steer leather",
      "a circle of steer leather",
      "steer leather",
      "leather",
      "hard leather",
      20,
      1,
      ["leather"]
    ),
    new Component("pig hide", "a circle of pig hide", "pig hide", "leather", "hard leather", 1, 0, [
      "leather"
    ]),
    new Component(
      "deer hide",
      "a circle of deer hide",
      "deer hide",
      "leather",
      "soft leather",
      1,
      0,
      ["leather"]
    ),
    new Component(
      "goat hide",
      "a circle of goat hide",
      "goat hide",
      "leather",
      "soft leather",
      1,
      0,
      ["leather"]
    ),
    new Component(
      "sheep hide",
      "a circle of sheep hide",
      "sheep hide",
      "leather",
      "soft leather",
      1,
      0,
      ["leather"]
    ),
    new Component(
      "shark skin",
      "a circle of shark skin",
      "shark skin",
      "leather",
      "soft leather",
      30,
      2,
      ["leather"]
    ),
    new Component(
      "dragon hide",
      "a circle of dragon hide",
      "dragon hide",
      "leather",
      "hard leather",
      500,
      4,
      ["leather"]
    ),
    new Component(
      "wyvern hide",
      "a circle of wyvern hide",
      "wyvern hide",
      "leather",
      "hard leather",
      100,
      4,
      ["leather"]
    ),
    new Component("bone", "a length of bone", "bone", "bone", "animal bone", 1, 0, ["bone"])
  ];
}
function all$7() {
  return [
    new Component("cotton", "a bolt of cotton fabric", "cotton", "fabric", "coarse fabric", 1, 0, [
      "fabric"
    ]),
    new Component("linen", "a bolt of linen fabric", "linen", "fabric", "coarse fabric", 10, 0, [
      "fabric"
    ]),
    new Component("wool", "a bolt of woolen fabric", "wool", "fabric", "coarse fabric", 15, 0, [
      "fabric"
    ]),
    new Component("silk", "a bolt of silk fabric", "silk", "fabric", "fine fabric", 40, 2, [
      "fabric"
    ]),
    new Component(
      "fine silk",
      "a bolt of fine silk fabric",
      "fine silk",
      "fabric",
      "fine fabric",
      80,
      3,
      ["fabric"]
    )
  ];
}
function all$6() {
  return [
    new Component("tin bar", "a bar of tin", "tin", "metal", "soft metal", 1, 0, ["metal"]),
    new Component("copper bar", "a bar of copper", "copper", "metal", "soft metal", 5, 0, [
      "metal"
    ]),
    new Component("silver bar", "a bar of silver", "silver", "metal", "soft metal", 50, 2, [
      "metal"
    ]),
    new Component("gold bar", "a bar of gold", "gold", "metal", "soft metal", 5e3, 3, ["metal"]),
    new Component(
      "white gold bar",
      "a bar of white gold",
      "white gold",
      "metal",
      "soft metal",
      5e3,
      4,
      ["metal"]
    ),
    new Component("brass bar", "a bar of brass", "brass", "metal", "soft metal", 10, 0, ["metal"]),
    new Component("bronze bar", "a bar of bronze", "bronze", "metal", "soft metal", 2, 0, [
      "metal"
    ]),
    new Component("iron bar", "a bar of iron", "iron", "metal", "hard metal", 10, 1, ["metal"]),
    new Component("steel bar", "a bar of steel", "steel", "metal", "hard metal", 20, 2, ["metal"]),
    new Component(
      "adamantine bar",
      "a bar of adamantine",
      "adamantine",
      "metal",
      "hard metal",
      1e4,
      4,
      ["metal"]
    ),
    new Component("mithril bar", "a bar of mithril", "mithril", "metal", "hard metal", 8e3, 4, [
      "metal"
    ]),
    new Component("titanium bar", "a bar of titanium", "titanium", "metal", "hard metal", 7500, 4, [
      "metal"
    ])
  ];
}
function all$5() {
  return [
    new Component("pine wood", "a log of pine", "pine", "wood", "soft wood", 1, 0, ["wood"]),
    new Component("cedar wood", "a log of cedar", "cedar", "wood", "soft wood", 2, 0, ["wood"]),
    new Component("aspen wood", "a log of aspen", "aspen", "wood", "soft wood", 2, 0, ["wood"]),
    new Component("fir wood", "a log of fir", "fir", "wood", "soft wood", 10, 1, ["wood"]),
    new Component(
      "white cedar wood",
      "a log of white cedar",
      "white cedar",
      "wood",
      "soft wood",
      25,
      0,
      ["wood"]
    ),
    new Component(
      "silver fir wood",
      "a log of silver fir",
      "silver fir",
      "wood",
      "soft wood",
      10,
      1,
      ["wood"]
    ),
    new Component("poplar wood", "a log of poplar", "poplar", "wood", "soft wood", 1, 0, ["wood"]),
    new Component("oak wood", "a log of oak", "oak", "wood", "hard wood", 1, 0, ["wood"]),
    new Component("maple wood", "a log of maple", "maple", "wood", "hard wood", 30, 2, ["wood"]),
    new Component("walnut wood", "a log of walnut", "walnut", "wood", "hard wood", 1, 0, ["wood"]),
    new Component("cherry wood", "a log of cherry", "cherry", "wood", "hard wood", 20, 2, ["wood"]),
    new Component("birch wood", "a log of birch", "birch", "wood", "hard wood", 5, 1, ["wood"]),
    new Component("ironwood", "a log of ironwood", "ironwood", "wood", "hard wood", 60, 3, [
      "wood"
    ]),
    new Component("blackwood", "a log of blackwood", "blackwood", "wood", "hard wood", 50, 3, [
      "wood"
    ]),
    new Component("ebony", "a log of ebony", "ebony", "wood", "hard wood", 80, 2, ["wood"])
  ];
}
function all$4() {
  let result = [];
  result.push(...all$8());
  result.push(...all$7());
  result.push(...all$6());
  result.push(...all$5());
  return result;
}
function withCategory(category, components) {
  let result = [];
  for (let i = 0; i < components.length; i++) {
    if (components[i].category == category || components[i].subType == category) {
      result.push(components[i]);
    }
  }
  return result;
}
function withMinQuality(quality, components) {
  let result = [];
  for (let i = 0; i < components.length; i++) {
    if (components[i].quality >= quality) {
      result.push(components[i]);
    }
  }
  return result;
}
function withMaxQuality(quality, components) {
  let result = [];
  for (let i = 0; i < components.length; i++) {
    if (components[i].quality <= quality) {
      result.push(components[i]);
    }
  }
  return result;
}
class MeleeWeapon {
  name;
  description;
  damage;
  hands;
  value;
  quality;
  tags;
  constructor(name, description, damage, hands, value, quality, tags) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.hands = hands;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
class Armor {
  name;
  description;
  areaOfBody;
  armorClass;
  value;
  quality;
  tags;
  constructor(name, description, areaOfBody, armorClass, value, quality, tags) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.armorClass = armorClass;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
class BreastplatePattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "body armor", "armor"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("metal", componentOptions));
    let trim = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value * 1e3 + trim.value;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `
    ]);
    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(["trim", "edging"])}`,
      ` trimmed with ${trim.descriptor}`,
      ` decorated with ${trim.descriptor} edging`
    ]);
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` with overlapping plates`,
        ` with rolled edges`,
        ` with ornate engravings`
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let armorClass = 14;
    let tags = [name, this.name, "breastplate", "armor"];
    return new Armor(name, description, "torso", armorClass, value, quality, tags);
  }
}
class ChainmailPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "body armor", "armor"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("metal", componentOptions));
    let value = this.baseValue + body.value * 500;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(this.name)} ${this.name} made of ${RND.item([
        "loose ",
        "tight ",
        "dense ",
        "heavy ",
        ""
      ])}${body.descriptor} rings`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name}`
    ]);
    let name = `${body.descriptor} ${this.name}`;
    if (quality > 1) {
      description += RND.item([" and decorative belting"]);
    }
    let armorClass = 16;
    let tags = [name, this.name, "chainmail", "armor"];
    return new Armor(name, description, "torso", armorClass, value, quality, tags);
  }
}
class HelmetPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "helmet", "armor"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("metal", componentOptions));
    let trim = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value * 10 + trim.value;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `
    ]);
    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(["trim", "edging"])}`,
      ` trimmed with ${trim.descriptor}`
    ]);
    if (quality > 1) {
      description += RND.item([" and set with jewels"]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let armorClass = 1;
    let tags = [name, this.name, "helmet", "armor"];
    return new Armor(name, description, "head", armorClass, value, quality, tags);
  }
}
class LeatherArmorPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "body armor", "armor"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("hard leather", componentOptions));
    let trim = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value * 1e3 + trim.value;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `
    ]);
    description += RND.item([
      ` with ${trim.descriptor} ${RND.item([
        "hardware",
        "fasteners",
        "banding",
        "studs",
        "rivets"
      ])}`,
      ` fastened with ${trim.descriptor} ${RND.item(["buckles", "clasps"])}`
    ]);
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        `, with integrated sleeves`,
        `, with ${RND.item(["embossed patterns", "a lacquered finish"])}`
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "body armor", "armor"];
    let armorClass = 11 + random.int(0, 1);
    return new Armor(name, description, "torso", armorClass, value, quality, tags);
  }
}
class PrimitiveShieldPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "shield"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("wood", componentOptions));
    let handle = RND.item(withCategory("wood", componentOptions));
    let trim = RND.item(withCategory("leather", componentOptions));
    let value = this.baseValue + body.value * 5 + trim.value;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `
    ]);
    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(["trim", "edging"])}`,
      ` trimmed with ${trim.descriptor}`
    ]);
    description += RND.item([` and a ${handle.descriptor} handle`, ""]);
    if (quality > 1) {
      description += RND.item([" and decorated with bone"]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let armorClass = 1;
    let tags = [name, this.name, "shield", "armor"];
    return new Armor(name, description, "arm", armorClass, value, quality, tags);
  }
}
class ShieldPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "shield"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("metal", componentOptions));
    let handle = RND.item(withCategory("wood", componentOptions));
    let trim = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value * 5 + trim.value;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor}`,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `
    ]);
    description += RND.item([
      ` with ${trim.descriptor} ${RND.item(["trim", "edging"])}`,
      ` trimmed with ${trim.descriptor}`
    ]);
    description += RND.item([` and a ${handle.descriptor} handle`, ""]);
    if (quality > 1) {
      description += RND.item([" and decorated with spikes"]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let armorClass = 1;
    let tags = [name, this.name, "shield", "armor"];
    return new Armor(name, description, "arm", armorClass, value, quality, tags);
  }
}
function all$3() {
  return [
    new BreastplatePattern("breastplate", 4e4),
    new BreastplatePattern("corrugated breastplate", 45e3),
    new BreastplatePattern("cuirass", 4e4),
    new BreastplatePattern("Gothic cuirass", 5e4),
    new BreastplatePattern("plate cuirass", 4e4),
    new BreastplatePattern("skirted breastplate", 45e3),
    new ChainmailPattern("chain hauberk", 5500),
    new ChainmailPattern("chain shirt", 4500),
    new ChainmailPattern("chain vest", 4500),
    new HelmetPattern("armet", 500),
    new HelmetPattern("bascinet", 1e3),
    new HelmetPattern("great helm", 500),
    new HelmetPattern("kettle helm", 500),
    new HelmetPattern("nasal helm", 500),
    new HelmetPattern("pot helm", 500),
    new HelmetPattern("spangenhelm", 500),
    new LeatherArmorPattern("brigandine", 1e3),
    new LeatherArmorPattern("cuirass", 1e3),
    new PrimitiveShieldPattern("round shield", 1e3),
    new PrimitiveShieldPattern("square shield", 1e3),
    new ShieldPattern("heater shield", 1e3),
    new ShieldPattern("kite shield", 1e3),
    new ShieldPattern("targé shield", 1e3)
  ];
}
class Clothing {
  name;
  description;
  areaOfBody;
  value;
  quality;
  tags;
  constructor(name, description, areaOfBody, value, quality, tags) {
    this.name = name;
    this.description = description;
    this.areaOfBody = areaOfBody;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
class BeltPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "belt", "clothing"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("leather", componentOptions));
    let hardware = RND.item(withCategory("metal", componentOptions));
    let value = this.baseValue + body.value + hardware.value;
    let description = RND.item([
      `${Words.article(this.name)} ${this.name} `,
      `${Words.article(this.name)} ${this.name} made of ${body.descriptor} `,
      `${Words.article(body.descriptor)} ${body.descriptor} ${this.name} `
    ]);
    description += `with ${Words.article(hardware.descriptor)} ${hardware.descriptor} ${RND.item([
      "clasp",
      "buckle",
      "closure"
    ])}`;
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embossed with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        ` that has decorative stitching down the sides`
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "belt", "clothing"];
    return new Clothing(name, description, "waist", value, quality, tags);
  }
}
class DressPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "dress", "clothing"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("fabric", componentOptions));
    let value = this.baseValue + body.value * 2;
    let description = `${Words.article(this.name)} ${this.name} `;
    description += RND.item([`made of ${body.descriptor} `, ""]);
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        " that is artfully embroidered",
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        " that is gusseted"
      ]);
    }
    description += " with ";
    let sleeves = RND.item(["short", "long", "wide", "narrow", "bunched", "volumnous", "no"]) + " sleeves";
    let lacing = RND.item(["tight ", "", "double ", "wide "]) + "lacing " + RND.item(["down the middle", "at the top", "halfway down", "down the back"]);
    let neck = RND.item(["a wide neck", "a v-neck", "a deep neck"]);
    let waist = RND.item(["a tight waist", "a narrow waist", "a cinched waist", "a belted waist"]);
    description += RND.item([sleeves, lacing, neck, waist]);
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "dress", "clothing"];
    return new Clothing(name, description, "torso", value, quality, tags);
  }
}
class PantsPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "bottom", "pants", "clothing"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("fabric", componentOptions));
    let hardware = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value + hardware.value;
    let description = `${this.name} `;
    description += RND.item([`made of ${body.descriptor} with `, "with "]);
    let lacing = ` ${RND.item(["tight", "loose", ""])} lacing`;
    let closures = RND.item(["dull", "embossed", "rough", "shiny", "round", "square"]) + ` ${hardware.descriptor} ` + RND.item(["buttons", "clasps"]);
    description += RND.item([lacing, closures]);
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        ` that has decorative stitching down the sides`
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "bottom", "pants", "clothing"];
    return new Clothing(name, description, "legs", value, quality, tags);
  }
}
class RobePattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "outer", "clothing"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("fabric", componentOptions));
    let hardware = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value + hardware.value;
    let description = `${Words.article(this.name)} ${this.name} `;
    description += RND.item([`made of ${body.descriptor} with `, "with "]);
    let sleeves = RND.item(["short", "long", "wide", "narrow", "bunched", "volumnous"]) + " sleeves";
    let lacing = "lacing " + RND.item(["down the middle", "at the top", "halfway down"]);
    let collar = `a ${RND.item(["wide", "tight", "open"])} collar`;
    let closures = RND.item(["dull", "embossed", "rough", "shiny", "round", "square"]) + ` ${hardware.descriptor} ` + RND.item(["buttons", "clasps"]);
    description += RND.item([sleeves, collar, lacing, closures]);
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        " that is artfully embroidered",
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        " that is gusseted"
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "outer", "clothing"];
    return new Clothing(name, description, "torso", value, quality, tags);
  }
}
class TopPattern {
  name;
  tags;
  baseValue;
  constructor(name, value) {
    this.name = name;
    this.tags = [name, "top", "clothing"];
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("fabric", componentOptions));
    let hardware = RND.item(withCategory("soft metal", componentOptions));
    let value = this.baseValue + body.value + hardware.value;
    let description = `${Words.article(this.name)} ${this.name} `;
    description += RND.item([`made of ${body.descriptor} with `, "with "]);
    let sleeves = RND.item(["short", "long", "wide", "narrow", "bunched", "volumnous"]) + " sleeves";
    let lacing = "lacing " + RND.item(["down the middle", "at the top", "halfway down"]);
    let collar = `a ${RND.item(["wide", "tight", "open"])} collar`;
    let closures = RND.item(["dull", "embossed", "rough", "shiny", "round", "square"]) + ` ${hardware.descriptor} ` + RND.item(["buttons", "clasps"]);
    description += RND.item([sleeves, collar, lacing, closures]);
    if (quality > 1 && random.int(1, 100) >= 70) {
      description += RND.item([
        " that is artfully embroidered",
        ` that is embroidered with ${RND.item(["simple", "complex", "ornate"])} patterns`,
        " that is gusseted"
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "top", "clothing"];
    return new Clothing(name, description, "torso", value, quality, tags);
  }
}
function all$2() {
  return [
    new BeltPattern("belt", 1),
    new DressPattern("short dress", 2),
    new DressPattern("long dress", 2),
    new DressPattern("wedding dress", 10),
    new DressPattern("tight dress", 2),
    new DressPattern("loose dress", 3),
    new PantsPattern("trews", 1),
    new PantsPattern("pants", 1),
    new PantsPattern("brais", 1),
    new PantsPattern("breeches", 1),
    new PantsPattern("trousers", 1),
    new RobePattern("robe", 2),
    new TopPattern("shirt", 1),
    new TopPattern("short tunic", 2),
    new TopPattern("long tunic", 2)
  ];
}
class AxePattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "axe", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let blade = RND.item(withCategory("hard metal", componentOptions));
    let handle = RND.item(withCategory("wood", componentOptions));
    let value = this.baseValue + blade.value * 2 + handle.value;
    let cosmeticBlade = RND.item([
      "serrated",
      "recently sharpened",
      "curved",
      "straight",
      "broad",
      "wide",
      "wickedly curved"
    ]);
    let cosmeticHandle = RND.item(["carved", "padded", "embossed", "sanded"]);
    if (value < 1e3) {
      cosmeticBlade = RND.item(["simple", "straight", "worn"]);
      cosmeticHandle = RND.item(["rough", "worn"]);
    }
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade`
    ]);
    description += RND.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`
    ]);
    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        `, with a ` + RND.item(["yellow", "blue", "red", "purple", "green", "grey", "white", "black"]) + ` ribbon ` + RND.item(["wrapped around it", "trailing from it", "tied to it"]),
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(["gold", "silver", "copper", "brass"])}`
      ]);
    }
    let name = `${blade.descriptor} ${this.name}`;
    let tags = [name, this.name, "axe", "melee", "simple weapon", "bladed weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
class RangedWeapon {
  name;
  description;
  damage;
  shortRange;
  longRange;
  ammunitionType;
  hands;
  value;
  quality;
  tags;
  constructor(name, description, damage, shortRange, longRange, ammunitionType, hands, value, quality, tags) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.shortRange = shortRange;
    this.longRange = longRange;
    this.ammunitionType = ammunitionType;
    this.hands = hands;
    this.value = value;
    this.quality = quality;
    this.tags = tags;
  }
}
class BowPattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "bow", "ranged", "martial weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("soft wood", componentOptions));
    let handle = RND.item(withCategory("leather", componentOptions));
    let cosmeticBody = RND.item(["carved", "heavy", "light", "simple"]);
    let cosmeticHandle = RND.item(["short", "long", "comfortable"]);
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`
    ]);
    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped grip`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped grip`
    ]);
    if (quality > 1) {
      description += RND.item([" and gilt highlights"]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let value = this.baseValue + body.value + handle.value;
    let tags = [name, this.name, "bow", "ranged", "martial weapon", "weapon"];
    return new RangedWeapon(
      name,
      description,
      this.damage,
      80,
      320,
      "arrow",
      this.hands,
      value,
      quality,
      tags
    );
  }
}
class ClubPattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "club", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("wood", componentOptions));
    let handle = RND.item(withCategory("leather", componentOptions));
    let cosmeticBody = RND.item(["carved", "spiked", "heavy", "bulbous", "square"]);
    let cosmeticHandle = RND.item(["short", "long", "comfortable", "broad"]);
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`
    ]);
    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped handle`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped handle`
    ]);
    let name = `${body.descriptor} ${this.name}`;
    let value = this.baseValue + body.value + handle.value;
    let tags = [name, this.name, "club", "melee", "simple weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
class KnifePattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "knife", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let blade = RND.item(withCategory("hard metal", componentOptions));
    let hilt = RND.item(withCategory("hard metal", componentOptions));
    let handle = RND.item(withCategory("wood", componentOptions));
    let value = this.baseValue + blade.value + hilt.value + handle.value;
    let cosmeticBlade = RND.item([
      "serrated",
      "recently sharpened",
      "curved",
      "straight",
      "single-edged",
      "wide",
      "grooved"
    ]);
    let cosmeticHandle = RND.item(["carved", "padded", "embossed"]);
    let cosmeticHilt = RND.item(["gem-studded", "spiked", "curved", "inlaid"]);
    if (value < 2e3) {
      cosmeticBlade = RND.item(["simple", "straight", "worn"]);
      cosmeticHandle = RND.item(["rough", "worn"]);
      cosmeticHilt = RND.item(["simple", "unadorned", "straight"]);
    }
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade,`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade,`
    ]);
    description += RND.item([
      ` ${hilt.descriptor} hilt,`,
      ` ${cosmeticHilt} ${hilt.descriptor} hilt,`
    ]);
    description += RND.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`
    ]);
    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        `, with a ` + RND.item(["yellow", "blue", "red", "purple", "green", "grey", "white", "black"]) + ` ribbon ` + RND.item(["wrapped around it", "trailing from it", "tied to it"]),
        `, with a ${RND.item([
          "leather thong",
          RND.item(["gold", "brass", "silver", "iron"]) + " chain"
        ])} attached to the pommel`,
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(["gold", "silver", "copper", "brass"])}`
      ]);
    }
    let name = `${blade.descriptor} ${this.name}`;
    let tags = [name, this.name, "knife", "melee", "simple weapon", "bladed weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
class MacePattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "mace", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let head = RND.item(withCategory("metal", componentOptions));
    let haft = RND.item(withCategory("wood", componentOptions));
    let handle = RND.item(withCategory("leather", componentOptions));
    let value = this.baseValue + head.value + haft.value + handle.value;
    let cosmeticHead = RND.item(["carved", "spiked", "heavy", "large", "dense"]);
    let cosmeticHaft = RND.item(["straight", "short", "long"]);
    let cosmeticHandle = RND.item(["short", "long", "comfortable", "broad"]);
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(head.descriptor)} ${head.descriptor} head,`,
      `${Words.article(cosmeticHead)} ${cosmeticHead} ${head.descriptor} head,`
    ]);
    description += RND.item([
      ` ${Words.article(haft.descriptor)} ${haft.descriptor} haft,`,
      ` ${Words.article(cosmeticHaft)} ${cosmeticHaft} ${haft.descriptor} haft,`
    ]);
    description += RND.item([
      ` and ${Words.article(handle.descriptor)} ${handle.descriptor} wrapped handle`,
      ` and ${Words.article(cosmeticHandle)} ${cosmeticHandle} ${handle.descriptor} wrapped handle`
    ]);
    let name = `${head.descriptor} ${this.name}`;
    let tags = [name, this.name, "mace", "melee", "simple weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
class SpearPattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "spear", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let blade = RND.item(withCategory("metal", componentOptions));
    let body = RND.item(withCategory("wood", componentOptions));
    let value = this.baseValue + blade.value + body.value;
    let cosmeticBlade = RND.item([
      "serrated",
      "recently sharpened",
      "curved",
      "straight",
      "single-edged",
      "wide",
      "grooved"
    ]);
    let cosmeticBody = RND.item(["carved", "padded", "embossed"]);
    if (value < 2e3) {
      cosmeticBlade = RND.item(["simple", "straight", "worn"]);
      cosmeticBody = RND.item(["rough", "worn"]);
    }
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade`
    ]);
    description += RND.item([
      ` and ${body.descriptor} body`,
      ` and ${cosmeticBody} ${body.descriptor} body`
    ]);
    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        `, with a ` + RND.item(["yellow", "blue", "red", "purple", "green", "grey", "white", "black"]) + ` ribbon ` + RND.item(["wrapped around it", "trailing from it", "tied to it"]),
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(["gold", "silver", "copper", "brass"])}`
      ]);
    }
    let name = `${blade.descriptor} ${this.name}`;
    let tags = [name, this.name, "spear", "melee", "simple weapon", "bladed weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
class StaffPattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "staff", "melee", "simple weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let body = RND.item(withCategory("wood", componentOptions));
    let cosmeticBody = RND.item(["carved", "engraved", "stained", "painted"]);
    let value = this.baseValue + body.value;
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(body.descriptor)} ${body.descriptor} body`,
      `${Words.article(cosmeticBody)} ${cosmeticBody} ${body.descriptor} body`
    ]);
    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        ` topped with a ${RND.item([
          "crystal globe",
          "raw crystal",
          "rough crystal",
          "polished crystal"
        ])}`,
        ` capped on top and bottom with ${RND.item([
          "steel",
          "gold",
          "silver",
          "bronze",
          "brass",
          "iron",
          "tin"
        ])}`
      ]);
    }
    let name = `${body.descriptor} ${this.name}`;
    let tags = [name, this.name, "staff", "melee", "simple weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
class SwordPattern {
  name;
  tags;
  hands;
  baseValue;
  damage;
  constructor(name, hands, damage, value) {
    this.name = name;
    this.tags = [name, "sword", "melee", "martial weapon", "weapon"];
    this.hands = hands;
    this.damage = damage;
    this.baseValue = value;
  }
  complete(componentOptions, quality) {
    let blade = RND.item(withCategory("metal", componentOptions));
    let hilt = RND.item(withCategory("metal", componentOptions));
    let handle = RND.item(withCategory("wood", componentOptions));
    let value = this.baseValue + blade.value * 2 + hilt.value + handle.value;
    let cosmeticBlade = RND.item([
      "serrated",
      "recently sharpened",
      "curved",
      "straight",
      "single-edged",
      "wide",
      "grooved"
    ]);
    let cosmeticHandle = RND.item(["carved", "padded", "embossed"]);
    let cosmeticHilt = RND.item(["gem-studded", "spiked", "curved", "inlaid"]);
    if (quality < 2) {
      cosmeticBlade = RND.item(["simple", "straight", "worn"]);
      cosmeticHandle = RND.item(["rough", "worn"]);
      cosmeticHilt = RND.item(["simple", "unadorned", "straight"]);
    }
    let description = `${Words.article(this.name)} ${this.name} with `;
    description += RND.item([
      `${Words.article(blade.descriptor)} ${blade.descriptor} blade,`,
      `${Words.article(cosmeticBlade)} ${cosmeticBlade} ${blade.descriptor} blade,`
    ]);
    description += RND.item([
      ` ${hilt.descriptor} hilt,`,
      ` ${cosmeticHilt} ${hilt.descriptor} hilt,`
    ]);
    description += RND.item([
      ` and ${handle.descriptor} handle`,
      ` and ${cosmeticHandle} ${handle.descriptor} handle`
    ]);
    if (quality > 1 && random.int(1, 100) > 70) {
      description += RND.item([
        `, with a ` + RND.item(["yellow", "blue", "red", "purple", "green", "grey", "white", "black"]) + ` ribbon ` + RND.item(["wrapped around it", "trailing from it", "tied to it"]),
        `, with a ${RND.item([
          "leather thong",
          RND.item(["gold", "brass", "silver", "iron"]) + " chain"
        ])} attached to the pommel`,
        `, exquisitely crafted`,
        ` inlaid with ${RND.item(["gold", "silver", "copper", "brass"])}`
      ]);
    }
    let name = `${blade.descriptor} ${this.name}`;
    let tags = [name, this.name, "sword", "melee", "martial weapon", "bladed weapon", "weapon"];
    return new MeleeWeapon(name, description, this.damage, this.hands, value, quality, tags);
  }
}
function all$1() {
  return [
    new AxePattern("battleaxe", 1, "1d8", 1e3),
    new AxePattern("greataxe", 1, "1d12", 3e3),
    new AxePattern("handaxe", 1, "1d6", 500),
    new BowPattern("longbow", 2, "2d8", 5e3),
    new BowPattern("shortbow", 2, "1d6", 2500),
    new ClubPattern("club", 1, "1d4", 10),
    new ClubPattern("greatclub", 2, "1d8", 20),
    new KnifePattern("dagger", 1, "1d4", 200),
    new KnifePattern("knife", 1, "1d4", 200),
    new KnifePattern("long knife", 1, "1d4", 200),
    new MacePattern("heavy mace", 2, "1d8", 200),
    new MacePattern("mace", 1, "1d6", 100),
    new MacePattern("morningstar", 1, "1d6", 100),
    new SpearPattern("spear", 2, "1d6", 100),
    new StaffPattern("quarterstaff", 2, "1d6", 20),
    new StaffPattern("staff", 2, "1d6", 20),
    new SwordPattern("great sword", 2, "2d6", 5e3),
    new SwordPattern("long sword", 1, "1d8", 1500),
    new SwordPattern("rapier", 1, "1d8", 2500),
    new SwordPattern("scimitar", 1, "1d6", 2500),
    new SwordPattern("short sword", 1, "1d6", 1e3)
  ];
}
function all() {
  let result = [];
  result.push(...all$3());
  result.push(...all$2());
  result.push(...all$1());
  return result;
}
function byName(name) {
  let options = all();
  for (const option of options) {
    if (option.name == name) {
      return option;
    }
  }
  throw new Error(`Couldn't find pattern with name ${name}`);
}
function forCategory(category) {
  let options = all();
  let result = [];
  for (let i = 0; i < options.length; i++) {
    if (options[i].tags.includes(category)) {
      result.push(options[i]);
    }
  }
  return result;
}

export { MeleeWeapon as M, all as a, all$4 as b, withMinQuality as c, byName as d, forCategory as f, withMaxQuality as w };
//# sourceMappingURL=patterns-afdbc38f.js.map
