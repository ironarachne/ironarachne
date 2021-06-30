"use strict";

import * as RND from "../random";

const random = require("random");

export function generate() {
  const prefix = randomPrefix();
  const suffix = randomSuffix();

  let name = prefix + suffix;

  const chance = random.int(1, 100);

  if (chance > 85) {
    const number = RND.item([
      "Prime",
      "II",
      "Secondus",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
    ]);

    name += " " + number;
  }

  return name;
}

function randomPrefix() {
  const f = RND.item([
    "K",
    "S",
    "L",
    "C",
    "M",
    "N",
    "P",
    "X",
    "T",
    "Kh",
    "Sh",
    "Th",
  ]);

  const s = RND.item([
    "a",
    "o",
    "e",
    "i",
    "u",
    "y",
  ]);

  let prefix = f + s;

  const chance = random.int(1, 100);

  if (chance >= 70) {
    prefix += RND.item([
      "l",
      "r",
      "s",
      "t",
      "n",
      "p",
      "z",
    ]);
  }

  return prefix;
}

function randomSuffix() {
  const options = [
    "loon",
    "ari",
    "ex",
    "an",
    "nani",
    "dos",
    "res",
    "kis",
    "as",
    "yss",
    "ellia",
    "pus",
    "nosis",
    "ina",
    "ant",
    "ris",
    "ora",
    "dide",
    "ega",
    "iga",
    "rica",
    "teen",
    "onis",
    "zagor",
    "any",
    "eka",
  ];

  return RND.item(options);
}
