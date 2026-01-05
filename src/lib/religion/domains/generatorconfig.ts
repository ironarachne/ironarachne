import type Domain from './domain.js';
import * as Domains from './domains.js';
import * as RNG from '@ironarachne/rng';

export default class DomainGeneratorConfig {
  numberOfDomains: number;
  domains: Domain[];
  rng: RNG.RNG;

  constructor() {
    this.numberOfDomains = 1;
    this.domains = JSON.parse(JSON.stringify(Domains.allDomains));
    this.rng = new RNG.RNG(Date.now());
  }
}
