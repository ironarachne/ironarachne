import type { RNG } from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

export function generateDish(rng: RNG) {
  let dish = `${randomCookingMethod(rng)} `;

  dish += randomMainComponent(rng);

  const vegetableChance = rng.int(1, 100);

  if (vegetableChance > 50) {
    const combiningWord = rng.item(['and', 'on', 'with']);
    dish += ` ${combiningWord} ${randomVegetable(rng)}`;
  }

  const seasoning = randomSeasoning(rng);

  const seasoningPhrase = rng.item(['seasoned with', 'flavored with', 'spiced with']);

  dish += `, ${seasoningPhrase} ${seasoning}`;

  return dish;
}

function randomCookingMethod(rng: RNG) {
  const items = ['roasted', 'fried', 'baked', 'broiled', 'seared', 'charbroiled'];

  return rng.item(items);
}

function randomFocus(rng: RNG) {
  const items = [
    {
      name: 'vegetable',
      options: [
        'summer squash',
        'butternut squash',
        'eggplant',
        'pumpkin',
        'potatoes',
        'sweet potato',
        'turnips',
        'beets',
        'fennel',
        'carrots',
        'celeriac',
      ],
    },
    {
      name: 'fish',
      options: [
        'trout',
        'bass',
        'salmon',
        'tuna',
        'rainbow trout',
        'cod',
        'red snapper',
        'halibut',
        'catfish',
        'tilapia',
      ],
    },
    {
      name: 'poultry',
      options: ['chicken', 'quail', 'turkey', 'duck', 'pheasant', 'goose', 'squab', 'guineafowl'],
    },
    {
      name: 'livestock',
      options: ['beef', 'pork', 'lamb', 'goat'],
    },
    {
      name: 'game',
      options: [
        'bison',
        'caribou',
        'elk',
        'pronghorn',
        'rabbit',
        'squirrel',
        'venison',
        'wild boar',
      ],
    },
  ];

  const focus = rng.item(items);

  return rng.item(focus.options);
}

function randomMainComponent(rng: RNG) {
  let mainComponent = randomFocus(rng);

  const modifierChance = rng.int(1, 100);
  if (modifierChance > 80) {
    mainComponent += ` ${rng.item(['sausage', 'stew'])}`;
  }

  return mainComponent;
}

function randomSeasoning(rng: RNG) {
  const seasoningCount = randomSeasoningCount(rng);
  const components: string[] = [];

  let options = spices();
  options = options.concat(herbs());

  for (let i = 0; i < seasoningCount; i++) {
    const component = rng.item(options);
    if (!components.includes(component)) {
      components.push(component);
    } else {
      i--;
    }
  }

  return Words.arrayToPhrase(components);
}

function randomSeasoningCount(rng: RNG) {
  const weights = [
    {
      value: 1,
      commonality: 50,
    },
    {
      value: 2,
      commonality: 20,
    },
    {
      value: 3,
      commonality: 5,
    },
  ];

  const result = rng.weighted(weights);

  return result;
}

function randomVegetable(rng: RNG) {
  const items = [
    'broccoli',
    'spinach',
    'lettuce',
    'cabbage',
    'carrots',
    'black beans',
    'green beans',
    'peas',
    'celery',
    'white onions',
    'yellow onions',
    'kidney beans',
    'kale',
    'mushrooms',
  ];

  return rng.item(items);
}

function spices() {
  return [
    'ginger',
    'saffron',
    'salt',
    'pepper',
    'cinnamon',
    'cumin',
    'cardamom',
    'anise',
    'ground mustard',
    'cayenne',
    'chili powder',
    'fenugreek',
    'fennel',
    'lemongrass',
    'turmeric',
    'allspice',
  ];
}

function herbs() {
  return [
    'basil',
    'parsley',
    'cilantro',
    'chives',
    'dill',
    'oregano',
    'rosemary',
    'sage',
    'thyme',
    'tarragon',
  ];
}
