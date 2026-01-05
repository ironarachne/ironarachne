import * as DrugTypes from './drug_types';
import * as EffectTypes from './effect_types';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import type Drug from './drug';
import type DrugGeneratorConfig from './drug_generator_config';

export function generate(config: DrugGeneratorConfig): Drug {
  const drugType = RNG.item(config.drugTypes);
  const effectType = RNG.item(config.effectTypes);

  const name = randomName();
  const method = RNG.item(drugType.methods);
  const effectDescription = RNG.item(effectType.effects);
  const strength = randomStrength();
  const color = randomColor();
  const duration = randomDuration();
  const sideEffect = randomSideEffect();
  const commonality = randomCommonality();

  const drug = {
    name,
    description: '',
    drugType,
    method,
    effectType,
    effectDescription,
    strength,
    color,
    duration,
    sideEffect,
    commonality,
  };

  drug.description = describe(drug);

  return drug;
}

export function getDefaultConfig(): DrugGeneratorConfig {
  const drugTypes = DrugTypes.all();
  const effectTypes = EffectTypes.all();

  return {
    drugTypes: drugTypes,
    effectTypes: effectTypes,
  };
}

function describe(drug: Drug): string {
  let description = `${drug.name} is a ${drug.strength} ${drug.effectType.name}. `;
  description += `It's ${Words.article(drug.color)} ${drug.color} ${drug.drugType.name} that is ${drug.method}. `;
  description += drug.effectDescription;
  description += ` ${drug.duration}`;
  description += ` Side effects can include ${drug.sideEffect}. `;
  description += drug.commonality;

  return description;
}

function randomColor(): string {
  const color = RNG.item([
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

  const modifier = RNG.item([
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

  return `${modifier} ${color}`;
}

function randomCommonality(): string {
  return RNG.item([
    'You can find it just about everywhere.',
    "It's hard to find.",
    "It's easy to find.",
    "It's easy to find, if you know the right people.",
    "It's uncommon.",
    "It's fairly rare, unless you know the right people.",
  ]);
}

function randomDuration(): string {
  return RNG.item([
    'One dose lasts for a few minutes.',
    'One dose lasts for an hour or two.',
    'One dose lasts for several hours.',
    'One dose lasts for an entire day.',
    'One dose lasts for half an hour or so.',
  ]);
}

function randomName(): string {
  const nameType = RNG.item([
    {
      name: 'single word',
      generate: () =>
        RNG.item([
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
        ]),
    },
    {
      name: 'numbered word',
      generate: () => {
        const word = RNG.item([
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

        const number = RNG.int(2, 13);

        return `${word}-${number}`;
      },
    },
    {
      name: 'phrase',
      generate: () => {
        const prefix = RNG.item([
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

        const suffix = RNG.item([
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

        return `${prefix} ${suffix}`;
      },
    },
  ]);

  return nameType.generate();
}

function randomSideEffect(): string {
  const result: string[] = [];
  let effects = sideEffects();

  effects = RNG.shuffle(effects);

  const numberOfEffects = RNG.int(1, 3);

  for (let i = 0; i < numberOfEffects; i++) {
    const effect = effects.pop();
    if (effect === undefined) {
      throw new Error('No more effects available.');
    }
    result.push(effect);
  }

  return Words.arrayToPhrase(result);
}

function randomStrength(): string {
  return RNG.item(['powerful', 'strong', 'really potent', 'potent', 'weak', 'very weak']);
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
