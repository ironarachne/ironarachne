import {
  getChargesMatchingAnyTags,
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry';
import type { Character } from '$lib/characters';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'commander', roleName: 'Commander', order: 2 },
  { id: 'line_officer', roleName: 'Line officer', order: 1 },
  { id: 'operator', roleName: 'Operator', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Commander',
    maleTitle: 'Commander',
    femaleHonorific: 'Commander',
    maleHonorific: 'Commander',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Lieutenant',
    maleTitle: 'Lieutenant',
    femaleHonorific: 'Lieutenant',
    maleHonorific: 'Lieutenant',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Operator',
    maleTitle: 'Operator',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['commander', m1],
  ['line_officer', m2],
  ['operator', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags([
      'weapon',
      'helmet',
      'sword',
      'battle',
      'star',
      'rocket',
      'laser',
      'void',
    ]),
  });
}

export function buildSfMercenaryOutfitKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'sf_mercenary_outfit',
    genre: 'science_fiction',
    typeLabel: 'SF mercenary outfit',
    namingProfile: { style: 'prefix_suffix', description: 'The <Color> <Vector> <Company>' },
    defaultSizeRange: { min: 8, max: 400 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) =>
      `The ${r.item(['Crimson', 'Void', 'Dust', 'Jade', 'Frost', 'Amber', 'Eclipse'])} ${r.item(['Lances', 'Wolves', 'Sparks', 'Vectors', 'Shields', 'Banshees', 'Bastards'])} ${r.item(['Outfit', 'Company', 'Cohort', 'Lancers'])}`,
    prepareCharacterConfigForRole: (_id, base) => ({ ...base, allowedAgeCategoryNames: ['adult'] }),
  };
}
