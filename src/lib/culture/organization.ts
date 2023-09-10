import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";

export class Organization {
  dominantGender: string;
  powerConcentration: string;
  socialMobility: string;
  dominantProfession: string;
  description: string;

  constructor(
    dominantGender: string,
    powerConcentration: string,
    socialMobility: string,
    dominantProfession: string,
  ) {
    this.dominantGender = dominantGender;
    this.powerConcentration = powerConcentration;
    this.socialMobility = socialMobility;
    this.dominantProfession = dominantProfession;
    this.description = "";
  }
}

export function describe(organization: Organization) {
  let description = `In this culture, ${organization.powerConcentration}. `;

  description += Words.capitalize(organization.dominantProfession) + " are most highly regarded. ";

  description += Words.capitalize(organization.dominantGender) + ". ";

  description += Words.capitalize(organization.socialMobility) + ". ";

  return description;
}

export function generate() {
  const organization = new Organization(
    randomDominantGender(),
    randomPowerConcentration(),
    randomSocialMobility(),
    randomDominantProfession(),
  );

  organization.description = describe(organization);

  return organization;
}

function randomDominantGender() {
  return RND.item(["women are dominant", "men are dominant", "neither gender is dominant"]);
}

function randomPowerConcentration() {
  return RND.item([
    "power is shared among multiple groups",
    "power is divided between two opposing groups",
    "power is distributed evenly among all individuals",
    "power is determined by a merit-based system",
    "power is determined by birthright",
    "power is determined by religious affiliation",
    "power is determined by wealth",
    "power is determined by military might",
    "power is determined by magical ability",
    "power is determined by age",
    "power is determined by educational attainment",
    "power is determined by popularity or public opinion",
  ]);
}

function randomSocialMobility() {
  return RND.item([
    "social mobility is completely stagnant",
    "social mobility is only possible through military service",
    "social mobility is only possible through marriage",
    "social mobility is only possible through education",
    "social mobility is only possible through wealth accumulation",
    "social mobility is only possible through religious conversion",
    "social mobility is only possible through a special talent or skill",
    "social mobility is only possible through political connections",
    "social mobility is only possible through joining a particular profession or guild",
    "social mobility is possible through hard work and determination alone",
    "social mobility is possible for anyone who is willing to take risks and seize opportunities",
    "social mobility is only possible for those born into a certain social class",
    "social mobility is only possible for those who are part of a certain racial or ethnic group",
    "social mobility is only possible for those who are members of a certain secret society",
  ]);
}

function randomDominantProfession() {
  return RND.item([
    "landowners",
    "merchants",
    "religious leaders",
    "intellectuals",
    "craftsmen",
    "farmers",
    "warriors",
  ]);
}
