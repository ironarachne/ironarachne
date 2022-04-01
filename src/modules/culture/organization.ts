'use strict';

import * as RND from '../random';
import * as Words from '../words';

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
    this.description = '';
  }
}

export function describe(organization: Organization) {
  let description = `In this culture, ${organization.powerConcentration}. `;

  description += Words.capitalize(organization.dominantProfession) + ' are most highly regarded. ';

  description += Words.capitalize(organization.dominantGender) + '. ';

  description += Words.capitalize(organization.socialMobility) + '. ';

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

function generatePowerStructure() {
  // is there a dominant gender? if so, which is it?
  // is power concentrated in a large group, a small group, or individuals?
  // what is the source of status? wealth, religion, land, strength?
  // who is in charge of towns?
  // are there different types of authority? e.g., town council made of men, but women's council that can overrule them
  // who is in charge of groups of towns?
  // what is the source of authority, if it's different from status?
}

function randomDominantGender() {
  return RND.item(['women are dominant', 'men are dominant', 'neither gender is dominant']);
}

function randomPowerConcentration() {
  return RND.item([
    'everyone has a say in how things are run',
    'a single group has control of society',
    'one individual has control of society',
  ]);
}

function randomSocialMobility() {
  return RND.item([
    'no one leaves the status they are born into',
    'some gain higher status by marrying someone above them',
    'everyone has the freedom to gain or lose status based on their own efforts',
    'it\'s possible to marry outside your social class, but frowned upon',
    'marrying outside of your social class is an acceptable way to change your status',
    'there is a rigid caste system and marrying outside of your caste is forbidden',
    'there is a rigid caste system but marrying outside of your caste is allowed in some situations',
    'there is a caste system, but it is starting to fall away as the younger generations pay less attention to it',
  ]);
}

function randomDominantProfession() {
  return RND.item(['landowners', 'merchants', 'religious leaders', 'intellectuals']);
}
