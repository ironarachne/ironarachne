import type Character from "$lib/characters/character";
import * as Characters from "$lib/characters/characters";
import * as RND from "@ironarachne/rng";
import random from "random";
import type Organization from "./organization";
import type OrganizationGeneratorConfig from "./organization_generator_config";
import * as OrganizationRanks from "./organization_ranks";
import type OrganizationType from "./organization_type";

export function generate(config: OrganizationGeneratorConfig): Organization {
  const orgType = RND.item(config.organizationTypes);
  const memberCount = random.int(orgType.minSize, orgType.maxSize);

  const org: Organization = {
    name: orgType.randomName(),
    organizationType: orgType,
    characterGenConfig: config.characterConfig,
    description: orgType.randomDescription(),
    memberCount: memberCount,
    notableMembers: [],
    leadership: orgType.randomLeadership(config.characterConfig),
    ranks: orgType.ranks,
    heraldry: null,
  };

  org.description = org.description.replace("{name}", org.name);
  org.description += ` It has ${org.memberCount} members. `;
  org.description += randomPopularity();

  org.notableMembers = randomNotableMembers(org);

  org.leadership.description = `They are led by ${
    Characters.getHonorific(org.leadership)
  } ${org.leadership.firstName} ${org.leadership.lastName}. ${org.leadership.description}`;

  return org;
}

export function getTypeByName(name: string, types: OrganizationType[]): OrganizationType {
  for (let i = 0; i < types.length; i++) {
    if (types[i].name === name) {
      return types[i];
    }
  }

  throw new Error(`Organization type not found: ${name}`);
}

function randomNotableMembers(org: Organization): Character[] {
  const tiers = OrganizationRanks.getDistinctTiers(org.ranks);
  const notableMembers: Character[] = [];

  if (tiers.length <= 1) {
    return [];
  }

  for (let i = 0; i < tiers.length; i++) {
    const possibleRanks = OrganizationRanks.getRanksOfTier(tiers[i], org.ranks);

    let numberOfMembers = 1;

    if (i === 1) {
      numberOfMembers = random.int(2, 4);
    } else if (i === 2) {
      numberOfMembers = random.int(1, 3);
    }

    if (i > 0) {
      for (let k = 0; k < numberOfMembers; k++) {
        const memberRank = RND.item(possibleRanks);

        const member = org.organizationType.randomMemberOfRank(
          memberRank,
          org.characterGenConfig,
        );
        notableMembers.push(member);
      }
    }
  }

  return notableMembers;
}

function randomPopularity(): string {
  return RND.item([
    "They enjoy a surprising amount of local popularity.",
    "They are not terribly popular locally.",
    "They're disliked by the local population.",
    "They're fairly popular locally but relatively unknown in the wider region.",
    "While locals are ambivalent about them, they are fairly popular in the wider region.",
    "The locals actively hate them.",
  ]);
}
