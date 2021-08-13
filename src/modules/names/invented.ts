"use strict";

import * as RND from "../random";
import * as Words from "../words";

export function generate(patterns: string[]) {
  let name = "";
  const pattern = RND.item(patterns);

  for (let i = 0; i < pattern.length; i++) {
    name += parsePatternElement(pattern[i]);;
  }

  return Words.capitalize(name);
}

// Note that any uppercase character is used as-is in lowercase form
function parsePatternElement(element: string) {
  let letter = "";

  const elements = {
    a: randomAffricate(),
    c: randomConsonant(),
    d: (() => { let result = randomConsonant(); return result + result; })(),
    f: randomFricative(),
    l: randomLiquid(),
    n: randomNasal(),
    p: randomPlosive(),
    s: randomSibilant(),
    t: randomStrident(),
    u: (() => { let result = randomVowel(); return result + result })(),
    v: randomVowel(),
  }

  if ("acdflnpstv".includes(element)) {
    letter = elements[element];
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

export function randomAffricate() {
  return RND.item(["ch", "j"]);
}

export function randomFricative() {
  return RND.item(["f", "v"]);
}

export function randomLiquid() {
  return RND.item(["l", "r"]);
}

export function randomPlosive() {
  return RND.item(["g", "k", "p", "b", "t", "d", "q"]);
}

export function randomNasal() {
  return RND.item(["m", "n", "ng"]);
}

export function randomSibilant() {
  return RND.item(["s", "sh", "z", "zh"]);
}

export function randomStrident() {
  return RND.item(["f", "v", "s", "sh", "z", "zh"]);
}

export function randomVowel() {
  return RND.item(["a", "e", "i", "o", "u"]);
}
