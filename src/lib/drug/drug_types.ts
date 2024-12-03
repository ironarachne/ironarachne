import * as Words from "@ironarachne/words";
import type DrugType from "./drug_type";

export function all() {
  return [gas(), liquid(), ointment(), powder(), paste(), pill()];
}

function gas(): DrugType {
  const verbs = ["inhaled", "breathed in", "sniffed"];

  const options = ["breather", "aerosol", "small spray can", "long tube", "palm-sized tank"];

  const descriptions = [];

  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} from ${Words.article(options[y])} ${options[y]}`);
    }
  }

  return {
    name: "gas", 
    methods: descriptions
  };
}

function liquid(): DrugType {
  const options = ["arm", "leg", "heart", "neck"];

  const descriptions = [
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

  return {
    name: "liquid",
    methods: descriptions
  }
}

function ointment(): DrugType {
  const verbs = ["spread", "dabbed", "brushed", "rubbed"];

  const options = ["face", "hands", "skin", "forehead", "lips"];

  const descriptions = [];

  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} on the ${options[y]}`);
    }
  }

  return {
    name: "ointment",
    methods: descriptions
  }
}

function paste(): DrugType {
  const verbs = ["spread", "smeared", "rubbed"];

  const options = ["face", "hands", "skin", "forehead", "lips", "throat"];

  const descriptions = [];

  for (let x = 0; x < verbs.length; x++) {
    for (let y = 0; y < options.length; y++) {
      descriptions.push(`${verbs[x]} on the ${options[y]}`);
    }
  }

  return {
    name: "paste",
    methods: descriptions
  }
}

function pill(): DrugType {
  const descriptions = [
    "crushed into food and eaten",
    "swallowed whole",
    "swallowed with a beverage",
    "mixed into food and eaten",
    "chewed",
  ];

  return {
    name: "pill",
    methods: descriptions
  }
}

function powder(): DrugType {
  const descriptions = [
    "inhaled",
    "breathed in",
    "snorted",
    "put in liquids and drank",
    "added to oil and rubbed on the skin",
  ];

  return {
    name: "powder",
    methods: descriptions
  }
}
