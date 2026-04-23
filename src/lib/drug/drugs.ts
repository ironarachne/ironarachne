import * as DrugTypes from './drug_types';
import * as EffectTypes from './effect_types';
import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import type Drug from './drug';
import type DrugGeneratorConfig from './drug_generator_config';

export function generate(config: DrugGeneratorConfig, rng: RNG): Drug {
  const drugType = rng.item(config.drugTypes);
  const effectType = rng.item(config.effectTypes);

  const name = randomName(rng);
  const method = rng.item(drugType.methods);
  const effectDescription = rng.item(effectType.effects);
  const strength = randomStrength(rng);
  const color = randomColor(rng);
  const duration = randomDuration(rng);
  const sideEffect = randomSideEffect(rng);
  const commonality = randomCommonality(rng);

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

function randomColor(rng: RNG): string {
  const color = rng.item([
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

  const modifier = rng.item([
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

function randomCommonality(rng: RNG): string {
  return rng.item([
    'You can find it just about everywhere.',
    "It's hard to find.",
    "It's easy to find.",
    "It's easy to find, if you know the right people.",
    "It's uncommon.",
    "It's fairly rare, unless you know the right people.",
  ]);
}

function randomDuration(rng: RNG): string {
  return rng.item([
    'One dose lasts for a few minutes.',
    'One dose lasts for an hour or two.',
    'One dose lasts for several hours.',
    'One dose lasts for an entire day.',
    'One dose lasts for half an hour or so.',
  ]);
}

function randomName(rng: RNG): string {
  const nameType = rng.item([
    {
      name: 'single word',
      generate: () =>
        rng.item([
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
        const word = rng.item([
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

        const number = rng.int(2, 13);

        return `${word}-${number}`;
      },
    },
    {
      name: 'phrase',
      generate: () => {
        const prefix = rng.item([
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

        const suffix = rng.item([
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

function randomSideEffect(rng: RNG): string {
  const result: string[] = [];
  let effects = sideEffects();

  effects = rng.shuffle(effects);

  const numberOfEffects = rng.int(1, 3);

  for (let i = 0; i < numberOfEffects; i++) {
    const effect = effects.pop();
    if (effect === undefined) {
      throw new Error('No more effects available.');
    }
    result.push(effect);
  }

  return Words.arrayToPhrase(result);
}

function randomStrength(rng: RNG): string {
  return rng.item(['powerful', 'strong', 'really potent', 'potent', 'weak', 'very weak']);
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
