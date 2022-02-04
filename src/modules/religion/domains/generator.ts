"use strict";

import DomainSet from "./domainset";
import DomainGeneratorConfig from "./generatorconfig";
import * as RND from "../../random";

export default class DomainGenerator {
  config: DomainGeneratorConfig;

  constructor(config: DomainGeneratorConfig) {
    this.config = config;
  }

  generate(): DomainSet {
    let domainSet = new DomainSet();

    this.config.domains = RND.shuffle(this.config.domains);

    domainSet.primary = this.config.domains.pop();

    for (let i=0;i<this.config.numberOfDomains;i++) {
      const d = this.config.domains.pop();
      domainSet.secondaries.push(d);
    }

    return domainSet;
  }
}
