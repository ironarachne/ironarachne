'use strict';

import GenericNameGenerator from '../names/generators/generic';
import StarNationGovernment from './government';

export function all(): StarNationGovernment[] {
  return [getEmpire(), getMonarchy(), getRepublic(), getTheocracy()];
}

function getEmpire(): StarNationGovernment {
  let gov = new StarNationGovernment();
  gov.name = 'empire';
  gov.minSystems = 10;
  gov.maxSystems = 100;

  let nameGen = new GenericNameGenerator();
  nameGen.patterns = ['EMPIRE OF', 'GRAND EMPIRE OF', 'STAR EMPIRE OF', 'STELLAR EMPIRE OF'];
  gov.nameGenerator = nameGen;

  return gov;
}

function getMonarchy(): StarNationGovernment {
  let gov = new StarNationGovernment();
  gov.name = 'monarchy';
  gov.minSystems = 1;
  gov.maxSystems = 30;

  let nameGen = new GenericNameGenerator();
  nameGen.patterns = [
    'KINGDOM OF',
    'GRAND KINGDOM OF',
    'STAR KINGDOM OF',
    'STELLAR KINGDOM OF',
    'MONARCHY OF',
    'GRAND MONARCHY OF',
    'STAR MONARCHY OF',
    'STELLAR MONARCHY OF',
  ];
  gov.nameGenerator = nameGen;

  return gov;
}

function getRepublic(): StarNationGovernment {
  let gov = new StarNationGovernment();
  gov.name = 'republic';
  gov.minSystems = 1;
  gov.maxSystems = 100;

  let nameGen = new GenericNameGenerator();
  nameGen.patterns = [
    'REPUBLIC OF',
    'STAR REPUBLIC OF',
    'STELLAR REPUBLIC OF',
    'UNITED REPUBLIC OF',
    'UNITED FEDERATION OF',
    'GRAND REPUBLIC OF',
  ];
  gov.nameGenerator = nameGen;

  return gov;
}

function getTheocracy(): StarNationGovernment {
  let gov = new StarNationGovernment();
  gov.name = 'theocracy';
  gov.minSystems = 1;
  gov.maxSystems = 10;

  let nameGen = new GenericNameGenerator();
  nameGen.patterns = [
    'HOLY EMPIRE OF',
    'GRAND HOLY DOMINION OF',
    'HOLY KINGDOM OF',
    'HOLY MONARCHY OF',
    'BLESSED DOMINION OF',
  ];
  gov.nameGenerator = nameGen;

  return gov;
}
