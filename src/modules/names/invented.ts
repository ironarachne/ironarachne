"use strict";

import * as RND from "../random";
import * as Words from "../words";

export function generate(patterns: string[]): string {
  let name = "";
  const pattern = RND.item(patterns);

  for (let i = 0; i < pattern.length; i++) {
    name += parsePatternElement(pattern[i]);;
  }

  return Words.capitalize(name);
}

// Note that any uppercase character is used as-is in lowercase form
function parsePatternElement(element: string): string {
  let letter = "";

  const elements = {
    a: randomAffricate(),
    b: randomVoicedDentalPlosive(),
    c: randomConsonant(),
    d: (() => { let result = randomConsonant(); return result + result; })(),
    e: randomDental(),
    f: randomFricative(),
    h: randomVoicelessDentalPlosive(),
    i: randomVoiceless(),
    k: randomVelarPlosive(),
    l: randomLiquid(),
    m: randomCloseMidVowel(),
    n: randomNasal(),
    o: randomStop(),
    p: randomPlosive(),
    s: randomSibilant(),
    t: randomStrident(),
    u: (() => { let result = randomVowel(); return result + result })(),
    v: randomVowel(),
    w: randomVelar(),
    y: randomOpenVowel(),
    x: randomAccentedVowel(),
  }

  if ("abcdefhiklmnopstuvwyx".includes(element)) {
    letter = elements[element];
  } else {
    letter = element.toLowerCase();
  }

  return letter;
}

export function randomConsonant(): string {
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

export function randomAccentedVowel(): string {
  return RND.item(["á", "é", "í", "ó", "ú"]);
}

export function randomAffricate(): string {
  return RND.item(["ch", "j"]);
}

export function randomCloseMidVowel(): string {
  return RND.item(["i", "ö", "eu", "oe", "e"]);
}

export function randomDental(): string {
  return RND.item(["d", "n", "t", "l"]);
}

export function randomFricative(): string {
  return RND.item(["f", "v"]);
}

export function randomLiquid(): string {
  return RND.item(["l", "r"]);
}

export function randomOpenVowel(): string {
  return RND.item(["e", "ee", "i", "oo", "y", "ie"]);
}

export function randomPlosive(): string {
  return RND.item(["g", "k", "p", "b", "t", "d", "q"]);
}

export function randomNasal(): string {
  return RND.item(["m", "n", "ng"]);
}

export function randomSibilant(): string {
  return RND.item(["s", "sh", "z", "zh"]);
}

export function randomStrident(): string {
  return RND.item(["f", "v", "s", "sh", "z", "zh"]);
}

export function randomStop(): string {
  return RND.item(["t", "d", "p"]);
}

export function randomVelar(): string {
  return RND.item(["w", "wh", "g"]);
}

export function randomVelarPlosive(): string {
  return RND.item(["c", "k"]);
}

export function randomVoicedDentalPlosive(): string {
  return RND.item(["d", "dh"]);
}

export function randomVoiceless(): string {
  return RND.item(["h", "f"]);
}

export function randomVoicelessDentalPlosive(): string {
  return RND.item(["t", "th"]);
}

export function randomVowel(): string {
  return RND.item(["a", "e", "i", "o", "u"]);
}
