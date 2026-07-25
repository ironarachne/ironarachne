import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import {
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry/generatorconfig.js';
import type { Character } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'guildmaster', roleName: 'Guildmaster', order: 2 },
  { id: 'lieutenant', roleName: 'Lieutenant', order: 1 },
  { id: 'footpad', roleName: 'Footpad', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Guildmaster',
    maleTitle: 'Guildmaster',
    femaleHonorific: 'Guildmaster',
    maleHonorific: 'Guildmaster',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Lieutenant',
    maleTitle: 'Lieutenant',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Footpad',
    maleTitle: 'Footpad',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['guildmaster', m1],
  ['lieutenant', m2],
  ['footpad', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags([
      'dagger',
      'mask',
      'snake',
      'key',
      'shadow',
      'claw',
      'raven',
      'thief',
    ]),
  });
}

export function buildThievesGuildKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'thieves_guild',
    genre: 'fantasy',
    typeLabel: "Thieves' guild",
    namingProfile: {
      style: 'prefix_suffix',
      description: 'The <Adjective> <Crew> / The <Animal> Masks',
    },
    defaultSizeRange: { min: 15, max: 150 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) => {
      const pat = r.int(0, 1);
      if (pat === 0) {
        return `The ${r.item(['Silent', 'Red', 'Black', 'Gilded', 'Copper', 'Drowned'])} ${r.item(['Masks', 'Rats', 'Fingers', 'Kites', 'Hooks'])}`;
      }
      return `The ${r.item(['Crimson', 'Jade', 'Winding'])} ${r.item(['Crew', 'Clique', 'Ring'])} of ${r.item(['Dust', 'Veils', 'Locks', 'Alleyways'])}`;
    },
    prepareCharacterConfigForRole: (roleId, base) => {
      const c = { ...base };
      if (roleId === 'guildmaster') {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      } else {
        c.allowedAgeCategoryNames = ['adult', 'teenager'];
      }
      return c;
    },
  };
}
