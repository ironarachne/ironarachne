import * as DrugTypes from "./drug_types";
import * as EffectTypes from "./effect_types";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import type Drug from "./drug";
import type DrugGeneratorConfig from "./drug_generator_config";

export function generate(config: DrugGeneratorConfig): Drug {
    const drugType = RND.item(config.drugTypes);
    const effectType = RND.item(config.effectTypes);

    const name = randomName();
    const method = RND.item(drugType.methods);
    const effectDescription = RND.item(effectType.effects);
    const strength = randomStrength();
    const color = randomColor();
    const duration = randomDuration();
    const sideEffect = randomSideEffect();
    const commonality = randomCommonality();
    
    const drug = {
        name,
        description: "",
        drugType,
        method,
        effectType,
        effectDescription,
        strength,
        color,
        duration,
        sideEffect,
        commonality,
    };

    drug.description = describe(drug);

    return drug;
}

export function getDefaultConfig(): DrugGeneratorConfig {
    const drugTypes = DrugTypes.all();
    const effectTypes = EffectTypes.all();

    return {
        drugTypes: drugTypes,
        effectTypes: effectTypes
    };
}

function describe(drug: Drug): string {
    let description = `${drug.name} is a ${drug.strength} ${drug.effectType.name}. `;
    description += `It's ${Words.article(drug.color)} ${drug.color} ${drug.drugType.name} that is ${drug.method}. `;
    description += drug.effectDescription;
    description += ` ${drug.duration}`;
    description += ` Side effects can include ${drug.sideEffect}. `;
    description += drug.commonality;

    return description;
}

function randomColor(): string {
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
      "yellow",
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
      "sparkling",
    ]);
  
    return `${modifier} ${color}`;
  }
  
  function randomCommonality(): string {
    return RND.item([
      "You can find it just about everywhere.",
      "It's hard to find.",
      "It's easy to find.",
      "It's easy to find, if you know the right people.",
      "It's uncommon.",
      "It's fairly rare, unless you know the right people.",
    ]);
  }
  
  function randomDuration(): string {
    return RND.item([
      "One dose lasts for a few minutes.",
      "One dose lasts for an hour or two.",
      "One dose lasts for several hours.",
      "One dose lasts for an entire day.",
      "One dose lasts for half an hour or so.",
    ]);
  }
  
  function randomName(): string {
    const nameType = RND.item([
      {
        name: "single word",
        generate: () => RND.item([
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
            "Venom",
          ]),
      },
      {
        name: "numbered word",
        generate: () => {
          const word = RND.item([
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
            "Venom",
          ]);
  
          const number = random.int(2, 13);
  
          return `${word}-${number}`;
        },
      },
      {
        name: "phrase",
        generate: () => {
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
            "White",
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
            "Wonder",
          ]);
  
          return `${prefix} ${suffix}`;
        },
      },
    ]);
  
    return nameType.generate();
  }
  
  function randomSideEffect(): string {
    const result: string[] = [];
    let effects = sideEffects();
  
    effects = RND.shuffle(effects);
  
    const numberOfEffects = random.int(1, 3);
  
    for (let i = 0; i < numberOfEffects; i++) {
      const effect = effects.pop();
      if (effect === undefined) {
        throw new Error("No more effects available.");
      }
      result.push(effect);
    }
  
    return Words.arrayToPhrase(result);
  }
  
  function randomStrength(): string {
    return RND.item(["powerful", "strong", "really potent", "potent", "weak", "very weak"]);
  }
  
  function sideEffects(): string[] {
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
      "reduced ability to feel pleasure when not high",
    ];
  }