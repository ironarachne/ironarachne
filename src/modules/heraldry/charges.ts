'use strict';

import * as RND from '../random';
import Charge from './charge';

import antelopepassant from './charge-images/antelope-passant.svg';
import anteloperampant from './charge-images/antelope-rampant.svg';
import batvolant from './charge-images/bat-volant.svg';
import battleaxe from './charge-images/battleaxe.svg';
import bearheadcouped from './charge-images/bear-head-couped.svg';
import bearrampant from './charge-images/bear-rampant.svg';
import bearstatant from './charge-images/bear-statant.svg';
import beevolant from './charge-images/bee-volant.svg';
import bell from './charge-images/bell.svg';
import boarheaderased from './charge-images/boar-head-erased.svg';
import boarpassant from './charge-images/boar-passant.svg';
import boarrampant from './charge-images/boar-rampant.svg';
import castle from './charge-images/castle.svg';
import cock from './charge-images/cock.svg';
import cockatrice from './charge-images/cockatrice.svg';
import dolphinhauriant from './charge-images/dolphin-hauriant.svg';
import doubleheadedeagledisplayed from './charge-images/double-headed-eagle-displayed.svg';
import dragonrampant from './charge-images/dragon-rampant.svg';
import eaglesheaderased from './charge-images/eagles-head-erased.svg';
import foxsejant from './charge-images/fox-sejant.svg';
import gryphonsegreant from './charge-images/gryphon-segreant.svg';
import haresalient from './charge-images/hare-salient.svg';
import hare from './charge-images/hare.svg';
import heron from './charge-images/heron.svg';
import horsepassant from './charge-images/horse-passant.svg';
import horserampant from './charge-images/horse-rampant.svg';
import leopardpassant from './charge-images/leopard-passant.svg';
import lionpassant from './charge-images/lion-passant.svg';
import lionrampant from './charge-images/lion-rampant.svg';
import lionsheaderased from './charge-images/lions-head-erased.svg';
import owl from './charge-images/owl.svg';
import pegasuspassant from './charge-images/pegasus-passant.svg';
import pegasusrampant from './charge-images/pegasus-rampant.svg';
import ramrampant from './charge-images/ram-rampant.svg';
import ramstatant from './charge-images/ram-statant.svg';
import rose from './charge-images/rose.svg';
import seahorse from './charge-images/sea-horse.svg';
import squirrel from './charge-images/squirrel.svg';
import staglodged from './charge-images/stag-lodged.svg';
import stagstatant from './charge-images/stag-statant.svg';
import suninsplendor from './charge-images/sun-in-splendor.svg';
import tigerpassant from './charge-images/tiger-passant.svg';
import tigerrampant from './charge-images/tiger-rampant.svg';
import tower from './charge-images/tower.svg';
import twoaxesinsaltire from './charge-images/two-axes-in-saltire.svg';
import twobonesinsaltire from './charge-images/two-bones-in-saltire.svg';
import unicornstatant from './charge-images/unicorn-statant.svg';
import wolfpassant from './charge-images/wolf-passant.svg';
import wolframpant from './charge-images/wolf-rampant.svg';
import wyvern from './charge-images/wyvern.svg';

