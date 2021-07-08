"use strict";

import * as RND from "../random";
import {Charge} from "./charge";

import antelopepassant from "./charge-images/antelope-passant.svg";
import anteloperampant from "./charge-images/antelope-rampant.svg";
import batvolant from "./charge-images/bat-volant.svg";
import battleaxe from "./charge-images/battleaxe.svg";
import bearheadcouped from "./charge-images/bear-head-couped.svg";
import bearrampant from "./charge-images/bear-rampant.svg";
import bearstatant from "./charge-images/bear-statant.svg";
import beevolant from "./charge-images/bee-volant.svg";
import bell from "./charge-images/bell.svg";
import boarheaderased from "./charge-images/boar-head-erased.svg";
import boarpassant from "./charge-images/boar-passant.svg";
import boarrampant from "./charge-images/boar-rampant.svg";
import castle from "./charge-images/castle.svg";
import cock from "./charge-images/cock.svg";
import cockatrice from "./charge-images/cockatrice.svg";
import dolphinhauriant from "./charge-images/dolphin-hauriant.svg";
import doubleheadedeagledisplayed from "./charge-images/double-headed-eagle-displayed.svg";
import dragonrampant from "./charge-images/dragon-rampant.svg";
import eaglesheaderased from "./charge-images/eagles-head-erased.svg";
import foxsejant from "./charge-images/fox-sejant.svg";
import gryphonsegreant from "./charge-images/gryphon-segreant.svg";
import haresalient from "./charge-images/hare-salient.svg";
import hare from "./charge-images/hare.svg";
import heron from "./charge-images/heron.svg";
import horsepassant from "./charge-images/horse-passant.svg";
import horserampant from "./charge-images/horse-rampant.svg";
import leopardpassant from "./charge-images/leopard-passant.svg";
import lionpassant from "./charge-images/lion-passant.svg";
import lionrampant from "./charge-images/lion-rampant.svg";
import lionsheaderased from "./charge-images/lions-head-erased.svg";
import owl from "./charge-images/owl.svg";
import pegasuspassant from "./charge-images/pegasus-passant.svg";
import pegasusrampant from "./charge-images/pegasus-rampant.svg";
import ramrampant from "./charge-images/ram-rampant.svg";
import ramstatant from "./charge-images/ram-statant.svg";
import rose from "./charge-images/rose.svg";
import seahorse from "./charge-images/sea-horse.svg";
import squirrel from "./charge-images/squirrel.svg";
import staglodged from "./charge-images/stag-lodged.svg";
import stagstatant from "./charge-images/stag-statant.svg";
import suninsplendor from "./charge-images/sun-in-splendor.svg";
import tigerpassant from "./charge-images/tiger-passant.svg";
import tigerrampant from "./charge-images/tiger-rampant.svg";
import tower from "./charge-images/tower.svg";
import twoaxesinsaltire from "./charge-images/two-axes-in-saltire.svg";
import twobonesinsaltire from "./charge-images/two-bones-in-saltire.svg";
import unicornstatant from "./charge-images/unicorn-statant.svg";
import wolfpassant from "./charge-images/wolf-passant.svg";
import wolframpant from "./charge-images/wolf-rampant.svg";
import wyvern from "./charge-images/wyvern.svg";

