import { create } from "xmlbuilder2";
import axios from "axios";
import * as iarnd from "../random.js";

export function all() {
  return [
    {
      name: "antelope passant",
      plural: "antelopes passant",
      fileName: "antelope-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "antelope rampant",
      plural: "antelopes rampant",
      fileName: "antelope-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "bat volant",
      plural: "bats volant",
      fileName: "bat-volant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "battleaxe",
      plural: "battleaxes",
      fileName: "battleaxe.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "bear head couped",
      plural: "bear heads couped",
      fileName: "bear-head-couped.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "bear rampant",
      plural: "bears rampant",
      fileName: "bear-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "bear statant",
      plural: "bears statant",
      fileName: "bear-statant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "bee volant",
      plural: "bees volant",
      fileName: "bee-volant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "bell",
      plural: "bells",
      fileName: "bell.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "boar head erased",
      plural: "boar heads erased",
      fileName: "boar-head-erased.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "boar passant",
      plural: "boars passant",
      fileName: "boar-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "boar rampant",
      plural: "boars rampant",
      fileName: "boar-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "castle",
      plural: "castles",
      fileName: "castle.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "cock",
      plural: "cocks",
      fileName: "cock.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "cockatrice",
      plural: "cockatrices",
      fileName: "cockatrice.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "dolphin hauriant",
      plural: "dolphins hauriant",
      fileName: "dolphin-hauriant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "double-headed eagle displayed",
      plural: "double-headed eagles displayed",
      fileName: "double-headed-eagle-displayed.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "dragon rampant",
      plural: "dragons rampant",
      fileName: "dragon-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "eagle's head erased",
      plural: "eagle's heads erased",
      fileName: "eagles-head-erased.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "fox sejant",
      plural: "foxes sejant",
      fileName: "fox-sejant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "gryphon segreant",
      plural: "gryphons segreant",
      fileName: "gryphon-segreant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "hare salient",
      plural: "hares salient",
      fileName: "hare-salient.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "hare",
      plural: "hares",
      fileName: "hare.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "heron",
      plural: "herons",
      fileName: "heron.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "horse passant",
      plural: "horses passant",
      fileName: "horse-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "horse rampant",
      plural: "horses rampant",
      fileName: "horse-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "leopard passant",
      plural: "leopards passant",
      fileName: "leopard-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "lion passant",
      plural: "lions passant",
      fileName: "lion-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "lion rampant",
      plural: "lions rampant",
      fileName: "lion-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "lion's head erased'",
      plural: "lions's heads erased'",
      fileName: "lions-head-erased.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "owl",
      plural: "owls",
      fileName: "owl.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "pegasus passant",
      plural: "pegasuses passant",
      fileName: "pegasus-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "pegasus rampant",
      plural: "pegasuses rampant",
      fileName: "pegasus-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "ram rampant",
      plural: "rams rampant",
      fileName: "ram-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "ram statant",
      plural: "rams statant",
      fileName: "ram-statant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "rose",
      plural: "roses",
      fileName: "rose.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "sea horse",
      plural: "sea horses",
      fileName: "sea-horse.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "squirrel",
      plural: "squirrels",
      fileName: "squirrel.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "stag lodged",
      plural: "stags lodged",
      fileName: "stag-lodged.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "stag statant",
      plural: "stags statant",
      fileName: "stag-statant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "sun in splendor",
      plural: "suns in splendor",
      fileName: "sun-in-splendor.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "tiger passant",
      plural: "tigers passant",
      fileName: "tiger-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "tiger rampant",
      plural: "tigers rampant",
      fileName: "tiger-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "tower",
      plural: "towers",
      fileName: "tower.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "two axes in saltire",
      plural: "axes in saltire",
      fileName: "two-axes-in-saltire.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "two bones in saltire",
      plural: "bones in saltire",
      fileName: "two-bones-in-saltire.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "unicorn statant",
      plural: "unicorns statant",
      fileName: "unicorn-statant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "wolf passant",
      plural: "wolves passant",
      fileName: "wolf-passant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "wolf rampant",
      plural: "wolves rampant",
      fileName: "wolf-rampant.svg",
      type: "regular",
      svg: "",
    },
    {
      name: "wyvern",
      plural: "wyverns",
      fileName: "wyvern.svg",
      type: "regular",
      svg: "",
    },
  ];
}

export function load(fileName) {
  return axios
    .get("/images/heraldry/charges/" + fileName)
    .then(function (response) {
      return create(response.data);
    });
}

export function random(charges) {
  return iarnd.item(charges);
}
