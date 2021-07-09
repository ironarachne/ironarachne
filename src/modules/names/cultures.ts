"use strict";

import * as Invented from "./invented";
import * as RND from "../random";

export function generate() {
  return Invented.generate(patterns());
}

export function generateNameList(gender: string, patterns: string[]) {
  const names = [];

  const femalePatterns = [];
  const familyPatterns = [];
  const malePatterns = [];
  let namePatterns: string[] = [];

  for (let i = 0; i < patterns.length; i++) {
    femalePatterns.push(patterns[i] + RND.item(["A", "I"]));
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
    const name = Invented.generate(namePatterns);
    names.push(name);
  }

  return names;
}

// Generates a set of similar patterns
export function randomNameRoots() {
  const prefixes = ["cvc", "cvd", "vcv", "cvc"];
  const suffixes = ["vc", "vcv", "vn", "sv", "vs"];

  const patterns = [];

  for (let i = 0; i < 2; i++) {
    patterns.push(RND.item(prefixes) + RND.item(suffixes));
  }

  return patterns;
}

function patterns() {
  return ["cvdv", "vccvc", "pvcvc", "cvMANI", "cvcDARI", "cAdERI", "cvcAcI"];
}
