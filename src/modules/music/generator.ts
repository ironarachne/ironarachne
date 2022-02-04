'use strict';

import * as RND from '../random';
import * as Words from '../words';
import MusicStyle from './style';

export function describe(style: MusicStyle) {
  let description = 'This style of music has ';
  description += style.rhythm + ' with ';
  description += Words.article(style.beat) + ' ' + style.beat + ' beat. It is ';
  description += style.dynamic + ', with ';
  description += style.harmony + '. It has ';

  if (style.rhythm === 'a single rhythm') {
    description += Words.article(style.melody) + ' ';
  }

  description += style.melody + ' ';

  if (style.rhythm === 'a single rhythm') {
    description += 'melody';
  } else {
    description += 'melodies';
  }

  description += ' with ';

  description += Words.article(style.pitch) + ' ' + style.pitch + ' pitch in a ';

  description += style.key + ' key. Usually, it has ';

  description += Words.article(style.timbre) + ' ' + style.timbre + ' timbre.';

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
      value: 'very fast',
      commonality: 5,
    },
    {
      value: 'fast',
      commonality: 5,
    },
    {
      value: 'moderate',
      commonality: 10,
    },
    {
      value: 'slow',
      commonality: 5,
    },
    {
      value: 'very slow',
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomDynamic() {
  const options = [
    {
      value: 'very quiet',
      commonality: 5,
    },
    {
      value: 'quiet',
      commonality: 15,
    },
    {
      value: 'loud',
      commonality: 15,
    },
    {
      value: 'very loud',
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomHarmony() {
  const options = [
    {
      value: 'simple harmony',
      commonality: 10,
    },
    {
      value: 'two harmonies',
      commonality: 1,
    },
    {
      value: 'no harmony',
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomKey() {
  const options = [
    {
      value: 'major',
      commonality: 10,
    },
    {
      value: 'minor',
      commonality: 2,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomMelody() {
  const options = [
    {
      value: 'simple',
      commonality: 10,
    },
    {
      value: 'complex',
      commonality: 2,
    },
    {
      value: 'wandering',
      commonality: 2,
    },
    {
      value: 'chaotic',
      commonality: 1,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomPitch() {
  const options = [
    {
      value: 'low',
      commonality: 5,
    },
    {
      value: 'medium',
      commonality: 5,
    },
    {
      value: 'high',
      commonality: 5,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomRhythm() {
  const options = [
    {
      value: 'a single rhythm',
      commonality: 100,
    },
    {
      value: 'a cross-rhythm',
      commonality: 10,
    },
    {
      value: 'complex polyrhythm',
      commonality: 1,
    },
  ];

  const result = RND.weighted(options);
  return result.value;
}

function randomTimbre() {
  return RND.item([
    'booming',
    'bright',
    'brilliant',
    'dark',
    'emotional',
    'full',
    'mellow',
    'metallic',
    'nasal',
    'reedy',
    'resonant',
    'rough',
    'smooth',
  ]);
}
