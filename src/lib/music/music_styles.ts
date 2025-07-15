import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";

export type MusicStyle = {
  beat: string;
  description: string;
  dynamic: string;
  harmony: string;
  key: string;
  melody: string;
  pitch: string;
  rhythm: string;
  timbre: string;
};

export function describeMusicStyle(style: MusicStyle): string {
  let description = "This style of music has ";
  description += `${style.rhythm} with `;
  description += `${Words.article(style.beat, true)} beat. It is `;
  description += `${style.dynamic}, with `;
  description += `${style.harmony}. It ${RND.item(["often", "commonly", "usually", "frequently"])} has `;

  if (style.rhythm === "a single rhythm") {
    description += `${Words.article(style.melody)} `;
  }

  description += `${style.melody} `;

  if (style.rhythm === "a single rhythm") {
    description += "melody";
  } else {
    description += "melodies";
  }

  description += " with ";

  description += `${Words.article(style.pitch, true)} pitch in a `;

  description += `${style.key} key. Usually, it has `;

  description += `${Words.article(style.timbre, true)} timbre.`;

  return description;
}

export function generateMusicStyle(): MusicStyle {
  const style: MusicStyle = {
    description: "",
    rhythm: randomRhythm(),
    beat: randomBeat(),
    dynamic: randomDynamic(),
    harmony: randomHarmony(),
    key: randomKey(),
    melody: randomMelody(),
    pitch: randomPitch(),
    timbre: randomTimbre(),
  };
  style.description = describeMusicStyle(style);
  return style;
}

export function randomBeat(): string {
  const options = [
    {
      value: "very fast",
      commonality: 5,
    },
    {
      value: "fast",
      commonality: 5,
    },
    {
      value: "moderate",
      commonality: 10,
    },
    {
      value: "slow",
      commonality: 5,
    },
    {
      value: "very slow",
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

export function randomDynamic(): string {
  const options = [
    {
      value: "very quiet",
      commonality: 5,
    },
    {
      value: "quiet",
      commonality: 15,
    },
    {
      value: "loud",
      commonality: 15,
    },
    {
      value: "very loud",
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

export function randomHarmony() {
  const options = [
    {
      value: "simple harmony",
      commonality: 10,
    },
    {
      value: "two harmonies",
      commonality: 1,
    },
    {
      value: "no harmony",
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

export function randomKey(): string {
  const roots = ["C", "D", "E", "F", "G", "A", "B"];
  const modes = [
    { value: "major", commonality: 10 },
    { value: "minor", commonality: 5 },
    { value: "Dorian", commonality: 2 },
    { value: "Phrygian", commonality: 2 },
    { value: "Lydian", commonality: 2 },
    { value: "Mixolydian", commonality: 2 },
    { value: "Aeolian", commonality: 1 },
    { value: "Locrian", commonality: 1 },
    { value: "pentatonic major", commonality: 2 },
    { value: "pentatonic minor", commonality: 2 },
    { value: "chromatic", commonality: 1 },
  ];
  const root = RND.item(roots);
  const mode = RND.weighted(modes).value;
  return `${root} ${mode}`;
}

export function randomMelody(): string {
  const options = [
    {
      value: "simple",
      commonality: 10,
    },
    {
      value: "complex",
      commonality: 2,
    },
    {
      value: "focused",
      commonality: 5,
    },
    {
      value: "wandering",
      commonality: 2,
    },
    {
      value: "chaotic",
      commonality: 1,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

export function randomPitch(): string {
  const options = [
    {
      value: "low",
      commonality: 5,
    },
    {
      value: "medium",
      commonality: 5,
    },
    {
      value: "high",
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

export function randomRhythm(): string {
  const options = [
    {
      value: "a single rhythm",
      commonality: 100,
    },
    {
      value: "a cross-rhythm",
      commonality: 10,
    },
    {
      value: "complex polyrhythm",
      commonality: 1,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

export function randomTimbre(): string {
  return RND.item([
    "airy",
    "booming",
    "bright",
    "brilliant",
    "clear",
    "crisp",
    "dark",
    "dull",
    "emotional",
    "full",
    "gritty",
    "harsh",
    "hollow",
    "mellow",
    "metallic",
    "nasal",
    "piercing",
    "reedy",
    "resonant",
    "rich",
    "rough",
    "sharp-edged",
    "sharp",
    "sibilant",
    "silky",
    "sizzling",
    "smooth",
    "soft",
    "thin",
    "tinkling",
    "twangy",
    "vibrant",
    "warm",
    "whispering",
    "woody",
  ]);
}
