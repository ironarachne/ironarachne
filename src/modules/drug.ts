"use strict";

import * as RND from "./random";
import * as Words from "./words";

export class Drug {
  name: string;
  drugType: DrugType;
  method: string;
  effectType: EffectType;
  effectDescription: string;
  strength: string;
  color: string;
  duration: string;
  sideEffect: string;
  commonality: string;

  constructor(drugType: DrugType, effectType: EffectType) {
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
}

export class DrugType {
  name: string;
  methods: string[];

  constructor(name: string, methods: string[]) {
    this.name = name;
    this.methods = methods;
  }
}

export class EffectType {
  name: string;
  effects: string[];

  constructor(name: string, effects: string[]) {
    this.name = name;
    this.effects = effects;
  }
}

export function generate() {
  let drug = new Drug(RND.item(allTypes()), randomEffectType());

  drug.name = randomName();
  drug.method = RND.item(drug.drugType.methods);
  drug.effectDescription = RND.item(drug.effectType.effects);
  drug.strength = randomStrength();
  drug.color = randomColor();
  drug.duration = randomDuration();
  drug.sideEffect = randomSideEffect();
  drug.commonality = randomCommonality();

  return describe(drug);
}

function describe(drug: Drug) {
  let description = drug.name + " is a " + drug.strength + " " + drug.effectType.name + ". ";
  description += "It's " + Words.article(drug.color) + " " + drug.color + " " + drug.drugType.name + " that is " + drug.method + ". ";
  description += drug.effectDescription;
  description += " " + drug.duration;
  description += " Side effects can include " + drug.sideEffect + ". ";
  description += drug.commonality;

  return description;
}

function allTypes() {
  return [
    new DrugType(
      "powder",
      [
        "inhaled",
        "added to liquids and drank",
        "burned and the smoke inhaled",
      ],
    ),
    new DrugType(
      "liquid",
      [
        "enclosed in gel capsules",
        "drank straight or in concoctions",
        "injected",
        "dropped into the eyes",
      ],
    ),
    new DrugType(
      "gas",
      [
        "inhaled from a breather",
        "inhaled from an aerosol",
        "inhaled from a small spray can",
      ],
    ),
  ];
}

function randomColor() {
  let color = RND.item([
    "blue",
    "green",
    "red",
    "purple",
    "orange",
    "yellow",
    "amber",
    "crimson",
    "azure",
    "violet",
    "emerald",
  ]);

  let modifier = RND.item([
    "light",
    "dark",
    "bright",
    "fluorescent",
    "pearlescent",
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
    "It's fairly rare, unless you know the right people.",
  ]);
}

function randomDuration() {
  return RND.item([
    "One dose lasts for a few minutes.",
    "One dose lasts for an hour or two.",
    "One dose lasts for several hours.",
    "One dose lasts for an entire day.",
    "One dose lasts for half an hour or so.",
  ]);
}

function randomEffectType() {
  return RND.item([
    new EffectType(
      "hallucinogen",
      [
        "It creates psychedelic visions.",
        "It warps the appearance of things around you.",
        "It shows you your brightest hopes, and sometimes your darkest nightmares.",
        "It makes you delirious.",
        "It seems to separate your mind from your body.",
      ],
    ),
    new EffectType(
      "aphrodesiac",
      [
        "It increases your sex drive.",
        "Among other things, it increases your confidence.",
        "It boosts your performance and your sexual appetite.",
      ],
    ),
    new EffectType(
      "depressant",
      [
        "It makes you mentally numb.",
        "It makes you mentally and physically numb.",
        "It puts the world around you in a fog.",
        "It relaxes you.",
      ],
    ),
    new EffectType(
      "stimulant",
      [
        "It gets you jazzed up.",
        "It increases your reflexes.",
        "It increases your mental focus.",
        "It makes you more aware of your surroundings.",
      ],
    ),
    new EffectType(
      "euphoriant",
      [
        "It makes you feel happy.",
        "It makes you feel really good.",
        "It gives you a rush of energy and a feeling of excitement.",
      ]
    )
  ]);
}

function randomName() {
  let nameType = RND.item([
    {
      name: "single word",
      generate: function () {
        return RND.item([
          "Slice",
          "Dreg",
          "Shadow",
          "Burn",
          "Ice",
          "Toxin",
          "Venom",
          "Sky",
          "Stardust",
          "Bright",
          "Burst",
          "Shade",
          "Synth",
          "Arc",
          "Dust",
          "Angel",
        ]);
      },
    },
    {
      name: "phrase",
      generate: function () {
        let prefix = RND.item([
          "White",
          "Blue",
          "Black",
          "Green",
          "Gold",
          "Fire",
          "Ice",
          "Bright",
          "Star",
          "Easy",
          "Night",
          "Street",
          "Angel",
        ]);

        let suffix = RND.item([
          "Fantasy",
          "Spice",
          "Dust",
          "Shade",
          "Trip",
          "Sand",
          "Glow",
          "Wonder",
          "Dream",
          "Flower",
          "Lotus",
          "Stutter",
          "Jack",
          "Jolt",
        ]);

        return prefix + " " + suffix;
      },
    },
  ]);

  return nameType.generate();
}

function randomSideEffect() {
  return RND.item([
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
  ]);
}

function randomStrength() {
  return RND.item([
    "really potent",
    "potent",
    "weak",
    "very weak",
  ]);
}
