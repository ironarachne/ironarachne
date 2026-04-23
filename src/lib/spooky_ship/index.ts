import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

export function generate(rng: RNG) {
  const description = `${Words.capitalize(randomIntro(rng))} ${randomOrigin(rng)} ${randomTwist(rng)}`;

  return description;
}

function randomSize(rng: RNG) {
  return rng.item(['gigantic', 'immense', 'large', 'huge', 'colossal', 'vast']);
}

function randomShip(rng: RNG) {
  return rng.item([
    'derelict',
    'freighter',
    'hulk',
    'mining vessel',
    'warship',
    'passenger liner',
    'merchant ship',
  ]);
}

function randomIntro(rng: RNG) {
  const size = randomSize(rng);
  const part1 = rng.item([
    `${Words.article(size)} ${size} ${randomShip(rng)} ${rng.item([
      'drifts',
      'floats',
    ])} in space ${rng.item(['in front of you', 'here'])}, `,
    `a ${randomShip(rng)} of ${size} proportions is adrift here, `,
  ]);

  const part2 = rng.item([
    'its outer hull breached in several places.',
    'surrounded by strange, dancing lights.',
    'partially obscured by a thick, dark nebula.',
    'its hull shattered and fragmented.',
    'floating endlessly in the vast nothinginess of space.',
    'floating in a cloud of debris.',
    'inexorably being drawn towards a nearby star.',
  ]);

  return part1 + part2;
}

function randomOrigin(rng: RNG) {
  return rng.item([
    "It matches no known ship design you've ever seen.",
    'It appears to be of an ancient design.',
    'There is something distinctly alien about its features.',
    "The ship's contours make it seem familiar, but all identification is obscured or destroyed.",
    "While the ship's design is familiar, it appears to have been heavily modified.",
    "The ship's barely recognizable but it is definitely a model familiar to you.",
  ]);
}

function randomTwist(rng: RNG) {
  return rng.item([
    'Strangely, you are getting life readings from deep within it...',
    'There appears to be an active power source somewhere on the ship.',
    'A distress beacon from the ship beeps weakly.',
    'There is evidence of a fire fight, but the weapon marks match nothing in your experience.',
    'Gashes have been ripped in the hull in some places. They appear to be made by... claws?',
    'Thick layers of ice surround several rips in the hull.',
    'Faint filaments of light surround the vessel, reminiscent of string loosely tangled around something.',
    'Several holes have been burned into the hull. The burn marks are consistent with damage caused by acid.',
    'Fire has consumed several sections of the ship, but it appears that some compartments still hold atmosphere.',
  ]);
}
