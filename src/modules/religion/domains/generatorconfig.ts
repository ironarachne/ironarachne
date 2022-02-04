'use strict';

import Domain from './domain';
import * as Domains from './domains';

export default class DomainGeneratorConfig {
  numberOfDomains: number;
  domains: Domain[];

  constructor() {
    this.numberOfDomains = 1;
    this.domains = Domains.all();
  }
}
