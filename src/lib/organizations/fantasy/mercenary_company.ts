import type { Character, CharacterGenerationConfig } from '$lib/characters';
import * as Characters from '$lib/characters';
import * as Charges from '$lib/heraldry/charges/index.js';
import {
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry/generatorconfig.js';
import type * as RNG from '@ironarachne/rng';
import type OrganizationRank from '../organization_rank.js';
import type OrganizationType from '../organization_type.js';

export function generateType(rng: RNG.RNG): OrganizationType {
  const config: HeraldryGeneratorConfig = mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: Charges.matchingAnyTags(['weapon', 'armor', 'aggressive'], Charges.all()),
  });

  const nameGenerator = (rng: RNG.RNG): string => {
    const prefix = rng.item([
      'Black',
      'Blood',
      'Burning',
      'Crimson',
      'Free',
      'Gilded',
      'Golden',
      'Iron',
      'Red',
      'Silver',
      'White',
    ]);
    const suffix = rng.item([
      'Axes',
      'Army',
      'Bears',
      'Blades',
      'Coins',
      'Company',
      'Dragons',
      'Giants',
      'Lords',
      'Pikes',
      'Sentinels',
      'Swords',
      'Wolves',
      'Wyverns',
    ]);

    return `The ${prefix} ${suffix}`;
  };

  const descriptionGenerator = (rng: RNG.RNG): string =>
    rng.item([
      '{name} is a vicious mercenary company with a reputation for excessive violence.',
      '{name} is a merc company that prides itself on its professionalism and integrity.',
      '{name}, as mercenaries go, are pretty reliable. They do have a tendency to celebrate too hard, though.',
    ]);

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
    name: 'mercenary company',
    minSize: 20,
    maxSize: 80,
    leaderTitle: 'captain',
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
      name: 'captain',
      title: {
        femaleTitle: 'Captain',
        maleTitle: 'Captain',
        femaleHonorific: 'Captain',
        maleHonorific: 'Captain',
        hasLands: false,
        landName: '',
        precedence: 0,
      },
      tier: 0,
      parent: null,
      children: [],
    },
    {
      name: 'lieutenant',
      title: {
        femaleTitle: 'Lieutenant',
        maleTitle: 'Lieutenant',
        femaleHonorific: 'Lieutenant',
        maleHonorific: 'Lieutenant',
        hasLands: false,
        landName: '',
        precedence: 1,
      },
      tier: 1,
      parent: null,
      children: [],
    },
    {
      name: 'sergeant',
      title: {
        femaleTitle: 'Sergeant',
        maleTitle: 'Sergeant',
        femaleHonorific: 'Sergeant',
        maleHonorific: 'Sergeant',
        hasLands: false,
        landName: '',
        precedence: 2,
      },
      tier: 2,
      parent: null,
      children: [],
    },
    {
      name: 'member',
      title: {
        femaleTitle: 'Mercenary',
        maleTitle: 'Mercenary',
        femaleHonorific: '',
        maleHonorific: '',
        hasLands: false,
        landName: '',
        precedence: 3,
      },
      tier: 3,
      parent: null,
      children: [],
    },
  ];

  ranks[0].children.push(1);
  ranks[1].parent = 0;
  ranks[1].children.push(2);
  ranks[2].parent = 1;
  ranks[2].children.push(3);
  ranks[3].parent = 2;

  return ranks;
}
