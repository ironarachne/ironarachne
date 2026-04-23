import { geometricEmblemChargeGlyphs } from '$lib/charges/geometric_emblem_charges.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'warden', roleName: 'Warden', order: 2 },
  { id: 'keeper', roleName: 'Keeper', order: 1 },
  { id: 'novice', roleName: 'Novice', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const mWarden: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Warden',
    maleTitle: 'Warden',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 0,
  });

const mKeeper: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Keeper',
    maleTitle: 'Keeper',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 1,
  });

const mNovice: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Novice',
    maleTitle: 'Novice',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['warden', mWarden],
  ['keeper', mKeeper],
  ['novice', mNovice],
]);

function placeholderHeraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({ chargeCount: 0, rng });
}

function prepareConfig(roleId: string, base: CharacterGenerationConfig): CharacterGenerationConfig {
  const c = { ...base };
  if (roleId === 'novice') {
    c.allowedAgeCategoryNames = ['teenager', 'adult'];
  } else {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  }
  return c;
}

export function buildSignetCircleKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'signet_circle',
    genre: 'fantasy',
    typeLabel: 'Signet circle',
    namingProfile: { style: 'pattern_list', description: 'Compact ritual order names' },
    defaultSizeRange: { min: 6, max: 60 },
    hierarchy,
    mutators,
    visualEmblemStyle: 'disc_emblem',
    discEmblemChargeOptions: geometricEmblemChargeGlyphs(),
    heraldryConfig: placeholderHeraldryConfig(rng),
    generateName: (r) => {
      return r.item([
        `The ${r.item(['Signet', 'Seal', 'Disk', 'Round'])} ${r.item(['Circle', 'Order', 'Conclave', 'Lodge'])}`,
        `Order of the ${r.item(['True', 'Silver', 'Dawn', 'Stone'])} ${r.item(['Disc', 'Signet', 'Round'])}`,
        'Inner Round of the Nine Marks',
        'The Compact of Sealed Rites',
      ]);
    },
    generateDescription: (r) =>
      r.item([
        '{name} marks oaths and letters with a single, unmistakable round seal.',
        '{name} keeps its sigil on brass dies—never in paint alone.',
        '{name} meets under modest roofs but speaks with old authority in trade courts.',
        '{name} teaches initiates the difference between a mark and a blazon.',
      ]),
    prepareCharacterConfigForRole: prepareConfig,
  };
}
