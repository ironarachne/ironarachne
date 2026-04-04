import type { Character } from '$lib/characters';
import type { CharacterGenerationConfig } from '$lib/characters';
import * as Characters from '$lib/characters';
import * as Charges from '$lib/heraldry/charges/index.js';
import {
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry/generatorconfig.js';
import * as RNG from '@ironarachne/rng';
import type OrganizationRank from '../organization_rank.js';
import type OrganizationType from '../organization_type.js';

export function generateType(rng: RNG.RNG): OrganizationType {
  const config: HeraldryGeneratorConfig = mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: Charges.matchingAnyTags(['book', 'magic', 'monster'], Charges.all()),
  });

  const nameGenerator = (rng: RNG.RNG): string => {
    const schoolType = rng.item(['School', 'Academy', 'College', 'Institute']);

    const suffixTypes = [
      {
        generate: (rng: RNG.RNG): string =>
          rng.item(['Witchcraft', 'Wizardry', 'Sorcery', 'Mysticism']),
      },
      {
        generate: (rng: RNG.RNG): string => {
          // example names: The School of Hidden Mysteries, The Academy of Unknown Arts
          const modifier = rng.item([
            'Arcane',
            'Cherished',
            'Eldritch',
            'Esoteric',
            'Forbidden',
            'Forgotten',
            'Hidden',
            'Lost',
            'Mystical',
            'Occult',
            'Unknown',
          ]);
          const focus = rng.item([
            'Mysteries',
            'Arts',
            'Sciences',
            'Paths',
            'Ways',
            'Secrets',
            'Knowledge',
            'Wisdom',
            'Power',
            'Magic',
            'Enchantment',
            'Illusion',
            'Divination',
            'Conjuration',
            'Abjuration',
            'Evocation',
            'Necromancy',
            'Transmutation',
          ]);

          return `${modifier} ${focus}`;
        },
      },
      {
        generate: (rng: RNG.RNG): string => {
          const first = ['Arcane', 'Mystical', 'Eldritch', 'Occult'];

          const second = ['Arts', 'Sciences', 'Paths', 'Ways', 'Secrets'];

          return `${rng.item(first)} ${rng.item(second)}`;
        },
      },
    ];

    const suffixType = rng.item(suffixTypes);

    return `The ${schoolType} of ${suffixType.generate(rng)}`;
  };

  const descriptionGenerator = (rng: RNG.RNG): string => {
    return rng.item([
      '{name} is a hidden wizard school that avoids contact with the outside world.',
      '{name} is a proud institution whose students primarily come from the nobility.',
      '{name} has a reputation for experimentation, and there are rumors that sometimes they experiment on their own students.',
      '{name} is an egalitarian wizard school that accepts new students from every walk of life.',
    ]);
  };

  const leadershipGenerator = (seed: string, characterGenConfig: CharacterGenerationConfig): Character => {
    characterGenConfig.allowedAgeCategoryNames = ['adult', 'elderly'];

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

    if (rank.name === 'headmaster' || rank.name === 'professor') {
      characterGenConfig.allowedAgeCategoryNames = ['adult', 'elderly'];
    } else if (rank.name === 'student') {
      characterGenConfig.allowedAgeCategoryNames = ['child', 'teenager'];
    }

    const member = Characters.generate(seed, characterGenConfig);
    member.titles?.push(rank.title);
    return member;
  };

  return {
    name: 'wizard school',
    minSize: 50,
    maxSize: 600,
    leaderTitle: 'headmaster',
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
      name: 'headmaster',
      title: {
        femaleTitle: 'Headmaster',
        maleTitle: 'Headmaster',
        femaleHonorific: 'Headmaster',
        maleHonorific: 'Headmaster',
        hasLands: false,
        landName: '',
        precedence: 0,
      },
      tier: 0,
      parent: null,
      children: [],
    },
    {
      name: 'professor',
      title: {
        femaleTitle: 'Professor',
        maleTitle: 'Professor',
        femaleHonorific: 'Professor',
        maleHonorific: 'Professor',
        hasLands: false,
        landName: '',
        precedence: 1,
      },
      tier: 1,
      parent: null,
      children: [],
    },
    {
      name: 'student',
      title: {
        femaleTitle: 'Student',
        maleTitle: 'Student',
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
