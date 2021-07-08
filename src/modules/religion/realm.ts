"use strict";

import * as AppearanceTrait from "../appearance";

export class Realm {
  name: string;
  description: string;
  personalityTraits: string[];
  appearanceTraits: string[];

  constructor(name: string, description: string, personalityTraits: string[], appearanceTraits: any[]) {
    this.name = name;
    this.description = description;
    this.personalityTraits = personalityTraits;
    this.appearanceTraits = appearanceTraits;
  }
}

export class Concept {
  name: string;
  nameOptions: string[];
  appearanceTags: string[];
  personalityTags: string[];
  descriptionOptions: string[];

  constructor(name: string, nameOptions: string[], appearanceTags: string[], personalityTags: string[], descriptionOptions: string[]) {
    this.name = name;
    this.nameOptions = nameOptions;
    this.appearanceTags = appearanceTags;
    this.personalityTags = personalityTags;
    this.descriptionOptions = descriptionOptions;
  }
}

export function allConcepts() {
  return [
    new Concept(
      "sky",
      ["The Eternal Heavens", "The Heavens Above", "Heaven", "The Sky", "The Heavens"],
      ["sky"],
      ["mercurial", "caring", "wise", "flexible"],
      [
        "Far above the mortal world, {name} is a realm of light.",
        "{name} is a realm of light and beauty.",
      ]
    ),
    new Concept(
      "earth",
      ["The Earth", "The Mortal Realm", "The Material Plane"],
      ["earth"],
      ["stable", "stubborn", "physical"],
      [
        "{name} is where mortals reside.",
        "{name} is the home of all mortal beings.",
      ]
    ),
    new Concept(
      "forest",
      ["The Forest", "The Eternal Forest", "The Divine Forest"],
      ["forest"],
      ["caring", "stable", "peaceful"],
      [
        "Hidden far from the mortal world, {name} is deep and mysterious.",
        "{name} is an infinite forest of beauty and mystery.",
      ]
    ),
    new Concept(
      "underworld",
      ["The Underworld", "The Afterlife", "The Kingdom of Death", "The Great Beyond"],
      ["death", "shadow"],
      ["angry", "brooding", "peaceful", "wise"],
      [
        "{name} is where souls go to rest after death.",
        "{name} is a realm of perpetual darkness where the dead rest forever.",
      ]
    ),
    new Concept(
      "ocean",
      ["The Vast Sea", "The Sea", "The Endless Ocean", "The Divine Sea"],
      ["water"],
      ["mercurial", "aloof", "cruel", "flexible"],
      [
        "{name} is a realm apart from mortal seas, full of life and infinitely deep.",
        "The deep and restless waters of {name} hide many secrets.",
      ]
    ),
    new Concept(
      "mountain",
      ["The Great Mountain", "The Mountain", "The Divine Mountain"],
      ["earth"],
      ["aloof", "wise", "physical", "stable"],
      [
        "{name} is far larger than any mountain of the mortal world.",
        "{name} is covered in lush forests and cascading waterfalls, a towering paradise.",
      ]
    ),
    new Concept(
      "void",
      ["The Nameless Void", "The Endless Void", "The Void", "The Dark Beyond", "The Endless Dark"],
      ["alien"],
      ["alien", "clever"],
      [
        "{name} is home to things unknowable and alien.",
        "There are mysteries in {name} that no mortal can hope to perceive, let alone understand.",
      ]
    ),
  ];
}

