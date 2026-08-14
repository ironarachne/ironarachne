import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry';
import type { Character, CharacterGenerationConfig } from '$lib/characters';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'loom_master', roleName: 'Loom master', order: 2 },
  { id: 'weaver', roleName: 'Weaver', order: 1 },
  { id: 'apprentice', roleName: 'Apprentice', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const mLoom: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Loom master',
    maleTitle: 'Loom master',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 0,
  });

const mWeaver: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Weaver',
    maleTitle: 'Weaver',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 1,
  });

const mApp: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Apprentice weaver',
    maleTitle: 'Apprentice weaver',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['loom_master', mLoom],
  ['weaver', mWeaver],
  ['apprentice', mApp],
]);

/** Unused when `visualEmblemStyle` is `pattern_lattice`. */
function placeholderHeraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({ chargeCount: 0, rng });
}

function prepareConfig(roleId: string, base: CharacterGenerationConfig): CharacterGenerationConfig {
  const c = { ...base };
  if (roleId === 'apprentice') {
    c.allowedAgeCategoryNames = ['teenager', 'adult'];
  } else {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  }
  return c;
}

export function buildWeaversCollectiveKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'weavers_collective',
    genre: 'fantasy',
    typeLabel: "Weavers' collective",
    namingProfile: { style: 'pattern_list', description: 'Guild-style weaving hall names' },
    defaultSizeRange: { min: 8, max: 120 },
    hierarchy,
    mutators,
    visualEmblemStyle: 'pattern_lattice',
    heraldryConfig: placeholderHeraldryConfig(rng),
    generateName: (r) => {
      return r.item([
        `The ${r.item(['Loom', 'Spindle', 'Warp', 'Dye', 'Linen'])} ${r.item(['Hall', 'Collective', 'Guild', 'Company'])}`,
        `Weavers of the ${r.item(['Red', 'Gold', 'Summer', 'River', 'Linen'])} ${r.item(['Shawl', 'Bolt', 'Frame', 'Pattern'])}`,
        'The Thirteen-Shuttle Weavers',
        'Dyers and Looms Company',
      ]);
    },
    prepareCharacterConfigForRole: prepareConfig,
  };
}
