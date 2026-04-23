import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'captain', roleName: 'Captain', order: 3 },
  { id: 'lieutenant', roleName: 'Lieutenant', order: 2 },
  { id: 'sergeant', roleName: 'Sergeant', order: 1 },
  { id: 'member', roleName: 'Mercenary', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const mutCaptain: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Captain',
    maleTitle: 'Captain',
    femaleHonorific: 'Captain',
    maleHonorific: 'Captain',
    hasLands: false,
    landName: '',
    precedence: 0,
  });

const mutLieutenant: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Lieutenant',
    maleTitle: 'Lieutenant',
    femaleHonorific: 'Lieutenant',
    maleHonorific: 'Lieutenant',
    hasLands: false,
    landName: '',
    precedence: 1,
  });

const mutSergeant: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Sergeant',
    maleTitle: 'Sergeant',
    femaleHonorific: 'Sergeant',
    maleHonorific: 'Sergeant',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutMember: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Mercenary',
    maleTitle: 'Mercenary',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 3,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['captain', mutCaptain],
  ['lieutenant', mutLieutenant],
  ['sergeant', mutSergeant],
  ['member', mutMember],
]);

function heraldryForMercenary(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags(['weapon', 'helmet', 'sword', 'battle', 'axe']),
  });
}

function prepareConfig(_roleId: string, base: CharacterGenerationConfig): CharacterGenerationConfig {
  return { ...base, allowedAgeCategoryNames: ['adult'] };
}

export function buildMercenaryCompanyKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'mercenary_company',
    genre: 'fantasy',
    typeLabel: 'Mercenary company',
    namingProfile: { style: 'prefix_suffix', description: 'The <Epithet> <Collective> (e.g. The Iron Blades)' },
    defaultSizeRange: { min: 20, max: 80 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryForMercenary(rng),
    generateName: (r) => {
      const prefix = r.item([
        'Black', 'Blood', 'Burning', 'Crimson', 'Free', 'Gilded', 'Golden', 'Iron', 'Red', 'Silver', 'White',
      ]);
      const suffix = r.item([
        'Axes', 'Army', 'Bears', 'Blades', 'Coins', 'Company', 'Dragons', 'Giants', 'Lords', 'Pikes', 'Sentinels',
        'Swords', 'Wolves', 'Wyverns',
      ]);
      return `The ${prefix} ${suffix}`;
    },
    prepareCharacterConfigForRole: prepareConfig,
  };
}