export function all() {
  return [
    new Charge('antelope passant', 'antelopes passant', antelopepassant, 'regular', [
      'animal',
      'antelope',
      'hunting',
    ]),
    new Charge('antelope rampant', 'antelopes rampant', anteloperampant, 'regular', [
      'animal',
      'antelope',
      'hunting',
    ]),
    new Charge('bat volant', 'bats volant', batvolant, 'regular', [
      'animal',
      'bat',
      'evil',
      'night',
    ]),
    new Charge('battleaxe', 'battleaxes', battleaxe, 'regular', ['axe', 'warrior', 'weapon']),
    new Charge('bear head couped', 'bear heads couped', bearheadcouped, 'regular', [
      'animal',
      'bear',
      'strength',
    ]),
    new Charge('bear rampant', 'bears rampant', bearrampant, 'regular', [
      'animal',
      'bear',
      'strength',
    ]),
    new Charge('bear statant', 'bears statant', bearstatant, 'regular', [
      'animal',
      'bear',
      'strength',
    ]),
    new Charge('bee volant', 'bees volant', beevolant, 'regular', ['animal', 'bee', 'insect']),
    new Charge('bell', 'bells', bell, 'regular', ['bell', 'holy']),
    new Charge('boar head erased', 'boar heads erased', boarheaderased, 'regular', [
      'animal',
      'boar',
      'hunting',
    ]),
    new Charge('boar passant', 'boars passant', boarpassant, 'regular', [
      'animal',
      'boar',
      'hunting',
    ]),
    new Charge('boar rampant', 'boars rampant', boarrampant, 'regular', [
      'animal',
      'boar',
      'hunting',
    ]),
    new Charge('castle', 'castles', castle, 'regular', ['castle', 'protection', 'warrior']),
    new Charge('cock', 'cocks', cock, 'regular', ['animal', 'bird', 'cock']),
    new Charge('cockatrice', 'cockatrices', cockatrice, 'regular', ['monster', 'cockatrice']),
    new Charge('dolphin hauriant', 'dolphins hauriant', dolphinhauriant, 'regular', [
      'dolphin',
      'fish',
      'ocean',
    ]),
    new Charge(
      'doubleheaded eagle displayed',
      'doubleheaded eagles displayed',
      doubleheadedeagledisplayed,
      'regular',
      ['animal', 'bird', 'eagle'],
    ),
    new Charge('dragon rampant', 'dragons rampant', dragonrampant, 'regular', [
      'monster',
      'dragon',
    ]),
    new Charge("eagle's head erased", "eagle's heads erased", eaglesheaderased, 'regular', [
      'animal',
      'bird',
      'eagle',
    ]),
    new Charge('fox sejant', 'foxes sejant', foxsejant, 'regular', ['animal', 'fox']),
    new Charge('gryphon segreant', 'gryphons segreant', gryphonsegreant, 'regular', [
      'monster',
      'griffin',
      'gryphon',
      'griffon',
    ]),
    new Charge('hare salient', 'hares salient', haresalient, 'regular', [
      'animal',
      'hare',
      'rabbit',
    ]),
    new Charge('hare', 'hares', hare, 'regular', ['animal', 'hare', 'rabbit']),
    new Charge('heron', 'herons', heron, 'regular', ['animal', 'bird', 'heron']),
    new Charge('horse passant', 'horses passant', horsepassant, 'regular', ['animal', 'horse']),
    new Charge('horse rampant', 'horses rampant', horserampant, 'regular', ['animal', 'horse']),
    new Charge('leopard passant', 'leopards passant', leopardpassant, 'regular', [
      'animal',
      'cat',
      'leopard',
    ]),
    new Charge('lion passant', 'lions passant', lionpassant, 'regular', ['animal', 'cat', 'lion']),
    new Charge('lion rampant', 'lions rampant', lionrampant, 'regular', ['animal', 'cat', 'lion']),
    new Charge("lion's head erased", "lion's heads erased", lionsheaderased, 'regular', [
      'animal',
      'cat',
      'lion',
    ]),
    new Charge('owl', 'owls', owl, 'regular', ['animal', 'bird', 'owl']),
    new Charge('pegasus passant', 'pegasuses passant', pegasuspassant, 'regular', [
      'monster',
      'pegasus',
    ]),
    new Charge('pegasus rampant', 'pegasuses rampant', pegasusrampant, 'regular', [
      'monster',
      'pegasus',
    ]),
    new Charge('ram rampant', 'rams rampant', ramrampant, 'regular', ['animal', 'ram']),
    new Charge('ram statant', 'rams statant', ramstatant, 'regular', ['animal', 'ram']),
    new Charge('rose', 'roses', rose, 'regular', ['flower', 'plant', 'rose']),
    new Charge('sea horse', 'sea horses', seahorse, 'regular', ['animal', 'sea horse', 'ocean']),
    new Charge('squirrel', 'squirrels', squirrel, 'regular', ['animal', 'squirrel']),
    new Charge('stag lodged', 'stags lodged', staglodged, 'regular', ['animal', 'stag', 'hunting']),
    new Charge('stag statant', 'stags statant', stagstatant, 'regular', [
      'animal',
      'stag',
      'hunting',
    ]),
    new Charge('sun in splendor', 'suns in splendor', suninsplendor, 'regular', ['sun']),
    new Charge('tiger passant', 'tigers passant', tigerpassant, 'regular', [
      'animal',
      'cat',
      'tiger',
    ]),
    new Charge('tiger rampant', 'tigers rampant', tigerrampant, 'regular', [
      'animal',
      'cat',
      'tiger',
    ]),
    new Charge('tower', 'towers', tower, 'regular', ['tower', 'protection']),
    new Charge('two axes in saltire', 'axes in saltire', twoaxesinsaltire, 'regular', [
      'axe',
      'warrior',
      'weapon',
    ]),
    new Charge('two bones in saltire', 'bones in saltire', twobonesinsaltire, 'regular', [
      'bone',
      'evil',
      'pirate',
    ]),
    new Charge('unicorn statant', 'unicorns statant', unicornstatant, 'regular', [
      'monster',
      'unicorn',
    ]),
    new Charge('wolf passant', 'wolves passant', wolfpassant, 'regular', ['animal', 'wolf']),
    new Charge('wolf rampant', 'wolves rampant', wolframpant, 'regular', ['animal', 'wolf']),
    new Charge('wyvern', 'wyverns', wyvern, 'regular', ['monster', 'wyvern']),
  ];
}

export function random(charges: Charge[]): Charge {
  return RND.item(charges);
}

export function randomWithTag(tag: string, charges: Charge[]): Charge {
  let matching = matchingTag(tag, charges);

  return random(matching);
}

export function matchingTag(tag: string, charges: Charge[]): Charge[] {
  let result: Charge[] = [];

  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (!result.includes(charges[i]) && charges[i].tags[j] == tag) {
        result.push(charges[i]);
        continue;
      }
    }
  }

  return result;
}

export function matchingAnyTags(tags: string[], charges: Charge[]): Charge[] {
  let result: Charge[] = [];

  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (!result.includes(charges[i]) && tags.includes(charges[i].tags[j])) {
        result.push(charges[i]);
        continue;
      }
    }
  }

  return result;
}

export function allChargeTags(): string[] {
  let charges = all();

  let result: string[] = [];

  for (let i = 0; i < charges.length; i++) {
    for (let j = 0; j < charges[i].tags.length; j++) {
      if (!result.includes(charges[i].tags[j])) {
        result.push(charges[i].tags[j]);
      }
    }
  }

  return result.sort();
}
