'use strict';

import Environment from '../environment/environment';
import SettlementCategory from './categories/category';

export default class Settlement {
  name: string;
  description: string;
  category: SettlementCategory;
  population: number;
  prosperity: number;
  environment: Environment;

  constructor(name: string, category: SettlementCategory, environment: Environment) {
    this.name = name;
    this.category = category;
    this.description = '';
    this.population = 0;
    this.prosperity = 0;
    this.environment = environment;
  }
}
