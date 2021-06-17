"use strict";

import * as Words from "../words.js";
import * as RND from "../random.js";

export class MusicStyle {
  constructor(rhythm, beat, dynamic, harmony, melody, pitch, key, timbre) {
    this.rhythm = rhythm;
    this.beat = beat;
    this.dynamic = dynamic;
    this.harmony = harmony;
    this.melody = melody;
    this.pitch = pitch;
    this.key = key;
    this.timbre = timbre;
  }
}

export function describe(style) {
  let description = "This style of music has ";
  description += style.rhythm + " with ";
  description += Words.article(style.beat) + " " + style.beat + " beat. It is ";
  description += style.dynamic + ", with ";
  description += style.harmony + ". It has ";

  if (style.rhythm === "a single rhythm") {
    description += Words.article(style.melody) + " ";
  }

  description += style.melody + " ";

  if (style.rhythm === "a single rhythm") {
    description += "melody";
  } else {
    description += "melodies";
  }

  description += " with ";

  description += Words.article(style.pitch) + " " + style.pitch + " pitch in a ";

  description += style.key + " key. Usually, it has ";

  description += Words.article(style.timbre) + " " + style.timbre + " timbre.";

  return description;
}

export function generate() {
  let style = new MusicStyle(
    randomRhythm(),
    randomBeat(),
    randomDynamic(),
    randomHarmony(),
    randomMelody(),
    randomPitch(),
    randomKey(),
    randomTimbre(),
  );

  style.description = describe(style);

  return style;
}

function randomBeat() {
  let options = [
    {
      value: "very fast",
      weight: 5,
    },
    {
      value: "fast",
      weight: 5,
    },
    {
      value: "moderate",
      weight: 10,
    },
    {
      value: "slow",
      weight: 5,
    },
    {
      value: "very slow",
      weight: 5,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomDynamic() {
  let options = [
    {
      value: "very quiet",
      weight: 5,
    },
    {
      value: "quiet",
      weight: 15,
    },
    {
      value: "loud",
      weight: 15,
    },
    {
      value: "very loud",
      weight: 5,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomHarmony() {
  let options = [
    {
      value: "simple harmony",
      weight: 10,
    },
    {
      value: "two harmonies",
      weight: 1,
    },
    {
      value: "no harmony",
      weight: 5,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomKey() {
  let options = [
    {
      value: "major",
      weight: 10,
    },
    {
      value: "minor",
      weight: 2,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomMelody() {
  let options = [
    {
      value: "simple",
      weight: 10,
    },
    {
      value: "complex",
      weight: 2,
    },
    {
      value: "wandering",
      weight: 2,
    },
    {
      value: "chaotic",
      weight: 1,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomPitch() {
  let options = [
    {
      value: "low",
      weight: 5,
    },
    {
      value: "medium",
      weight: 5,
    },
    {
      value: "high",
      weight: 5,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomRhythm() {
  let options = [
    {
      value: "a single rhythm",
      weight: 100,
    },
    {
      value: "a cross-rhythm",
      weight: 10,
    },
    {
      value: "complex polyrhythm",
      weight: 1,
    },
  ];

  let result = RND.weighted(options);
  return result.value;
}

function randomTimbre() {
  return RND.item([
    "booming",
    "bright",
    "brilliant",
    "dark",
    "emotional",
    "full",
    "mellow",
    "metallic",
    "nasal",
    "reedy",
    "resonant",
    "rough",
    "smooth",
  ]);
}
