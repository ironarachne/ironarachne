import type { Character } from '$lib/characters';
import * as Characters from '$lib/characters';
import type * as RNG from '@ironarachne/rng';
import type Organization from './organization';
import type OrganizationGeneratorConfig from './organization_generator_config';
import * as OrganizationRanks from './organization_ranks';
import type OrganizationType from './organization_type';

export function generate(config: OrganizationGeneratorConfig): Organization {
  const orgType = config.rng.item(config.organizationTypes);
  const memberCount = config.rng.int(orgType.minSize, orgType.maxSize);

  const org: Organization = {
    name: orgType.randomName(config.rng),
    organizationType: orgType,
    characterGenConfig: config.characterConfig,
    description: orgType.randomDescription(config.rng),
    memberCount: memberCount,
    notableMembers: [],
    leadership: orgType.randomLeadership(
      `leader-${config.rng.randomString(13)}`,
      config.characterConfig,
    ),
    ranks: orgType.ranks,
    heraldry: null,
  };

  org.description = org.description.replace('{name}', org.name);
  org.description += ` It has ${org.memberCount} members. `;
  org.description += randomPopularity(config.rng);

  org.notableMembers = randomNotableMembers(org, config.rng);

  const leaderTitle = Characters.getHighestPrecedenceTitle(org.leadership);
  let leaderHonorific = '';
  if (leaderTitle) {
    leaderHonorific = Characters.getHonorific(org.leadership.gender.name, leaderTitle);
  }

  org.leadership.description = `They are led by ${leaderHonorific} ${org.leadership.firstName} ${org.leadership.lastName}. ${org.leadership.description}`;

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

function randomNotableMembers(org: Organization, rng: RNG.RNG): Character[] {
  const tiers = OrganizationRanks.getDistinctTiers(org.ranks);
  const notableMembers: Character[] = [];

  if (tiers.length <= 1) {
    return [];
  }

  for (let i = 0; i < tiers.length; i++) {
    const possibleRanks = OrganizationRanks.getRanksOfTier(tiers[i], org.ranks);

    let numberOfMembers = 1;

    if (i === 1) {
      numberOfMembers = rng.int(2, 4);
    } else if (i === 2) {
      numberOfMembers = rng.int(1, 3);
    }

    if (i > 0) {
      for (let k = 0; k < numberOfMembers; k++) {
        const memberRank = rng.item(possibleRanks);

        const member = org.organizationType.randomMemberOfRank(
          `member-${rng.randomString(13)}`,
          memberRank,
          org.characterGenConfig,
        );
        notableMembers.push(member);
      }
    }
  }

  return notableMembers;
}

function randomPopularity(rng: RNG.RNG): string {
  return rng.item([
    'They enjoy a surprising amount of local popularity.',
    'They are not terribly popular locally.',
    "They're disliked by the local population.",
    "They're fairly popular locally but relatively unknown in the wider region.",
    'While locals are ambivalent about them, they are fairly popular in the wider region.',
    'The locals actively hate them.',
  ]);
}
