import * as iarnd from "../random.js";

export function generate(patterns) {
  let name = "";
  let pattern = iarnd.item(patterns);

  for (let i = 0; i < pattern.length; i++) {
    let letter = parsePatternElement(pattern[i]);
    if (i == 0) {
      letter = letter.toUpperCase();
    }
    name += letter;
  }

  return name;
}

// Note that any uppercase character is used as-is in lowercase form
function parsePatternElement(element) {
  let letter = "";

  if (element == "c") {
    letter = randomConsonant();
  } else if (element == "v") {
    letter = randomVowel();
  } else if (element == "p") {
    letter = randomConsonant();
    letter = letter + letter;
  } else if (element == "n") {
    letter = randomNasal();
  } else if (element == "g") {
    letter = randomGlottal();
  } else if (element == "s") {
    letter = randomSibilant();
  } else if (element == "f") {
    letter = randomSoftVowel();
  } else {
    letter = element.toLowerCase();
  }

  return letter;
}

export function randomConsonant() {
  return iarnd.item([
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
  return iarnd.item(["g", "k"]);
}

export function randomNasal() {
  return iarnd.item(["m", "n"]);
}

export function randomSibilant() {
  return iarnd.item(["f", "s"]);
}

export function randomSoftVowel() {
  return iarnd.item(["a", "i"]);
}

export function randomVowel() {
  return iarnd.item(["a", "e", "i", "o", "u"]);
}
