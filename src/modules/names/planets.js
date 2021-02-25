import * as iarnd from "../random.js";

const random = require("random");

export function generate() {
  let prefix = randomPrefix();
  let suffix = randomSuffix();

  let name = prefix + suffix;

  let chance = random.int(1, 100);

  if (chance > 85) {
    let number = iarnd.item([
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
  let f = iarnd.item([
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

  let s = iarnd.item([
    "a",
    "o",
    "e",
    "i",
    "u",
    "y",
  ]);

  let prefix = f+s;

  let chance = random.int(1, 100);

  if (chance >= 70) {
    prefix += iarnd.item([
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
  let options = [
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

  return iarnd.item(options);
}
