import { c as create_ssr_component, b as add_attribute, e as escape } from './ssr-93f4de0f.js';
import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import random from 'random';
import './sentry-release-injection-file-e75cc0ec.js';
import seedrandom from 'seedrandom';

class DrugType {
  name;
  methods;
  constructor(name, methods) {
    this.name = name;
    this.methods = methods;
  }
}
class EffectType {
  name;
  effects;
  constructor(name, effects) {
    this.name = name;
    this.effects = effects;
  }
}
class Drug {
  name;
  drugType;
  method;
  effectType;
  effectDescription;
  strength;
  color;
  duration;
  sideEffect;
  commonality;
  constructor(drugType, effectType) {
    this.drugType = drugType;
    this.name = "";
    this.method = "";
    this.effectType = effectType;
    this.effectDescription = "";
    this.strength = "";
    this.color = "";
    this.duration = "";
    this.sideEffect = "";
    this.commonality = "";
  }
  describe() {
    let description = this.name + " is a " + this.strength + " " + this.effectType.name + ". ";
    description += "It's " + Words.article(this.color) + " " + this.color + " " + this.drugType.name + " that is " + this.method + ". ";
    description += this.effectDescription;
    description += " " + this.duration;
    description += " Side effects can include " + this.sideEffect + ". ";
    description += this.commonality;
    return description;
  }
}
function all$1() {
  return [gas(), liquid(), ointment(), powder(), paste(), pill()];
}
function gas() {
  let verbs = ["inhaled", "breathed in", "sniffed"];
  let options = ["breather", "aerosol", "small spray can", "long tube", "palm-sized tank"];
  let descriptions = [];
  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} from ${Words.article(options[y])} ${options[y]}`);
    }
  }
  return new DrugType("gas", descriptions);
}
function liquid() {
  let options = ["arm", "leg", "heart", "neck"];
  let descriptions = [
    "drank straight",
    "put into cocktails and drank",
    "diluted with water and drank",
    "dropped into the eyes",
    "squirted into the eyes",
    "sprayed into the eyes"
  ];
  for (let y = 0; y < options.length; y++) {
    descriptions.push(`injected in the ${options[y]}`);
  }
  return new DrugType("liquid", descriptions);
}
function ointment() {
  let verbs = ["spread", "dabbed", "brushed", "rubbed"];
  let options = ["face", "hands", "skin", "forehead", "lips"];
  let descriptions = [];
  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} on the ${options[y]}`);
    }
  }
  return new DrugType("ointment", descriptions);
}
function paste() {
  let verbs = ["spread", "smeared", "rubbed"];
  let options = ["face", "hands", "skin", "forehead", "lips", "throat"];
  let descriptions = [];
  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} on the ${options[y]}`);
    }
  }
  return new DrugType("paste", descriptions);
}
function pill() {
  let descriptions = [
    "crushed into food and eaten",
    "swallowed whole",
    "swallowed with a beverage",
    "mixed into food and eaten",
    "chewed"
  ];
  return new DrugType("pill", descriptions);
}
function powder() {
  let descriptions = [
    "inhaled",
    "breathed in",
    "snorted",
    "put in liquids and drank",
    "added to oil and rubbed on the skin"
  ];
  return new DrugType("powder", descriptions);
}
function all() {
  return [
    new EffectType("hallucinogen", [
      "It creates psychedelic visions.",
      "It warps the appearance of things around you.",
      "It shows you your brightest hopes, and sometimes your darkest nightmares.",
      "It makes you delirious.",
      "It shows you things you wish were real.",
      "It seems to separate your mind from your body."
    ]),
    new EffectType("aphrodesiac", [
      "It increases your sex drive.",
      "Among other things, it increases your confidence.",
      "It boosts your performance and your sexual appetite."
    ]),
    new EffectType("depressant", [
      "It makes you mentally numb.",
      "It makes you mentally and physically numb.",
      "It numbs pain.",
      "It numbs physical sensation.",
      "It suppresses anger.",
      "It suppresses pain.",
      "It puts the world around you in a fog."
    ]),
    new EffectType("stimulant", [
      "It gets you jazzed up.",
      "It increases your reflexes.",
      "It boosts your ability to interface with cybertech.",
      "It increases your mental focus.",
      "It makes you more aware of your surroundings.",
      "It boosts your strength.",
      "It increases your awareness."
    ]),
    new EffectType("tranquilizer", [
      "It relaxes you.",
      "It helps you sleep.",
      "It eliminates anxiety.",
      "It reduces anxiety.",
      "It puts you to sleep immediately."
    ]),
    new EffectType("euphoriant", [
      "It makes you feel happy.",
      "It makes you feel really good.",
      "It makes you immune to pain.",
      "It turns pain into pleasure.",
      "It gives you a rush of energy and a feeling of excitement.",
      "It makes you feel invincible."
    ])
  ];
}
class DrugGeneratorConfig {
  drugTypes;
  effectTypes;
  constructor() {
    let drugTypes = all$1();
    let effectTypes = all();
    this.drugTypes = drugTypes;
    this.effectTypes = effectTypes;
  }
}
class DrugGenerator {
  config;
  constructor() {
    this.config = new DrugGeneratorConfig();
  }
  generate() {
    let drug = new Drug(RND.item(this.config.drugTypes), RND.item(this.config.effectTypes));
    drug.name = randomName();
    drug.method = RND.item(drug.drugType.methods);
    drug.effectDescription = RND.item(drug.effectType.effects);
    drug.strength = randomStrength();
    drug.color = randomColor();
    drug.duration = randomDuration();
    drug.sideEffect = randomSideEffect();
    drug.commonality = randomCommonality();
    return drug;
  }
}
function randomColor() {
  const color = RND.item([
    "amber",
    "azure",
    "blue",
    "brown",
    "coppery",
    "crimson",
    "emerald",
    "golden",
    "green",
    "magenta",
    "orange",
    "pink",
    "purple",
    "red",
    "ruby",
    "sapphire",
    "turqoise",
    "violet",
    "yellow"
  ]);
  const modifier = RND.item([
    "bright",
    "dark",
    "fluorescent",
    "glittering",
    "glowing",
    "light",
    "pearlescent",
    "shining",
    "sparkling"
  ]);
  return modifier + " " + color;
}
function randomCommonality() {
  return RND.item([
    "You can find it just about everywhere.",
    "It's hard to find.",
    "It's easy to find.",
    "It's easy to find, if you know the right people.",
    "It's uncommon.",
    "It's fairly rare, unless you know the right people."
  ]);
}
function randomDuration() {
  return RND.item([
    "One dose lasts for a few minutes.",
    "One dose lasts for an hour or two.",
    "One dose lasts for several hours.",
    "One dose lasts for an entire day.",
    "One dose lasts for half an hour or so."
  ]);
}
function randomName() {
  const nameType = RND.item([
    {
      name: "single word",
      generate: function() {
        return RND.item([
          "Angel",
          "Arc",
          "Bright",
          "Burn",
          "Burst",
          "Dreg",
          "Dust",
          "Frost",
          "Ice",
          "Jazz",
          "Shade",
          "Shadow",
          "Sky",
          "Slice",
          "Spice",
          "Stardust",
          "Synth",
          "Toxin",
          "Venom"
        ]);
      }
    },
    {
      name: "numbered word",
      generate: function() {
        let word = RND.item([
          "Angel",
          "Arc",
          "Bright",
          "Burn",
          "Burst",
          "Dreg",
          "Dust",
          "Frost",
          "Ice",
          "Jazz",
          "Shade",
          "Shadow",
          "Sky",
          "Slice",
          "Spice",
          "Stardust",
          "Synth",
          "Toxin",
          "Venom"
        ]);
        let number = random.int(2, 13);
        return `${word}-${number}`;
      }
    },
    {
      name: "phrase",
      generate: function() {
        const prefix = RND.item([
          "Angel",
          "Black",
          "Blue",
          "Bright",
          "Demon",
          "Devil",
          "Easy",
          "Fire",
          "Gold",
          "Green",
          "Ice",
          "Night",
          "Slash",
          "Star",
          "Street",
          "White"
        ]);
        const suffix = RND.item([
          "Dream",
          "Dust",
          "Fantasy",
          "Flower",
          "Glow",
          "Jack",
          "Jolt",
          "Lotus",
          "Sand",
          "Shade",
          "Spice",
          "Stutter",
          "Trip",
          "Wonder"
        ]);
        return prefix + " " + suffix;
      }
    }
  ]);
  return nameType.generate();
}
function randomSideEffect() {
  let result = [];
  let effects = sideEffects();
  effects = RND.shuffle(effects);
  let numberOfEffects = random.int(1, 3);
  for (let i = 0; i < numberOfEffects; i++) {
    let effect = effects.pop();
    if (effect === void 0) {
      throw new Error("No more effects available.");
    }
    result.push(effect);
  }
  return Words.arrayToPhrase(result);
}
function randomStrength() {
  return RND.item(["powerful", "strong", "really potent", "potent", "weak", "very weak"]);
}
function sideEffects() {
  return [
    "a burning sensation over your entire body",
    "horrific nightmares",
    "dry mouth",
    "trouble sleeping",
    "increased aggression",
    "brain damage",
    "liver damage",
    "difficulty breathing",
    "bloodshot eyes",
    "horrible breath",
    "pallid skin",
    "extreme fatigue",
    "nervousness",
    "paranoia",
    "vomiting",
    "uncontrollable flatulence",
    "diarrhea",
    "uncontrollable shaking",
    "psychosis",
    "schizophrenia",
    "sensitivity to pain",
    "sensitivity to light",
    "weakness",
    "temporary paralysis",
    "reduced ability to think",
    "reduced ability to feel pleasure when not high"
  ];
}
const css = {
  code: 'div.svelte-16qhxqu.svelte-16qhxqu,h1.svelte-16qhxqu.svelte-16qhxqu,p.svelte-16qhxqu.svelte-16qhxqu,label.svelte-16qhxqu.svelte-16qhxqu,section.svelte-16qhxqu.svelte-16qhxqu{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-16qhxqu.svelte-16qhxqu{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-16qhxqu.svelte-16qhxqu{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-16qhxqu.svelte-16qhxqu{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}p.svelte-16qhxqu.svelte-16qhxqu{margin:1rem 0}label.svelte-16qhxqu.svelte-16qhxqu{font-weight:700;margin-right:1rem}input.svelte-16qhxqu.svelte-16qhxqu{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-16qhxqu.svelte-16qhxqu{margin-bottom:1rem}section.main.svelte-16qhxqu.svelte-16qhxqu{padding:0.5rem}#seed.svelte-16qhxqu.svelte-16qhxqu{font-family:monospace}.cyberpunk.svelte-16qhxqu.svelte-16qhxqu{background:black;color:white}.cyberpunk.svelte-16qhxqu h1.svelte-16qhxqu{color:#d8f6b0;font-family:"azonix", sans-serif;text-shadow:0 0 6px #86ff00}.cyberpunk.svelte-16qhxqu button.svelte-16qhxqu{background:rgb(0, 0, 0);border:3px solid #76e841;border-radius:3px;color:#76e841;font-family:"azonix", sans-serif;font-size:1rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.cyberpunk.svelte-16qhxqu button.svelte-16qhxqu:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.cyberpunk.svelte-16qhxqu button.svelte-16qhxqu:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let description = "";
  let seed = RND.randomString(13);
  let generator = new DrugGenerator();
  function generate() {
    random.use(seedrandom(seed));
    let drug = generator.generate();
    description = drug.describe();
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-if3z1j_START -->${$$result.title = `<title>Cyberpunk Drug Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-if3z1j_END -->`, ""} <section class="cyberpunk main svelte-16qhxqu"><h1 class="svelte-16qhxqu" data-svelte-h="svelte-138tcsn">Drug Generator</h1> <p class="svelte-16qhxqu" data-svelte-h="svelte-ly6ylh">I suppose you could also use this for any sci-fi setting, really.</p> <div class="input-group svelte-16qhxqu"><label for="seed" class="svelte-16qhxqu" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-16qhxqu"${add_attribute("value", seed, 0)}></div> <button class="svelte-16qhxqu" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-16qhxqu" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <p class="svelte-16qhxqu">${escape(description)}</p></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-8e9171a0.js.map
