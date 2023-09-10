import type Environment from "../environment/environment.js";
import type SettlementCategory from "./settlement_category.js";

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
    this.description = "";
    this.population = 0;
    this.prosperity = 0;
    this.environment = environment;
  }
}
