'use strict';

import Gem from './gem';
import random from 'random';
import * as RND from '../../random';
import * as Currency from '../../currency/currency';
import * as Words from '../../words';
import type TreasureGenerator from './treasuregenerator';

export default class GemGenerator implements TreasureGenerator {
  minValue: number;
  maxValue: number;
  gemCount: number;

  constructor(min: number, max: number, gemCount: number) {
    this.minValue = min;
    this.maxValue = max;
    this.gemCount = gemCount;
  }

  generate(): Gem[] {
    let gems = [];

    for (let i = 0; i < this.gemCount; i++) {
      let gem = new Gem();

      gem.value = random.int(this.minValue, this.maxValue);

      if (gem.value < 1100) {
        gem.name = RND.item(getOrnamental());
      } else if (gem.value < 8100) {
        gem.name = RND.item(getSemiprecious());
      } else if (gem.value < 15100) {
        gem.name = RND.item(getFancy());
      } else if (gem.value < 50100) {
        gem.name = RND.item(getPrecious());
      } else if (gem.value < 100100) {
        gem.name = RND.item(getGemstones());
      } else {
        gem.name = RND.item(getJewels());
      }

      let worth = Currency.valueToCoins(gem.value, false, false, false);

      gem.description = `${Words.article(gem.name)} ${gem.name} worth ${worth}`;

      gems.push(gem);
    }

    return gems;
  }
}

function getOrnamental(): string[] {
  return [
    'banded agate',
    'eye agate',
    'moss agate',
    'azurite',
    'blue quartz',
    'hematite',
    'lapis lazuli',
    'malachite',
    'obsidian',
    'rhodochrosite',
    'tiger eye',
    'turquoise',
    'irregular freshwater pearl',
  ];
}

function getSemiprecious(): string[] {
  return [
    'bloodstone',
    'carnelian',
    'chalcedony',
    'chrysoprase',
    'citrine',
    'jasper',
    'moonstone',
    'onyx',
    'quartz',
    'sardonyx',
    'star rose quartz',
    'zircon',
  ];
}

function getFancy(): string[] {
  return [
    'amber',
    'amethyst',
    'chrysoberyl',
    'coral',
    'garnet',
    'jade',
    'jet',
    'pearl',
    'spinel',
    'tourmaline',
  ];
}

function getPrecious(): string[] {
  return ['alexandrite', 'aquamarine', 'black pearl', 'blue spinel', 'peridot', 'topaz'];
}

function getGemstones(): string[] {
  return [
    'black opal',
    'blue sapphire',
    'emerald',
    'fire opal',
    'opal',
    'star ruby',
    'star sapphire',
    'yellow sapphire',
  ];
}

function getJewels(): string[] {
  return ['black sapphire', 'diamond', 'jacinth', 'ruby'];
}