export function all() {
  return [
    new Charge(
      "antelope passant",
      "antelopes passant",
      antelopepassant,
      "regular"
    ),
    new Charge(
      "antelope rampant",
      "antelopes rampant",
      anteloperampant,
      "regular"
    ),
    new Charge(
      "bat volant",
      "bats volant",
      batvolant,
      "regular"
    ),
    new Charge(
      "battleaxe",
      "battleaxes",
      battleaxe,
      "regular"
    ),
    new Charge(
      "bear head couped",
      "bear heads couped",
      bearheadcouped,
      "regular"
    ),
    new Charge(
      "bear rampant",
      "bears rampant",
      bearrampant,
      "regular"
    ),
    new Charge(
      "bear statant",
      "bears statant",
      bearstatant,
      "regular"
    ),
    new Charge(
      "bee volant",
      "bees volant",
      beevolant,
      "regular"
    ),
    new Charge(
      "bell",
      "bells",
      bell,
      "regular"
    ),
    new Charge(
      "boar head erased",
      "boar heads erased",
      boarheaderased,
      "regular"
    ),
    new Charge(
      "boar passant",
      "boars passant",
      boarpassant,
      "regular"
    ),
    new Charge(
      "boar rampant",
      "boars rampant",
      boarrampant,
      "regular"
    ),
    new Charge(
      "castle",
      "castles",
      castle,
      "regular"
    ),
    new Charge(
      "cock",
      "cocks",
      cock,
      "regular"
    ),
    new Charge(
      "cockatrice",
      "cockatrices",
      cockatrice,
      "regular"
    ),
    new Charge(
      "dolphin hauriant",
      "dolphins hauriant",
      dolphinhauriant,
      "regular"
    ),
    new Charge(
      "doubleheaded eagle displayed",
      "doubleheaded eagles displayed",
      doubleheadedeagledisplayed,
      "regular"
    ),
    new Charge(
      "dragon rampant",
      "dragons rampant",
      dragonrampant,
      "regular"
    ),
    new Charge(
      "eagle's head erased",
      "eagle's heads erased",
      eaglesheaderased,
      "regular"
    ),
    new Charge(
      "fox sejant",
      "foxes sejant",
      foxsejant,
      "regular"
    ),
    new Charge(
      "gryphon segreant",
      "gryphons segreant",
      gryphonsegreant,
      "regular"
    ),
    new Charge(
      "hare salient",
      "hares salient",
      haresalient,
      "regular"
    ),
    new Charge(
      "hare",
      "hares",
      hare,
      "regular"
    ),
    new Charge(
      "heron",
      "herons",
      heron,
      "regular"
    ),
    new Charge(
      "horse passant",
      "horses passant",
      horsepassant,
      "regular"
    ),
    new Charge(
      "horse rampant",
      "horses rampant",
      horserampant,
      "regular"
    ),
    new Charge(
      "leopard passant",
      "leopards passant",
      leopardpassant,
      "regular"
    ),
    new Charge(
      "lion passant",
      "lions passant",
      lionpassant,
      "regular"
    ),
    new Charge(
      "lion rampant",
      "lions rampant",
      lionrampant,
      "regular"
    ),
    new Charge(
      "lion's head erased",
      "lion's heads erased",
      lionsheaderased,
      "regular"
    ),
    new Charge(
      "owl",
      "owls",
      owl,
      "regular"
    ),
    new Charge(
      "pegasus passant",
      "pegasuses passant",
      pegasuspassant,
      "regular"
    ),
    new Charge(
      "pegasus rampant",
      "pegasuses rampant",
      pegasusrampant,
      "regular"
    ),
    new Charge(
      "ram rampant",
      "rams rampant",
      ramrampant,
      "regular"
    ),
    new Charge(
      "ram statant",
      "rams statant",
      ramstatant,
      "regular"
    ),
    new Charge(
      "rose",
      "roses",
      rose,
      "regular"
    ),
    new Charge(
      "sea horse",
      "sea horses",
      seahorse,
      "regular"
    ),
    new Charge(
      "squirrel",
      "squirrels",
      squirrel,
      "regular"
    ),
    new Charge(
      "stag lodged",
      "stags lodged",
      staglodged,
      "regular"
    ),
    new Charge(
      "stag statant",
      "stags statant",
      stagstatant,
      "regular"
    ),
    new Charge(
      "sun in splendor",
      "suns in splendor",
      suninsplendor,
      "regular"
    ),
    new Charge(
      "tiger passant",
      "tigers passant",
      tigerpassant,
      "regular"
    ),
    new Charge(
      "tiger rampant",
      "tigers rampant",
      tigerrampant,
      "regular"
    ),
    new Charge(
      "tower",
      "towers",
      tower,
      "regular"
    ),
    new Charge(
      "two axes in saltire",
      "axes in saltire",
      twoaxesinsaltire,
      "regular"
    ),
    new Charge(
      "two bones in saltire",
      "bones in saltire",
      twobonesinsaltire,
      "regular"
    ),
    new Charge(
      "unicorn statant",
      "unicorns statant",
      unicornstatant,
      "regular"
    ),
    new Charge(
      "wolf passant",
      "wolves passant",
      wolfpassant,
      "regular"
    ),
    new Charge(
      "wolf rampant",
      "wolves rampant",
      wolframpant,
      "regular"
    ),
    new Charge(
      "wyvern",
      "wyverns",
      wyvern,
      "regular"
    ),
  ];
}

export function random(charges: Charge[]) {
  return RND.item(charges);
}
