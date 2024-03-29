import * as RND from "@ironarachne/rng";
import DomainSet from "./domainset.js";
import type DomainGeneratorConfig from "./generatorconfig.js";

export default class DomainGenerator {
  config: DomainGeneratorConfig;

  constructor(config: DomainGeneratorConfig) {
    this.config = config;
  }

  generate(): DomainSet {
    let domainSet = new DomainSet();

    this.config.domains = RND.shuffle(this.config.domains);

    if (this.config.domains.length < this.config.numberOfDomains) {
      throw new Error("Not enough domains in domain generator config for the requested number of domains.");
    }

    let primary = this.config.domains.pop();
    if (primary !== undefined) {
      domainSet.primary = primary;
    } else {
      throw new Error("No primary domain found.");
    }

    for (let i = 0; i < this.config.numberOfDomains; i++) {
      const d = this.config.domains.pop();
      if (d === undefined) {
        throw new Error("No secondary domain found.");
      }

      domainSet.secondaries.push(d);
    }

    return domainSet;
  }
}
