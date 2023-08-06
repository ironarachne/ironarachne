"use strict";

import Domain from "./domain.js";
import * as Domains from "./domains.js";

export default class DomainGeneratorConfig {
  numberOfDomains: number;
  domains: Domain[];

  constructor() {
    this.numberOfDomains = 1;
    this.domains = Domains.all();
  }
}
