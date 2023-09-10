import * as Words from "@ironarachne/words";
import DrugType from "./drugtype.js";

export function all() {
  return [gas(), liquid(), ointment(), powder(), paste(), pill()];
}

function gas(): DrugType {
  let verbs = ["inhaled", "breathed in", "sniffed"];

  let options = ["breather", "aerosol", "small spray can", "long tube", "palm-sized tank"];

  let descriptions = [];

  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} from ${Words.article(options[y])} ${options[y]}`);
    }
  }

  return new DrugType("gas", descriptions);
}

function liquid(): DrugType {
  let options = ["arm", "leg", "heart", "neck"];

  let descriptions = [
    "drank straight",
    "put into cocktails and drank",
    "diluted with water and drank",
    "dropped into the eyes",
    "squirted into the eyes",
    "sprayed into the eyes",
  ];

  for (let y = 0; y < options.length; y++) {
    descriptions.push(`injected in the ${options[y]}`);
  }

  return new DrugType("liquid", descriptions);
}

function ointment(): DrugType {
  let verbs = ["spread", "dabbed", "brushed", "rubbed"];

  let options = ["face", "hands", "skin", "forehead", "lips"];

  let descriptions = [];

  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} on the ${options[y]}`);
    }
  }

  return new DrugType("ointment", descriptions);
}

function paste(): DrugType {
  let verbs = ["spread", "smeared", "rubbed"];

  let options = ["face", "hands", "skin", "forehead", "lips", "throat"];

  let descriptions = [];

  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} on the ${options[y]}`);
    }
  }

  return new DrugType("paste", descriptions);
}

function pill(): DrugType {
  let descriptions = [
    "crushed into food and eaten",
    "swallowed whole",
    "swallowed with a beverage",
    "mixed into food and eaten",
    "chewed",
  ];

  return new DrugType("pill", descriptions);
}

function powder(): DrugType {
  let descriptions = [
    "inhaled",
    "breathed in",
    "snorted",
    "put in liquids and drank",
    "added to oil and rubbed on the skin",
  ];

  return new DrugType("powder", descriptions);
}
