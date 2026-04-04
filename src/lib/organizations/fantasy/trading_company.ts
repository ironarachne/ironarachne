import type { Character, CharacterGenerationConfig } from '$lib/characters';
import * as Characters from '$lib/characters';
import * as Charges from '$lib/heraldry/charges/index.js';
import {
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry/generatorconfig.js';
import * as Names from '$lib/names';
import type * as RNG from '@ironarachne/rng';
import type OrganizationRank from '../organization_rank.js';
import type OrganizationType from '../organization_type.js';

export function generateType(rng: RNG.RNG): OrganizationType {
  const config: HeraldryGeneratorConfig = mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: Charges.matchingAnyTags(['coin', 'money', 'trade'], Charges.all()),
  });

  const nameGenerator = (rng: RNG.RNG): string => {
    const nameTypes = [
      {
        name: 'generic',
        randomName: () => {
          const prefixes = ['Dynasty', 'Gilded', 'Luxury'];

          const prefix = rng.item(prefixes);

          const suffix = rng.item([
            'Trading Company',
            'Traders',
            'Navigation Company',
            'Trade Company',
            'Trade and Navigation Company',
          ]);

          return `${prefix} ${suffix}`;
        },
      },
      {
        name: 'geographic',
        randomName: (rng: RNG.RNG) => {
          const direction = rng.item(['North', 'West', 'South', 'East']);
          const feature = rng.item(['Wind', 'Sea', 'Mountain', 'Ocean']);

          const suffix = rng.item([
            'Trading Company',
            'Traders',
            'Navigation Company',
            'Trade Company',
            'Trade and Navigation Company',
          ]);

          return `${direction} ${feature} ${suffix}`;
        },
      },
      {
        name: 'family',
        randomName: (rng: RNG.RNG) => {
          const nameGeneratorSet = Names.getFantasyNameGeneratorSet('human', rng);
          if (nameGeneratorSet.family === null) {
            throw new Error('Family name generator not found.');
          }
          const familyNames = nameGeneratorSet.family.generate(100);

          const familyName = rng.item(familyNames);

          const moniker = rng.item([' Brothers', ' & Sons', ' & Son', ' Family', '']);

          const suffix = rng.item([
            'Trading Company',
            'Traders',
            'Navigation Company',
            'Trade Company',
            'Trade and Navigation Company',
          ]);

          return `${familyName} ${moniker} ${suffix}`;
        },
      },
    ];

    const namer = rng.item(nameTypes);

    return namer.randomName(rng);
  };

  const descriptionGenerator = (rng: RNG.RNG): string => {
    return rng.item([
      'The {name} is noted for the quality of their goods.',
      'The {name} has a reputation for always delivering goods to their intended destination.',
      'The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.',
      'The {name} often openly uses bullying and strong-arming in their dealings.',
      'The {name} deals in a wide variety of goods.',
    ]);
  };

  const leadershipGenerator = (seed: string, characterGenConfig: CharacterGenerationConfig): Character => {
    characterGenConfig.allowedAgeCategoryNames = ['adult'];

    const leader = Characters.generate(seed, characterGenConfig);
    const ranks = getRanks();
    leader.titles?.push(ranks[0].title);

    return leader;
  };

  const randomMemberOfRank = (
    seed: string,
    rank: OrganizationRank,
    characterGenConfig: CharacterGenerationConfig,
  ): Character => {
    characterGenConfig.allowedAgeCategoryNames = ['adult'];

    const member = Characters.generate(seed, characterGenConfig);
    member.titles?.push(rank.title);
    return member;
  };

  return {
    name: 'trading company',
    minSize: 30,
    maxSize: 200,
    leaderTitle: 'proprietor',
    randomName: nameGenerator,
    randomDescription: descriptionGenerator,
    randomLeadership: leadershipGenerator,
    randomMemberOfRank: randomMemberOfRank,
    ranks: getRanks(),
    heraldryConfig: config,
  };
}

function getRanks(): OrganizationRank[] {
  const ranks: OrganizationRank[] = [
    {
      name: 'proprietor',
      title: {
        femaleTitle: 'Proprietor',
        maleTitle: 'Proprietor',
        femaleHonorific: 'Mistress',
        maleHonorific: 'Master',
        hasLands: false,
        landName: '',
        precedence: 0,
      },
      tier: 0,
      parent: null,
      children: [],
    },
    {
      name: 'manager',
      title: {
        femaleTitle: 'Manager',
        maleTitle: 'Manager',
        femaleHonorific: '',
        maleHonorific: '',
        hasLands: false,
        landName: '',
        precedence: 1,
      },
      tier: 1,
      parent: null,
      children: [],
    },
    {
      name: 'employee',
      title: {
        femaleTitle: 'Employee',
        maleTitle: 'Employee',
        femaleHonorific: '',
        maleHonorific: '',
        hasLands: false,
        landName: '',
        precedence: 2,
      },
      tier: 2,
      parent: null,
      children: [],
    },
  ];

  ranks[0].children.push(1);
  ranks[1].parent = 0;
  ranks[1].children.push(2);
  ranks[2].parent = 1;

  return ranks;
}
