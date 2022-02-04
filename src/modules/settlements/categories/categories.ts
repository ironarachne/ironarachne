'use strict';

import Borough from './borough';
import SettlementCategory from './category';
import City from './city';
import Hamlet from './hamlet';
import Metropolis from './metropolis';
import Town from './town';
import Village from './village';

import * as RND from '../../random';

export function all(): SettlementCategory[] {
  return [new Hamlet(), new Village(), new Town(), new Borough(), new City(), new Metropolis()];
}

export function bySizeClass(sizeClass: string): SettlementCategory[] {
  const options = all();
  let result: SettlementCategory[] = [];

  for (let i = 0; i < options.length; i++) {
    if (options[i].sizeClass == sizeClass) {
      result.push(options[i]);
    }
  }

  return result;
}

export function small(): SettlementCategory[] {
  return bySizeClass('small');
}

export function medium(): SettlementCategory[] {
  return bySizeClass('medium');
}

export function large(): SettlementCategory[] {
  return bySizeClass('large');
}

export function randomCategory(categories: SettlementCategory[]): SettlementCategory {
  return RND.item(categories);
}
