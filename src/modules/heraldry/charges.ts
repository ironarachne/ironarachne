"use strict";

import {create} from "xmlbuilder2";
import axios from "axios";
import * as RND from "../random";
import {Charge} from "@/modules/heraldry/charge";

export function all() {
  return [
    new Charge(
      "antelope passant",
      "antelopes passant",
      "antelope-passant.svg",
      "regular"
    ),
    new Charge(
      "antelope rampant",
      "antelopes rampant",
      "antelope-rampant.svg",
      "regular"
    ),
    new Charge(
      "bat volant",
      "bats volant",
      "bat-volant.svg",
      "regular"
    ),
    new Charge(
      "battleaxe",
      "battleaxes",
      "battleaxe.svg",
      "regular"
    ),
    new Charge(
      "bear head couped",
      "bear heads couped",
      "bear-head-couped.svg",
      "regular"
    ),
    new Charge(
      "bear rampant",
      "bears rampant",
      "bear-rampant.svg",
      "regular"
    ),
    new Charge(
      "bear statant",
      "bears statant",
      "bear-statant.svg",
      "regular"
    ),
    new Charge(
      "bee volant",
      "bees volant",
      "bee-volant.svg",
      "regular"
    ),
    new Charge(
      "bell",
      "bells",
      "bell.svg",
      "regular"
    ),
    new Charge(
      "boar head erased",
      "boar heads erased",
      "boar-head-erased.svg",
      "regular"
    ),
    new Charge(
      "boar passant",
      "boars passant",
      "boar-passant.svg",
      "regular"
    ),
    new Charge(
      "boar rampant",
      "boars rampant",
      "boar-rampant.svg",
      "regular"
    ),
    new Charge(
      "castle",
      "castles",
      "castle.svg",
      "regular"
    ),
    new Charge(
      "cock",
      "cocks",
      "cock.svg",
      "regular"
    ),
    new Charge(
      "cockatrice",
      "cockatrices",
      "cockatrice.svg",
      "regular"
    ),
    new Charge(
      "dolphin hauriant",
      "dolphins hauriant",
      "dolphin-hauriant.svg",
      "regular"
    ),
    new Charge(
      "double-headed eagle displayed",
      "double-headed eagles displayed",
      "double-headed-eagle-displayed.svg",
      "regular"
    ),
    new Charge(
      "dragon rampant",
      "dragons rampant",
      "dragon-rampant.svg",
      "regular"
    ),
    new Charge(
      "eagle's head erased",
      "eagle's heads erased",
      "eagles-head-erased.svg",
      "regular"
    ),
    new Charge(
      "fox sejant",
      "foxes sejant",
      "fox-sejant.svg",
      "regular"
    ),
    new Charge(
      "gryphon segreant",
      "gryphons segreant",
      "gryphon-segreant.svg",
      "regular"
    ),
    new Charge(
      "hare salient",
      "hares salient",
      "hare-salient.svg",
      "regular"
    ),
    new Charge(
      "hare",
      "hares",
      "hare.svg",
      "regular"
    ),
    new Charge(
      "heron",
      "herons",
      "heron.svg",
      "regular"
    ),
    new Charge(
      "horse passant",
      "horses passant",
      "horse-passant.svg",
      "regular"
    ),
    new Charge(
      "horse rampant",
      "horses rampant",
      "horse-rampant.svg",
      "regular"
    ),
    new Charge(
      "leopard passant",
      "leopards passant",
      "leopard-passant.svg",
      "regular"
    ),
    new Charge(
      "lion passant",
      "lions passant",
      "lion-passant.svg",
      "regular"
    ),
    new Charge(
      "lion rampant",
      "lions rampant",
      "lion-rampant.svg",
      "regular"
    ),
    new Charge(
      "lion's head erased",
      "lion's heads erased",
      "lions-head-erased.svg",
      "regular"
    ),
    new Charge(
      "owl",
      "owls",
      "owl.svg",
      "regular"
    ),
    new Charge(
      "pegasus passant",
      "pegasuses passant",
      "pegasus-passant.svg",
      "regular"
    ),
    new Charge(
      "pegasus rampant",
      "pegasuses rampant",
      "pegasus-rampant.svg",
      "regular"
    ),
    new Charge(
      "ram rampant",
      "rams rampant",
      "ram-rampant.svg",
      "regular"
    ),
    new Charge(
      "ram statant",
      "rams statant",
      "ram-statant.svg",
      "regular"
    ),
    new Charge(
      "rose",
      "roses",
      "rose.svg",
      "regular"
    ),
    new Charge(
      "sea horse",
      "sea horses",
      "sea-horse.svg",
      "regular"
    ),
    new Charge(
      "squirrel",
      "squirrels",
      "squirrel.svg",
      "regular"
    ),
    new Charge(
      "stag lodged",
      "stags lodged",
      "stag-lodged.svg",
      "regular"
    ),
    new Charge(
      "stag statant",
      "stags statant",
      "stag-statant.svg",
      "regular"
    ),
    new Charge(
      "sun in splendor",
      "suns in splendor",
      "sun-in-splendor.svg",
      "regular"
    ),
    new Charge(
      "tiger passant",
      "tigers passant",
      "tiger-passant.svg",
      "regular"
    ),
    new Charge(
      "tiger rampant",
      "tigers rampant",
      "tiger-rampant.svg",
      "regular"
    ),
    new Charge(
      "tower",
      "towers",
      "tower.svg",
      "regular"
    ),
    new Charge(
      "two axes in saltire",
      "axes in saltire",
      "two-axes-in-saltire.svg",
      "regular"
    ),
    new Charge(
      "two bones in saltire",
      "bones in saltire",
      "two-bones-in-saltire.svg",
      "regular"
    ),
    new Charge(
      "unicorn statant",
      "unicorns statant",
      "unicorn-statant.svg",
      "regular"
    ),
    new Charge(
      "wolf passant",
      "wolves passant",
      "wolf-passant.svg",
      "regular"
    ),
    new Charge(
      "wolf rampant",
      "wolves rampant",
      "wolf-rampant.svg",
      "regular"
    ),
    new Charge(
      "wyvern",
      "wyverns",
      "wyvern.svg",
      "regular"
    ),
  ];
}

export function load(fileName: string) {
  return axios
    .get("/images/heraldry/charges/" + fileName)
    .then(function (response) {
      return create(response.data);
    });
}

export function random(charges: Charge[]) {
  return RND.item(charges);
}
