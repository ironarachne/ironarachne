'use strict';

import Climate from './climate';
import ContinentalClimate from './continental';
import DryClimate from './dry';
import PolarClimate from './polar';
import TemperateClimate from './temperate';
import TropicalClimate from './tropical';
import * as RND from '../../random';

export function all(): Climate[] {
  return [
    new TropicalClimate(),
    new DryClimate(),
    new TemperateClimate(),
    new ContinentalClimate(),
    new PolarClimate(),
  ];
}

export function describe(climate: Climate): string {
  let description = `The climate here is ${climate.name}, with ${climate.seasons.length} seasons.`;

  return description;
}

export function random(): Climate {
  const options = all();

  return RND.item(options);
}