export function getAllAppearanceTraits() {
  return [
    new AppearanceTrait.AppearanceTrait("six feathered wings", "wings", ["sky"]),
    new AppearanceTrait.AppearanceTrait("four feathered wings", "wings", ["sky"]),
    new AppearanceTrait.AppearanceTrait("two large feathered wings", "wings", ["sky"]),
    new AppearanceTrait.AppearanceTrait("large leathery wings", "wings", ["sky", "death"]),
    new AppearanceTrait.AppearanceTrait("a lion's tail'", "tail", ["earth", "forest"]),
    new AppearanceTrait.AppearanceTrait("a whip-like tail", "tail", ["earth", "death"]),
    new AppearanceTrait.AppearanceTrait("two tails", "tail", ["alien"]),
    new AppearanceTrait.AppearanceTrait("the horns of a goat", "horns", ["earth", "forest"]),
    new AppearanceTrait.AppearanceTrait("the horns of a ram", "horns", ["earth", "forest"]),
    new AppearanceTrait.AppearanceTrait("the antlers of a stag", "horns", ["forest"]),
    new AppearanceTrait.AppearanceTrait("the antlers of a deer", "horns", ["forest"]),
    new AppearanceTrait.AppearanceTrait("short, pointed horns", "horns", ["earth", "death"]),
    new AppearanceTrait.AppearanceTrait("tall, straight horns", "horns", ["earth", "death"]),
    new AppearanceTrait.AppearanceTrait("glowing blue eyes", "eyes", ["water"]),
    new AppearanceTrait.AppearanceTrait("glowing yellow eyes", "eyes", ["sky", "water"]),
    new AppearanceTrait.AppearanceTrait("glowing red eyes", "eyes", ["earth", "death", "alien"]),
    new AppearanceTrait.AppearanceTrait("glowing orange eyes", "eyes", ["earth", "sky"]),
    new AppearanceTrait.AppearanceTrait("eyes that burn with an inner fire", "eyes", ["sky"]),
    new AppearanceTrait.AppearanceTrait("four eyes", "eyes", ["alien"]),
    new AppearanceTrait.AppearanceTrait("six eyes", "eyes", ["alien"]),
    new AppearanceTrait.AppearanceTrait("eight eyes", "eyes", ["alien"]),
    new AppearanceTrait.AppearanceTrait("no eyes", "eyes", ["death", "alien"]),
    new AppearanceTrait.AppearanceTrait("reptilian eyes", "eyes", ["forest", "earth"]),
    new AppearanceTrait.AppearanceTrait("scales instead of skin", "skin", ["earth", "forest"]),
    new AppearanceTrait.AppearanceTrait("skin that glows faintly", "skin", ["sky"]),
    new AppearanceTrait.AppearanceTrait("skin made of living rock", "skin", ["earth"]),
    new AppearanceTrait.AppearanceTrait("blue skin", "skin", ["water"]),
    new AppearanceTrait.AppearanceTrait("green skin", "skin", ["water"]),
    new AppearanceTrait.AppearanceTrait("crystalline skin", "skin", ["earth"]),
    new AppearanceTrait.AppearanceTrait("translucent grey skin", "skin", ["death"]),
    new AppearanceTrait.AppearanceTrait("dull grey skin", "skin", ["death"]),
    new AppearanceTrait.AppearanceTrait("skin covered in leaves", "skin", ["forest"]),
    new AppearanceTrait.AppearanceTrait("skin made of star-lit blackness", "skin", ["alien"]),
    new AppearanceTrait.AppearanceTrait("eight tentacles", "tentacles", ["alien"]),
    new AppearanceTrait.AppearanceTrait("six tentacles", "tentacles", ["alien"]),
    new AppearanceTrait.AppearanceTrait("four tentacles", "tentacles", ["alien"]),
    new AppearanceTrait.AppearanceTrait("the head of a lion", "head", ["forest"]),
    new AppearanceTrait.AppearanceTrait("the head of a bear", "head", ["forest"]),
    new AppearanceTrait.AppearanceTrait("the head of a dragon", "head", ["earth", "forest"]),
    new AppearanceTrait.AppearanceTrait("the head of a swan", "head", ["sky", "water"]),
    new AppearanceTrait.AppearanceTrait("the head of a deer", "head", ["forest"]),
    new AppearanceTrait.AppearanceTrait("the head of a cat", "head", ["earth", "desert"]),
    new AppearanceTrait.AppearanceTrait("the head of a wolf", "head", ["earth", "forest"]),
  ];
}

export function getAllAppearanceTraitsForRealmConcept(concept: Concept) {
  const all = getAllAppearanceTraits();

  let result: AppearanceTrait.AppearanceTrait[] = [];

  for (let i = 0; i < concept.appearanceTags.length; i++) {
    const discovered = AppearanceTrait.getAllTraitsWithTag(all, concept.appearanceTags[i]);

    result = [...result, ...discovered];
  }

  return result;
}
