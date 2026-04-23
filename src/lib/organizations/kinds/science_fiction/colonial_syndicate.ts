import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'syndicate_head', roleName: 'Syndicate head', order: 2 },
  { id: 'enforcer', roleName: 'Enforcer', order: 1 },
  { id: 'clerk', roleName: 'Clerk', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Syndicate head',
    maleTitle: 'Syndicate head',
    femaleHonorific: 'boss',
    maleHonorific: 'boss',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Enforcer',
    maleTitle: 'Enforcer',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Clerk',
    maleTitle: 'Clerk',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['syndicate_head', m1],
  ['enforcer', m2],
  ['clerk', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags(['crown', 'fleur', 'castle', 'bridge', 'objects', 'star', 'hand']),
  });
}

export function buildColonialSyndicateKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'colonial_syndicate',
    genre: 'science_fiction',
    typeLabel: 'Colonial syndicate',
    namingProfile: { style: 'mixed', description: 'The <Dome|Grid> <Family> <Compact>' },
    defaultSizeRange: { min: 20, max: 5000 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) =>
      `The ${r.item(['Amber', 'Dust', 'Frost', 'Gulf', 'Rift', 'Belt', 'Cinder'])} ${r.item(['Dome', 'Grid', 'Stack', 'Coast', 'Ring', 'Hearth'])} ${r.item(['Compact', 'Syndicate', 'League', 'Front', 'Society', 'Cooperative'])}`,
    prepareCharacterConfigForRole: (roleId, base) => {
      const c = { ...base };
      if (roleId === 'syndicate_head') {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      } else if (roleId === 'enforcer') {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      } else {
        c.allowedAgeCategoryNames = ['adult', 'teenager'];
      }
      return c;
    },
  };
}
