import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import * as Names from '$lib/names';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'lord', roleName: 'House lord', order: 2 },
  { id: 'sworn_knight', roleName: 'Sworn knight', order: 1 },
  { id: 'retainer', roleName: 'Retainer', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Head of House',
    maleTitle: 'Head of House',
    femaleHonorific: 'my lord',
    maleHonorific: 'my lord',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Knight-Retainer',
    maleTitle: 'Knight-Retainer',
    femaleHonorific: 'Ser',
    maleHonorific: 'Ser',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Retainer',
    maleTitle: 'Retainer',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['lord', m1],
  ['sworn_knight', m2],
  ['retainer', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1, 1]),
    chargeOptions: getChargesMatchingAnyTags(['crown', 'sword', 'rose', 'lion', 'eagle', 'fleur', 'castle']),
  });
}

function houseNameFromRng(r: RNG, characterConfig: CharacterGenerationConfig): string {
  const set = Names.getFantasyNameGeneratorSet(characterConfig.species.name.toLowerCase() || 'human', r);
  const last = r.item(set.family.generate(100));
  const suffix = r.item([' retinue', ' household guard', ' cadet line', ' sworn swords']);
  return `House ${last}'s${suffix}`;
}

export function buildNobleHouseKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'noble_house',
    genre: 'fantasy',
    typeLabel: 'Noble house retinue',
    namingProfile: { style: 'family_business', description: "House <Name>’s <Guard|retinue> — tied to a named lineage" },
    defaultSizeRange: { min: 8, max: 120 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r, ctx) => houseNameFromRng(r, ctx.characterConfig),
    prepareCharacterConfigForRole: (roleId, base) => {
      const c = { ...base };
      if (roleId === 'lord') {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      } else if (roleId === 'sworn_knight') {
        c.allowedAgeCategoryNames = ['adult', 'elderly'];
      } else {
        c.allowedAgeCategoryNames = ['adult', 'teenager'];
      }
      return c;
    },
  };
}
