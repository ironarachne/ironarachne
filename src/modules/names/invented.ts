"use strict";

import * as RND from "../random";

export function generate(patterns: string[]) {
  let name = "";
  let pattern = RND.item(patterns);

  for (let i = 0; i < pattern.length; i++) {
    let letter = parsePatternElement(pattern[i]);
    if (i === 0) {
      letter = letter.toUpperCase();
    }
    name += letter;
  }

  return name;
}

// Note that any uppercase character is used as-is in lowercase form
function parsePatternElement(element: string) {
  let letter = "";

  if (element === "c") {
    letter = randomConsonant();
  } else if (element === "v") {
    letter = randomVowel();
  } else if (element === "p") {
    letter = randomConsonant();
    letter = letter + letter;
  } else if (element === "n") {
    letter = randomNasal();
  } else if (element === "g") {
    letter = randomGlottal();
  } else if (element === "s") {
    letter = randomSibilant();
  } else if (element === "f") {
    letter = randomSoftVowel();
  } else {
    letter = element.toLowerCase();
  }

  return letter;
}

export function randomConsonant() {
  return RND.item([
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
  ]);
}

export function randomGlottal() {
  return RND.item(["g", "k"]);
}

export function randomNasal() {
  return RND.item(["m", "n"]);
}

export function randomSibilant() {
  return RND.item(["f", "s"]);
}

export function randomSoftVowel() {
  return RND.item(["a", "i"]);
}

export function randomVowel() {
  return RND.item(["a", "e", "i", "o", "u"]);
}
