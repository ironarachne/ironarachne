"use strict";

import * as RND from "../random";

export class CultureReligion {
  trait: string;
  description: string;
  religionType: CultureReligionType;
  organization: string;

  constructor() {
    this.trait = "";
    this.description = "";
    this.religionType = RND.item(religionTypes());
    this.organization = RND.item(religionOrganizations());
  }
}

export class CultureReligionType {
  name: string;
  possibleTraits: string[];

  constructor(name:string, possibleTraits: string[]) {
    this.name = name;
    this.possibleTraits = possibleTraits;
  }
}

export function generate() {
  let religion = new CultureReligion();

  religion.trait = RND.item(religion.religionType.possibleTraits);
  religion.description = religion.trait + " " + religion.organization;

  return religion;
}

function religionOrganizations() {
  return [
    "Each town has its own temple with at least one priest responsible for it.",
    "Spiritual worship is a very personal thing. There are no priests, only individual practice.",
    "Multiple different denominations exist with divided viewpoints. Any given town might have one or several.",
    "Individual towns have a specific focus unique from other settlements'.",
    "Religion plays a major part in their lives, with priests consulted for even mundane things.",
    "While organized religion exists, it's less common than individual practice.",
  ];
}

function religionTypes() {
  return [
    new CultureReligionType(
      "polytheistic",
      [
        "There are many gods, and they are all more or less equal.",
        "There are many gods, but one reigns supreme.",
        "There are many gods, though they fight amongst themselves constantly.",
        "Of the many gods, a handful involve themselves in mortal affairs.",
        "A triad of gods governs all of creation.",
        "There are several gods and they all take an active role in the world.",
      ],
    ),
    new CultureReligionType(
      "monotheistic",
      [
        "There is one god who rules all of creation.",
        "There is one goddess who rules all of creation.",
        "There is one god who set the world in motion.",
        "There is one goddess who set the world in motion.",
      ],
    ),
    new CultureReligionType(
      "animistic",
      [
        "All things have a guardian spirit.",
        "Every rock, tree, animal, and plant has its own spirit.",
        "All living things possess a soul and guide and protect us.",
      ],
    ),
  ];
}
