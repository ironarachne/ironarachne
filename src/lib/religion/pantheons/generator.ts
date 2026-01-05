import RelationshipGenerator from '$lib/relationships/generator.js';
import type Relationship from '$lib/relationships/relationship.js';
import * as RNG from '@ironarachne/rng';
import * as Words from '@ironarachne/words';

import DeityGenerator from '../deities/generator.js';
import DeityGeneratorConfig from '../deities/generatorconfig.js';
import type DomainSet from '../domains/domainset.js';
import DomainGenerator from '../domains/generator.js';
import DomainGeneratorConfig from '../domains/generatorconfig.js';
import type PantheonGeneratorConfig from './generatorconfig.js';
import Pantheon from './pantheon.js';
import PantheonMember from './pantheonmember.js';
import type Domain from '../domains/domain.js';

export default class PantheonGenerator {
  config: PantheonGeneratorConfig;

  constructor(config: PantheonGeneratorConfig) {
    this.config = config;
  }

  generate(): Pantheon {
    let pantheon = new Pantheon();

    let deityGenConfig = new DeityGeneratorConfig();
    deityGenConfig.characterGeneratorConfig.speciesOptions = this.config.speciesOptions;
    deityGenConfig.realms = this.config.realms;
    deityGenConfig.femaleNameGenerator = this.config.femaleNameGenerator;
    deityGenConfig.maleNameGenerator = this.config.maleNameGenerator;

    const numberOfDeities = this.config.rng.int(this.config.minDeities, this.config.maxDeities);

    const domainSets = randomDomainSets(numberOfDeities, this.config.rng);

    for (let i = 0; i < domainSets.length; i++) {
      let member = new PantheonMember();
      deityGenConfig.domainSet = domainSets[i];
      let deityGen = new DeityGenerator(deityGenConfig);

      let deity = deityGen.generate();
      member.deity = deity;

      pantheon.members.push(member);
    }

    let relationshipGenerator = new RelationshipGenerator(0);
    let numberOfRelationships = this.config.rng.int(1, 3);

    for (let j = 0; j < numberOfRelationships; j++) {
      for (let i = 0; i < pantheon.members.length; i++) {
        relationshipGenerator.strength = this.config.rng.int(-2, 2);
        const target = this.config.rng.int(0, pantheon.members.length - 1);
        if (target !== i) {
          let alreadyExists = false;
          for (let k = 0; k < pantheon.members[i].relationships.length; k++) {
            if (pantheon.members[i].relationships[k].target === target) {
              alreadyExists = true;
            }
          }
          if (!alreadyExists) {
            let outward = relationshipGenerator.generate();
            outward.target = target;
            pantheon.members[i].relationships.push(outward);

            let inward = relationshipGenerator.generate();
            inward.target = i;
            pantheon.members[target].relationships.push(inward);
          }
        }
      }
    }

    if (pantheon.members.length > 1) {
      for (let i = 0; i < pantheon.members.length; i++) {
        let relationships = [];

        for (let x = 0; x < pantheon.members[i].relationships.length; x++) {
          relationships.push(
            getRelationshipPhrase(
              pantheon.members[i].relationships[x],
              pantheon.members[pantheon.members[i].relationships[x].target].deity.name,
              this.config.rng,
            ),
          );
        }

        const relationshipDescription =
          ' ' + pantheon.members[i].deity.name + ' ' + Words.arrayToPhrase(relationships) + '.';

        pantheon.members[i].deity.description += relationshipDescription;
      }
    }

    return pantheon;
  }
}

function getRelationshipPhrase(
  relationship: Relationship,
  targetName: string,
  rng: RNG.RNG,
): string {
  return rng.item([`${relationship.verb} ${targetName}`]);
}

function randomDomainSets(numberOfSets: number, rng: RNG.RNG): DomainSet[] {
  let domainGenConfig = new DomainGeneratorConfig();
  let domainGen = new DomainGenerator(domainGenConfig);

  let sets = [];
  let allDomains = rng.shuffle(JSON.parse(JSON.stringify(domainGenConfig.domains)));

  for (let i = 0; i < numberOfSets; i++) {
    let domains: Domain[] = [];

    for (let j = 0; j < domainGen.config.numberOfDomains + 1; j++) {
      const domain = allDomains.pop() as Domain;
      if (domain) {
        domains.push(domain);
      } else {
        break;
      }
    }

    domainGen.config.domains = domains;

    let domainSet = domainGen.generate();

    sets.push(domainSet);
  }

  return sets;
}
