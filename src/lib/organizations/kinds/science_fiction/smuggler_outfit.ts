import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'captain', roleName: 'Captain', order: 2 },
  { id: 'navigator', roleName: 'Navigator', order: 1 },
  { id: 'loader', roleName: 'Loader', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Ship captain',
    maleTitle: 'Ship captain',
    femaleHonorific: 'Captain',
    maleHonorific: 'Captain',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Navigator',
    maleTitle: 'Navigator',
    femaleHonorific: 'Navigator',
    maleHonorific: 'Navigator',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Deck hand',
    maleTitle: 'Deck hand',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['captain', m1],
  ['navigator', m2],
  ['loader', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags(['galleon', 'water', 'barrel', 'key', 'snake', 'dagger', 'raven', 'comet', 'void']),
  });
}

export function buildSmugglerOutfitKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'smuggler_outfit',
    genre: 'science_fiction',
    typeLabel: 'Smuggler outfit / free traders',
    namingProfile: { style: 'prefix_suffix', description: "The <Adjective> <Vessel-crew> (trading in shade)" },
    defaultSizeRange: { min: 4, max: 80 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) =>
      `The ${r.item(['Benthic', 'Dustmoth', 'Farside', 'Glim', 'Hollow', 'Jettison'])} ${r.item(['Runners', 'Haulers', 'Lines', 'Consortium', 'Syndicate', 'Crew', 'Kites'])}`,
    prepareCharacterConfigForRole: (roleId, base) => {
      const c = { ...base };
      if (roleId === 'captain' || roleId === 'navigator') {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      } else {
        c.allowedAgeCategoryNames = ['adult', 'teenager'];
      }
      return c;
    },
  };
}
