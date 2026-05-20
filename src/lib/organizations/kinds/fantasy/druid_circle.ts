import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import {
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'archdruid', roleName: 'Archdruid', order: 2 },
  { id: 'circle_member', roleName: 'Circle druid', order: 1 },
  { id: 'aspirant', roleName: 'Aspirant', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Archdruid',
    maleTitle: 'Archdruid',
    femaleHonorific: 'Archdruid',
    maleHonorific: 'Archdruid',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Druid of the Circle',
    maleTitle: 'Druid of the Circle',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Aspirant',
    maleTitle: 'Aspirant',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['archdruid', m1],
  ['circle_member', m2],
  ['aspirant', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags([
      'tree',
      'oak',
      'stag',
      'leaf',
      'moon',
      'wolf',
      'spiral',
    ]),
  });
}

export function buildDruidCircleKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'druid_circle',
    genre: 'fantasy',
    typeLabel: 'Druid circle',
    namingProfile: {
      style: 'pattern_list',
      description: 'Circle of <Season> / The <Grove> Wardens',
    },
    defaultSizeRange: { min: 6, max: 80 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) => {
      const t = r.item(['Circle', 'Coven', 'Grove Wardens', 'Sylvan Ring']);
      const k = r.item(['Verdant', 'Ashfall', 'Thornwinter', 'Mossglen', 'Starfall']);
      return `The ${k} ${t}`;
    },
    prepareCharacterConfigForRole: (roleId, base) => {
      const c = { ...base };
      if (roleId === 'aspirant') {
        c.allowedAgeCategoryNames = ['teenager', 'adult'];
      } else {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      }
      return c;
    },
  };
}
