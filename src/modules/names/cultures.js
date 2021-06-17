"use strict";

import * as Invented from "./invented.js";
import * as RND from "../random.js";

export function generate() {
  return Invented.generate(patterns());
}

export function generateNameList(gender, patterns) {
  let names = [];

  let femalePatterns = [];
  let familyPatterns = [];
  let malePatterns = [];
  let namePatterns = [];

  for (let i = 0; i < patterns.length; i++) {
    femalePatterns.push(patterns[i] + "f");
    malePatterns.push(patterns[i]);
    familyPatterns.push(patterns[i] + RND.item(["cv", "vcv"]));
  }

  if (gender === "male") {
    namePatterns = malePatterns;
  } else if (gender === "female") {
    namePatterns = femalePatterns;
  } else if (gender === "family") {
    namePatterns = familyPatterns;
  }

  for (let i = 0; i < 10; i++) {
    let name = Invented.generate(namePatterns);
    names.push(name);
  }

  return names;
}

// Generates a set of similar patterns
export function randomNameRoots() {
  let prefixes = ["cvc", "cvp", "vcv", "cvc"];
  let suffixes = ["vc", "vcv", "vn", "sv", "vs"];

  let patterns = [];

  for (let i = 0; i < 2; i++) {
    patterns.push(RND.item(prefixes) + RND.item(suffixes));
  }

  return patterns;
}

function patterns() {
  return ["cvpv", "vccvc", "gvcvc", "cvMANI", "cvcDARI", "cApERI", "cvcAcI"];
}
