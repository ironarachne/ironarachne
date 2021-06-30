"use strict";

import * as Words from "../words";
import * as RND from "../random";

export class MusicStyle {
  rhythm: string;
  beat: string;
  dynamic: string;
  harmony: string;
  melody: string;
  pitch: string;
  key: string;
  timbre: string;
  description: string;

  constructor(rhythm: string, beat: string, dynamic: string, harmony: string, melody: string, pitch: string, key: string, timbre: string) {
    this.rhythm = rhythm;
    this.beat = beat;
    this.dynamic = dynamic;
    this.harmony = harmony;
    this.melody = melody;
    this.pitch = pitch;
    this.key = key;
    this.timbre = timbre;
    this.description = "";
  }
}

export function describe(style: MusicStyle) {
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
  const style = new MusicStyle(
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
  const options = [
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

  const result = RND.weighted(options);
  return result.value;
}

function randomDynamic() {
  const options = [
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

  const result = RND.weighted(options);
  return result.value;
}

function randomHarmony() {
  const options = [
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

  const result = RND.weighted(options);
  return result.value;
}

function randomKey() {
  const options = [
    {
      value: "major",
      weight: 10,
    },
    {
      value: "minor",
      weight: 2,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomMelody() {
  const options = [
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

  const result = RND.weighted(options);
  return result.value;
}

function randomPitch() {
  const options = [
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

  const result = RND.weighted(options);
  return result.value;
}

function randomRhythm() {
  const options = [
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

  const result = RND.weighted(options);
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
