"use strict";

import * as RND from "../random";
import * as Words from "../words";

export class Organization {
  constructor(dominantGender, powerConcentration, socialMobility, dominantProfession) {
    this.dominantGender = dominantGender;
    this.powerConcentration = powerConcentration;
    this.socialMobility = socialMobility;
    this.dominantProfession = dominantProfession;
    this.description = "";
  }
}

export function describe(organization) {
  let description = `In this culture, ${organization.powerConcentration}. `;

  description += Words.capitalize(organization.dominantProfession) + " are most highly regarded. ";

  description += Words.capitalize(organization.dominantGender) + ". ";

  description += Words.capitalize(organization.socialMobility) + ". ";

  return description;
}

export function generate() {
  let organization = new Organization(
    randomDominantGender(),
    randomPowerConcentration(),
    randomSocialMobility(),
    randomDominantProfession()
  );

  organization.description = describe(organization);

  return organization;
}

function randomDominantGender() {
  return RND.item([
    "women are dominant",
    "men are dominant",
    "neither gender is dominant",
  ]);
}

function randomPowerConcentration() {
  return RND.item([
    "everyone has a say in how things are run",
    "a single group has control of society",
    "one individual has control of society",
  ]);
}

function randomSocialMobility() {
  return RND.item([
    "no one leaves the status they are born into",
    "some gain higher status by marrying someone above them",
    "everyone has the freedom to gain or lose status based on their own efforts",
  ]);
}

function randomDominantProfession() {
  return RND.item([
    "landowners",
    "merchants",
    "religious leaders",
    "intellectuals",
  ]);
}
