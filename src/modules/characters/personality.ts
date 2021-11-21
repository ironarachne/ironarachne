"use strict";

import * as Words from "../words";
import * as RND from "../random";
import PersonalityTrait from "./personality/personalitytrait";
import * as PositiveTraits from "./personality/positivetraits";
import * as NegativeTraits from "./personality/negativetraits";
import Gender from "../gender";

export function getTraitsWithOpposingTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].opposingTags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutOpposingTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (!traits[i].opposingTags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutOpposingTags(traits: PersonalityTrait[], tags: string[]) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    let opposed = false;
    for (let j = 0; j < tags.length; j++) {
      if (traits[i].opposingTags.includes(tags[j])) {
        opposed = true;
      }
    }
    if (!opposed) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].tags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (!traits[i].tags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutTags(traits: PersonalityTrait[], tags: string[]) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    let opposed = false;
    for (let j = 0; j < tags.length; j++) {
      if (traits[i].tags.includes(tags[j])) {
        opposed = true;
      }
    }
    if (!opposed) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getRandomTraits(gender: Gender, numberOfNegativeTraits: number, numberOfPositiveTraits: number): string {
  const positiveTraits = [];
  const negativeTraits = [];

  let allPositiveTraits = PositiveTraits.all();
  let allNegativeTraits = NegativeTraits.all();

  let opposingTags: string[] = [];
  let uniqueOpposingTags = new Set([...opposingTags]);

  allPositiveTraits = RND.shuffle(allPositiveTraits);

  for (let i = 0; i < numberOfPositiveTraits; i++) {
    allPositiveTraits = getTraitsWithoutOpposingTags(allPositiveTraits, opposingTags);
    const positiveTrait = allPositiveTraits.pop();

    if (typeof positiveTrait == 'object') {
      positiveTraits.push(positiveTrait);
      opposingTags = [...opposingTags, ...positiveTrait.opposingTags];
      uniqueOpposingTags = new Set([...opposingTags]);
    }
  }

  opposingTags = [];

  for (let i = 0; i < positiveTraits.length; i++) {
    opposingTags = [...opposingTags, ...positiveTraits[i].tags];
  }

  uniqueOpposingTags = new Set([...opposingTags]);

  allNegativeTraits = RND.shuffle(allNegativeTraits);
  for (let i = 0; i < numberOfNegativeTraits; i++) {
    allNegativeTraits = getTraitsWithoutOpposingTags(allNegativeTraits, opposingTags);
    const negativeTrait = allNegativeTraits.pop();
    if (typeof negativeTrait == 'object') {
      negativeTraits.push(negativeTrait);
      opposingTags = [...opposingTags, ...negativeTrait.opposingTags];
      uniqueOpposingTags = new Set([...opposingTags]);
    }
  }

  console.debug(uniqueOpposingTags); // TODO: Figure out why I was calculating unique opposing tags

  const positive = [];

  for (let i = 0; i < positiveTraits.length; i++) {
    positive.push(positiveTraits[i].name);
  }

  const negative = [];

  for (let i = 0; i < negativeTraits.length; i++) {
    negative.push(negativeTraits[i].name);
  }

  let description = getTraitPhrase(gender, positive, negative);

  return description;
}

export function getTraitPhrase(gender: Gender, positive: string[], negative: string[]): string {
  let options = [];
  const pr = Words.capitalize(gender.subjectivePronoun);

  const positivePhrase = RND.item([
    "reknowned for being",
    "known for being",
    "well known for being",
    "famous for being",
    "loved for being",
  ]);

  const negativePhrase = RND.item([
    "known for being",
    "rumoured to be",
    "infamous for being",
    "reviled for being",
  ]);

  options.push(`${pr} is ${RND.item(positive)}`);
  options.push(pr + ' is ' + Words.arrayToPhrase(positive));
  options.push(pr + ' is ' + positivePhrase + ' ' + RND.item(positive));

  if (negative.length > 0) {
    options.push(`${pr} is ${RND.item(positive)}, but sometimes ${RND.item(negative)}`);
    options.push(pr + ' is ' + Words.arrayToPhrase(positive) + ", but also " + Words.arrayToPhrase(negative));
    options.push(pr + ' is ' + negativePhrase + ' ' + RND.item(negative));
  }

  return RND.item(options);
}
