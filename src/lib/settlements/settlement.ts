import type Environment from '../environment/environment.js';
import type SettlementCategory from './settlement_category.js';
import type Vertex from '../geometry/vertex.js';

export default class Settlement {
  name: string;
  description: string;
  category: SettlementCategory;
  population: number;
  prosperity: number;
  environment: Environment;
  location?: Vertex; // added optional geographic coordinate
  mapNodeId?: number; // Map Graph polygon ID

  constructor(name: string, category: SettlementCategory, environment: Environment) {
    this.name = name;
    this.category = category;
    this.description = '';
    this.population = 0;
    this.prosperity = 0;
    this.environment = environment;
  }
}
