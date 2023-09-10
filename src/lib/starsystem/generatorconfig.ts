export default class StarSystemGeneratorConfig {
  minPlanets: number;
  maxPlanets: number;

  constructor() {
    this.minPlanets = 3;
    this.maxPlanets = 12;
  }
}
