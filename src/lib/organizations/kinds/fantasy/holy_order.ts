import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'high_prelate', roleName: 'High Prelate', order: 2 },
  { id: 'templar', roleName: 'Templar', order: 1 },
  { id: 'acolyte', roleName: 'Acolyte', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'High Prelate',
    maleTitle: 'High Prelate',
    femaleHonorific: '{pronoun} Sanctity',
    maleHonorific: '{pronoun} Sanctity',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Templar',
    maleTitle: 'Templar',
    femaleHonorific: 'Templar',
    maleHonorific: 'Templar',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Acolyte',
    maleTitle: 'Acolyte',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['high_prelate', m1],
  ['templar', m2],
  ['acolyte', m3],
]);

function prepareCharacterConfigForRole(
  roleId: string,
  base: CharacterGenerationConfig,
): CharacterGenerationConfig {
  const c = { ...base };
  if (roleId === 'high_prelate') {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  } else if (roleId === 'templar') {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  } else if (roleId === 'acolyte') {
    c.allowedAgeCategoryNames = ['teenager', 'adult'];
  } else {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  }
  return c;
}

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1, 1]),
    chargeOptions: getChargesMatchingAnyTags(['cross', 'holy', 'sword', 'chalice', 'sun', 'crown']),
  });
}

export function buildHolyOrderKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'holy_order',
    genre: 'fantasy',
    typeLabel: 'Holy order',
    namingProfile: { style: 'pattern_list', description: 'Order of the <Revelation> / Brotherhood of <Saint name>' },
    defaultSizeRange: { min: 12, max: 400 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) => {
      const a = r.item(['Order of the', 'Sisters of the', 'Brotherhood of the', 'Templars of the']);
      const b = r.item(['Radiant', 'Crimson', 'Silver', 'Dawn', 'Eternal', 'Sorrowful', 'Gilded']);
      const c = r.item(['Flame', 'Martyrs', 'Chalice', 'Lance', 'Veil', 'Throne', 'Cross']);
      return `${a} ${b} ${c}`;
    },
    prepareCharacterConfigForRole: prepareCharacterConfigForRole,
  };
}
