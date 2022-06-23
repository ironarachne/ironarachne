'use strict';

import ArtObject from './artobject';
import random from 'random';
import * as RND from '../../random';
import * as Currency from '../../currency/currency';
import * as Words from '../../words';
import type TreasureGenerator from './treasuregenerator';

export default class ArtObjectGenerator implements TreasureGenerator {
  minValue: number;
  maxValue: number;
  count: number;

  constructor(min: number, max: number, count: number) {
    this.minValue = min;
    this.maxValue = max;
    this.count = count;
  }

  generate(): ArtObject[] {
    let objects = [];

    for (let i = 0; i < this.count; i++) {
      let object = new ArtObject();

      object.value = random.int(this.minValue, this.maxValue);
      object.name = getArtObjectForValue(this.minValue, this.maxValue);

      let worth = Currency.valueToCoins(object.value, false, false, false);

      object.description = `${Words.article(object.name)} ${object.name} worth ${worth}`;

      objects.push(object);
    }

    return objects;
  }
}

function getArtObjectForValue(minValue: number, maxValue: number): string {
  const allOptions = getArtObjects();

  let options = [];

  for (let i = 0; i < allOptions.length; i++) {
    if (allOptions[i].value >= minValue && allOptions[i].value <= maxValue) {
      options.push(allOptions[i].name);
    }
  }

  return RND.item(options);
}

function getArtObjects(): { name: string; value: number }[] {
  return [
    {
      name: 'silver ewer',
      value: 2500,
    },
    {
      name: 'carved bone statuette',
      value: 2500,
    },
    {
      name: 'small gold bracelet',
      value: 2500,
    },
    {
      name: 'cloth-of-gold vestments',
      value: 2500,
    },
    {
      name: 'black velvet mask stitched with silver thread',
      value: 2500,
    },
    {
      name: 'copper chalice with silver filigree',
      value: 2500,
    },
    {
      name: 'pair of engraved bone dice',
      value: 2500,
    },
    {
      name: 'small mirror set in a painted wood frame',
      value: 2500,
    },
    {
      name: 'embroidered silk handkerchief',
      value: 2500,
    },
    {
      name: 'gold locket with a painted portrait inside',
      value: 2500,
    },
    {
      name: 'gold ring set with bloodstones',
      value: 25000,
    },
    {
      name: 'carved ivory statuette',
      value: 25000,
    },
    {
      name: 'large gold bracelet',
      value: 25000,
    },
    {
      name: 'silver necklace with a gemstone pendant',
      value: 25000,
    },
    {
      name: 'bronze crown',
      value: 25000,
    },
    {
      name: 'silk robe with gold embroidery',
      value: 25000,
    },
    {
      name: 'large well-made tapestry',
      value: 25000,
    },
    {
      name: 'brass mug with jade inlay',
      value: 25000,
    },
    {
      name: 'box of turquoise animal figurines',
      value: 25000,
    },
    {
      name: 'gold bird cage with electrum filigree',
      value: 25000,
    },
    {
      name: 'silver chalice set with moonstones',
      value: 75000,
    },
    {
      name: 'silver-plated steel longsword with jet set in hilt',
      value: 75000,
    },
    {
      name: 'carved harp of exotic wood with ivory inlay and zircon gems',
      value: 75000,
    },
    {
      name: 'small gold idol',
      value: 75000,
    },
    {
      name: 'gold dragon comb set with red garnets as eyes',
      value: 75000,
    },
    {
      name: 'bottle stopper cork embossed with gold leaf and set with amethysts',
      value: 75000,
    },
    {
      name: 'ceremonial electrum dagger with a black pearl in the pommel',
      value: 75000,
    },
    {
      name: 'silver and gold brooch',
      value: 75000,
    },
    {
      name: 'obsidian statuette with gold fittings and inlay',
      value: 75000,
    },
    {
      name: 'painted gold war mask',
      value: 75000,
    },
    {
      name: 'fine gold chain set with a fire opal',
      value: 250000,
    },
    {
      name: 'old masterpiece painting',
      value: 250000,
    },
    {
      name: 'embroidered silk and velvet mantle set with numerous moonstones',
      value: 250000,
    },
    {
      name: 'platinum bracelet set with a sapphire',
      value: 250000,
    },
    {
      name: 'embroidered glove set with jewel chips',
      value: 250000,
    },
    {
      name: 'jeweled anklet',
      value: 250000,
    },
    {
      name: 'gold music box',
      value: 250000,
    },
    {
      name: 'gold circlet set with four aquamarines',
      value: 250000,
    },
    {
      name: 'eye patch with a mock eye set in blue sapphire and moonstone',
      value: 250000,
    },
    {
      name: 'necklace string of small pink pearls',
      value: 250000,
    },
    {
      name: 'jeweled gold crown',
      value: 750000,
    },
    {
      name: 'jeweled platinum ring',
      value: 750000,
    },
    {
      name: 'small gold stattuete set with rubies',
      value: 750000,
    },
    {
      name: 'gold cup set with emeralds',
      value: 750000,
    },
    {
      name: "painted gold child's sarcophagus",
      value: 750000,
    },
    {
      name: 'jade game board with solid gold playing pieces',
      value: 750000,
    },
    {
      name: 'bejeweled ivory drinking horn with gold filigree',
      value: 750000,
    },
  ];
}
