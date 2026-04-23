import * as Charges from '$lib/heraldry/charges/index.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'wing_commander', roleName: 'Wing commander', order: 2 },
  { id: 'flight_lead', roleName: 'Flight lead', order: 1 },
  { id: 'pilot', roleName: 'Pilot', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Wing commander',
    maleTitle: 'Wing commander',
    femaleHonorific: 'Wing',
    maleHonorific: 'Wing',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Flight lead',
    maleTitle: 'Flight lead',
    femaleHonorific: 'Lead',
    maleHonorific: 'Lead',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Pilot',
    maleTitle: 'Pilot',
    femaleHonorific: 'Pilot',
    maleHonorific: 'Pilot',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['wing_commander', m1],
  ['flight_lead', m2],
  ['pilot', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: Charges.matchingAnyTags(
      ['eagle', 'sword', 'lightning', 'comet', 'void', 'star', 'fleur', 'objects'],
      Charges.all(),
    ),
  });
}

export function buildStarshipSquadronKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'starship_squadron',
    genre: 'science_fiction',
    typeLabel: 'Starship squadron',
    namingProfile: { style: 'acronym_numeric', description: "No. <n> <Animal> <Wing> / the <Navy> " },
    defaultSizeRange: { min: 10, max: 400 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) =>
      `No. ${r.int(1, 99)} ${r.item(['Spectral', 'Feral', 'Iron', 'Ash', 'Solar', 'Amber'])} ${r.item(['Wing', 'Squadron', 'Group', 'Element'])} - ${r.item(['1st', '2nd', '3rd', '4th', '7th', '9th', '12th'])}`,
    generateDescription: (r) =>
      r.item([
        '{name} has simulators that smell like ozone and old coffee.',
        "{name} paints kill marks where chaplains can't see from the pews.",
        "{name} rotates hull time like farmers rotate fields.",
        "{name} is understrength on paper, lethal in vacuum.",
      ]),
    prepareCharacterConfigForRole: (_roleId, base) => ({
      ...base,
      allowedAgeCategoryNames: ['adult', 'elderly'],
    }),
  };
}
