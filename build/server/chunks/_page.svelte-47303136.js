import { c as create_ssr_component, e as escape, f as each } from './ssr-93f4de0f.js';
import './sentry-release-injection-file-e75cc0ec.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import random from 'random';
import seedrandom from 'seedrandom';

class WeaponGeneratorConfig {
  weaponTypes;
  constructor() {
    this.weaponTypes = [];
  }
}
class Weapon {
  name;
  maker;
  damage;
  effects;
  cosmetics;
  description;
  constructor() {
    this.name = "";
    this.maker = "";
    this.damage = "";
    this.effects = [];
    this.cosmetics = [];
    this.description = "";
  }
}
class WeaponGenerator {
  config;
  constructor() {
    this.config = new WeaponGeneratorConfig();
  }
  generate() {
    let weapon = new Weapon();
    let weaponType = RND.item(this.config.weaponTypes);
    weapon.damage = weaponType.damageType;
    weapon.effects = randomEffects(weaponType);
    weapon.cosmetics = randomCosmetics(weaponType);
    weapon.name = MUN.modelNumber() + " " + weaponType.name;
    weapon.description = describe(weapon, weaponType);
    return weapon;
  }
}
function describe(weapon, weaponType) {
  let description = RND.item(weaponType.bases) + " has ";
  description += Words.arrayToPhrase(weapon.effects) + " and ";
  description += Words.arrayToPhrase(weapon.cosmetics) + ". It ";
  description += weapon.effects + ".";
  return description;
}
function randomCosmetics(weaponType) {
  let cosmetics = [];
  const numberOfCosmetics = random.int(1, 3);
  let cosmeticList = [];
  for (const cosmetic of weaponType.cosmetics) {
    cosmeticList.push(cosmetic.name);
  }
  cosmeticList = RND.shuffle(cosmeticList);
  for (let i = 0; i < numberOfCosmetics; i++) {
    let cosmetic = cosmeticList.pop();
    let cosmeticComponent;
    for (const c of weaponType.cosmetics) {
      if (c.name === cosmetic) {
        cosmeticComponent = c;
      }
    }
    if (cosmeticComponent !== void 0) {
      cosmetics.push(RND.item(cosmeticComponent.options));
    }
  }
  return cosmetics;
}
function randomEffects(weaponType) {
  let effects = [];
  const numberOfEffects = random.int(1, 3);
  let effectList = [];
  for (const effect of weaponType.effects) {
    effectList.push(effect.name);
  }
  effectList = RND.shuffle(effectList);
  for (let i = 0; i < numberOfEffects; i++) {
    let effect = effectList.pop();
    let effectComponent;
    for (const e of weaponType.effects) {
      if (e.name === effect) {
        effectComponent = e;
      }
    }
    if (effectComponent !== void 0) {
      effects.push(RND.item(effectComponent.options));
    }
  }
  return effects;
}
class WeaponComponent {
  name;
  options;
  constructor() {
    this.name = "";
    this.options = [];
  }
}
class WeaponEffect {
  name;
  options;
  constructor() {
    this.name = "";
    this.options = [];
  }
}
class WeaponType {
  name;
  bases;
  cosmetics;
  effects;
  range;
  hands;
  damageType;
  constructor() {
    this.name = "";
    this.bases = [];
    this.cosmetics = [];
    this.effects = [];
    this.range = "";
    this.hands = 0;
    this.damageType = "";
  }
}
function newWeaponEffect(name, options) {
  let effect = new WeaponEffect();
  effect.name = name;
  effect.options = options;
  return effect;
}
function newWeaponComponent(name, options) {
  let component = new WeaponComponent();
  component.name = name;
  component.options = options;
  return component;
}
function newWeaponType(name, bases, cosmetics, effects, range, hands, damageType) {
  let weaponType = new WeaponType();
  weaponType.name = name;
  weaponType.bases = bases;
  weaponType.cosmetics = cosmetics;
  weaponType.effects = effects;
  weaponType.range = range;
  weaponType.hands = hands;
  weaponType.damageType = damageType;
  return weaponType;
}
const all = [
  newWeaponType(
    "energy rifle",
    [
      "This rifle",
      "This energy rifle",
      "This blaster rifle",
      "This energy carbine",
      "This carbine"
    ],
    [
      newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      newWeaponComponent("scope", ["advanced sighting", "a long scope", "a short scope"]),
      newWeaponComponent("stock", [
        "a short stock",
        "a clever stock",
        "a comfortable stock",
        "an extended stock"
      ]),
      newWeaponComponent("trigger", [
        "a hair trigger",
        "a double trigger",
        "a comfortable trigger"
      ])
    ],
    [
      newWeaponEffect("energy bolt", [
        "fires green bolts",
        "fires blue bolts",
        "fires red bolts",
        "fires yellow bolts",
        "fires purple bolts"
      ]),
      newWeaponEffect("sound", [
        "sounds like a buzzsaw",
        "has a high-pitched whine",
        "emits a rumbling sound"
      ]),
      newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "uses onboard AI to enhance accuracy",
        "has excellent accuracy"
      ])
    ],
    "long",
    2,
    "energy"
  ),
  newWeaponType(
    "energy pistol",
    ["This pistol", "This energy pistol", "This blaster pistol"],
    [
      newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      newWeaponComponent("trigger", [
        "a hair trigger",
        "a double trigger",
        "a comfortable trigger"
      ]),
      newWeaponComponent("grip", [
        "a comfortable grip",
        "a synthetic hide grip",
        "a biometric grip"
      ])
    ],
    [
      newWeaponEffect("energy bolt", [
        "fires green bolts",
        "fires blue bolts",
        "fires red bolts",
        "fires yellow bolts",
        "fires purple bolts"
      ]),
      newWeaponEffect("sound", [
        "is very quiet",
        "has a high-pitched firing sound",
        "emits a low sound when it fires"
      ]),
      newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "has good accuracy"
      ])
    ],
    "short",
    1,
    "energy"
  ),
  newWeaponType(
    "pistol",
    ["This pistol", "This revolver", "This sidearm"],
    [
      newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      newWeaponComponent("trigger", [
        "a hair trigger",
        "a comfortable trigger",
        "a sensitive trigger"
      ]),
      newWeaponComponent("grip", [
        "a comfortable grip",
        "a synthetic hide grip",
        "a biometric grip"
      ])
    ],
    [
      newWeaponEffect("ammunition", [
        "fires light rounds",
        "fires heavy rounds",
        "fires armor-piercing rounds",
        "fires incendiary rounds"
      ]),
      newWeaponEffect("sound", [
        "is very quiet",
        "has a reverberating firing sound",
        "is loud when it fires"
      ]),
      newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "has good accuracy"
      ])
    ],
    "short",
    1,
    "projectile"
  ),
  newWeaponType(
    "rifle",
    [
      "This rifle",
      "This assault rifle",
      "This sniper rifle",
      "This assault carbine",
      "This carbine"
    ],
    [
      newWeaponComponent("barrel", ["an extended barrel", "a short barrel", "a grooved barrel"]),
      newWeaponComponent("scope", [
        "advanced sighting",
        "a long scope",
        "a nightvision scope",
        "a short scope"
      ]),
      newWeaponComponent("stock", [
        "a short stock",
        "a clever stock",
        "a comfortable stock",
        "an extended stock",
        "a collapsible stock"
      ]),
      newWeaponComponent("trigger", [
        "a hair trigger",
        "a double trigger",
        "a comfortable trigger"
      ])
    ],
    [
      newWeaponEffect("ammunition", [
        "fires light rounds",
        "fires heavy rounds",
        "fires armor-piercing rounds",
        "fires anti-vehicular rounds",
        "fires incendiary rounds",
        "fires high explosive rounds"
      ]),
      newWeaponEffect("sound", [
        "sounds like a cannon",
        "has a high-pitched firing sound",
        "echoes when it fires"
      ]),
      newWeaponEffect("recoil", ["kicks hard", "has no recoil", "has a slight recoil"]),
      newWeaponEffect("accuracy", [
        "has poor accuracy",
        "has excellent accuracy",
        "uses onboard AI to enhance accuracy",
        "has excellent accuracy"
      ])
    ],
    "long",
    2,
    "projectile"
  )
];
class ArmsManufacturer {
  name;
  description;
  models;
  constructor(name, description, models) {
    this.name = name;
    this.description = description;
    this.models = models;
  }
}
class ArmsManufacturerGenerator {
  generate() {
    return generate();
  }
}
function generate() {
  const name = randomName();
  let description = `${name} `;
  const specialty = RND.item(all);
  let secondaryOptions = all.filter((wType) => wType.name !== specialty.name);
  const secondary = RND.item(secondaryOptions);
  description += RND.item([
    ` specializes in ${specialty.name}s. `,
    ` is known for their ${specialty.name}s. `
  ]);
  description += randomOutlook();
  description += randomReputation();
  let models = [];
  const numberOfPrimary = random.int(3, 4);
  let generator = new WeaponGenerator();
  let config = new WeaponGeneratorConfig();
  config.weaponTypes = [specialty];
  generator.config = config;
  for (let i = 0; i < numberOfPrimary; i++) {
    let model = generator.generate();
    models.push(model);
  }
  config.weaponTypes = [secondary];
  generator.config = config;
  const numberOfSecondary = random.int(0, 2);
  for (let i = 0; i < numberOfSecondary; i++) {
    let model = generator.generate();
    models.push(model);
  }
  return new ArmsManufacturer(name, description, models);
}
function randomOutlook() {
  return RND.item([
    " They focus exclusively on quality, and their products are very expensive.",
    " They focus heavily on reliability.",
    " They are devoted to profit above all else and their products are lower in quality.",
    " They pride themselves on their workmanship."
  ]);
}
function randomReputation() {
  return RND.item([
    " Their products are widely regarded as the standard to beat.",
    " Their products have a following among bounty hunters and mercenaries.",
    " Their products are well-regarded by military powers.",
    " They sometimes suffer derision because of their attitude.",
    " Their market presence is almost nonexistent.",
    " Some black markets focus exclusively on their products."
  ]);
}
function randomName() {
  const patterns = ["pvlul", "vpvfv"];
  let nameFragment = MUN.invent(patterns);
  const suffixes = [
    "Heavy Industries",
    "Arms, Limited",
    "Incorporated",
    "Consolidated",
    "Corporation",
    "Applied Sciences"
  ];
  let suffix = RND.item(suffixes);
  return `${nameFragment} ${suffix}`;
}
const css = {
  code: 'div.svelte-1cxb4fd.svelte-1cxb4fd,h1.svelte-1cxb4fd.svelte-1cxb4fd,h2.svelte-1cxb4fd.svelte-1cxb4fd,h3.svelte-1cxb4fd.svelte-1cxb4fd,p.svelte-1cxb4fd.svelte-1cxb4fd,section.svelte-1cxb4fd.svelte-1cxb4fd{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-1cxb4fd.svelte-1cxb4fd{display:block}.scifi.svelte-1cxb4fd.svelte-1cxb4fd{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-1cxb4fd h1.svelte-1cxb4fd,.scifi.svelte-1cxb4fd h2.svelte-1cxb4fd,.scifi.svelte-1cxb4fd h3.svelte-1cxb4fd{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-1cxb4fd button.svelte-1cxb4fd{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-1cxb4fd button.svelte-1cxb4fd:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-1cxb4fd button.svelte-1cxb4fd:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let generator = new ArmsManufacturerGenerator();
  let manufacturer = generator.generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1ecg6n2_START -->${$$result.title = `<title>Arms Manufacturer Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1ecg6n2_END -->`, ""}  <section class="scifi main svelte-1cxb4fd"><h1 class="svelte-1cxb4fd" data-svelte-h="svelte-1wwbb1h">Arms Manufacturer Generator</h1> <p class="svelte-1cxb4fd" data-svelte-h="svelte-1idwd1x">This generator produces sci-fi arms manufacturing companies.</p> <button class="svelte-1cxb4fd" data-svelte-h="svelte-41x9ys">Generate</button> <p class="svelte-1cxb4fd">${escape(manufacturer.description)}</p> <h2 class="svelte-1cxb4fd" data-svelte-h="svelte-s6b5fg">Models</h2> ${each(manufacturer.models, (model) => {
    return `<div class="svelte-1cxb4fd"><h3 class="svelte-1cxb4fd">${escape(model.name)}</h3> <p class="svelte-1cxb4fd">${escape(model.description)}</p> </div>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-47303136.js.map
