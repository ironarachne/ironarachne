'use strict';

import DrugGeneratorConfig from './generatorconfig';
import * as RND from '../random';
import Drug from './drug';
import random from 'random';
import * as Words from '../words';

export default class DrugGenerator {
  config: DrugGeneratorConfig;

  constructor() {
    this.config = new DrugGeneratorConfig();
  }

  generate(): Drug {
    let drug = new Drug(RND.item(this.config.drugTypes), RND.item(this.config.effectTypes));

    drug.name = randomName();
    drug.method = RND.item(drug.drugType.methods);
    drug.effectDescription = RND.item(drug.effectType.effects);
    drug.strength = randomStrength();
    drug.color = randomColor();
    drug.duration = randomDuration();
    drug.sideEffect = randomSideEffect();
    drug.commonality = randomCommonality();

    return drug;
  }
}

function randomColor(): string {
  const color = RND.item([
    'amber',
    'azure',
    'blue',
    'brown',
    'coppery',
    'crimson',
    'emerald',
    'golden',
    'green',
    'magenta',
    'orange',
    'pink',
    'purple',
    'red',
    'ruby',
    'sapphire',
    'turqoise',
    'violet',
    'yellow',
  ]);

  const modifier = RND.item([
    'bright',
    'dark',
    'fluorescent',
    'glittering',
    'glowing',
    'light',
    'pearlescent',
    'shining',
    'sparkling',
  ]);

  return modifier + ' ' + color;
}

function randomCommonality(): string {
  return RND.item([
    'You can find it just about everywhere.',
    "It's hard to find.",
    "It's easy to find.",
    "It's easy to find, if you know the right people.",
    "It's uncommon.",
    "It's fairly rare, unless you know the right people.",
  ]);
}

function randomDuration(): string {
  return RND.item([
    'One dose lasts for a few minutes.',
    'One dose lasts for an hour or two.',
    'One dose lasts for several hours.',
    'One dose lasts for an entire day.',
    'One dose lasts for half an hour or so.',
  ]);
}

function randomName(): string {
  const nameType = RND.item([
    {
      name: 'single word',
      generate: function () {
        return RND.item([
          'Angel',
          'Arc',
          'Bright',
          'Burn',
          'Burst',
          'Dreg',
          'Dust',
          'Frost',
          'Ice',
          'Jazz',
          'Shade',
          'Shadow',
          'Sky',
          'Slice',
          'Spice',
          'Stardust',
          'Synth',
          'Toxin',
          'Venom',
        ]);
      },
    },
    {
      name: 'numbered word',
      generate: function () {
        let word = RND.item([
          'Angel',
          'Arc',
          'Bright',
          'Burn',
          'Burst',
          'Dreg',
          'Dust',
          'Frost',
          'Ice',
          'Jazz',
          'Shade',
          'Shadow',
          'Sky',
          'Slice',
          'Spice',
          'Stardust',
          'Synth',
          'Toxin',
          'Venom',
        ]);

        let number = random.int(2, 13);

        return `${word}-${number}`;
      },
    },
    {
      name: 'phrase',
      generate: function () {
        const prefix = RND.item([
          'Angel',
          'Black',
          'Blue',
          'Bright',
          'Demon',
          'Devil',
          'Easy',
          'Fire',
          'Gold',
          'Green',
          'Ice',
          'Night',
          'Slash',
          'Star',
          'Street',
          'White',
        ]);

        const suffix = RND.item([
          'Dream',
          'Dust',
          'Fantasy',
          'Flower',
          'Glow',
          'Jack',
          'Jolt',
          'Lotus',
          'Sand',
          'Shade',
          'Spice',
          'Stutter',
          'Trip',
          'Wonder',
        ]);

        return prefix + ' ' + suffix;
      },
    },
  ]);

  return nameType.generate();
}

function randomSideEffect(): string {
  let result = [];
  let effects = sideEffects();

  effects = RND.shuffle(effects);

  let numberOfEffects = random.int(1, 3);

  for (let i = 0; i < numberOfEffects; i++) {
    result.push(effects.pop());
  }

  return Words.arrayToPhrase(result);
}

function randomStrength(): string {
  return RND.item(['powerful', 'strong', 'really potent', 'potent', 'weak', 'very weak']);
}

function sideEffects(): string[] {
  return [
    'a burning sensation over your entire body',
    'horrific nightmares',
    'dry mouth',
    'trouble sleeping',
    'increased aggression',
    'brain damage',
    'liver damage',
    'difficulty breathing',
    'bloodshot eyes',
    'horrible breath',
    'pallid skin',
    'extreme fatigue',
    'nervousness',
    'paranoia',
    'vomiting',
    'uncontrollable flatulence',
    'diarrhea',
    'uncontrollable shaking',
    'psychosis',
    'schizophrenia',
    'sensitivity to pain',
    'sensitivity to light',
    'weakness',
    'temporary paralysis',
    'reduced ability to think',
    'reduced ability to feel pleasure when not high',
  ];
}
