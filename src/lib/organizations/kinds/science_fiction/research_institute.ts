import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'director', roleName: 'Director', order: 2 },
  { id: 'senior_fellow', roleName: 'Senior fellow', order: 1 },
  { id: 'junior', roleName: 'Research associate', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Director',
    maleTitle: 'Director',
    femaleHonorific: 'Director',
    maleHonorific: 'Director',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Senior fellow',
    maleTitle: 'Senior fellow',
    femaleHonorific: 'Doctor',
    maleHonorific: 'Doctor',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Research associate',
    maleTitle: 'Research associate',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['director', m1],
  ['senior_fellow', m2],
  ['junior', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags(['sword', 'star', 'compass', 'objects', 'crystal', 'spiral', 'mythical']),
  });
}

export function buildResearchInstituteKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'research_institute',
    genre: 'science_fiction',
    typeLabel: 'Research institute',
    namingProfile: { style: 'compound_institutional', description: 'The <Planet> <Discipline> Institute' },
    defaultSizeRange: { min: 20, max: 3000 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    generateName: (r) =>
      `The ${r.item(['Lunar', 'Aster', 'Ceti', 'Eridani', 'Proxima', 'Belt'])} ${r.item(['Continuum', 'Tidal', 'Lattice', 'Neural', 'Plasma', 'Biosphere', 'Causal'])} ${r.item(['Institute', 'Consortium', 'Observatory', 'Array'])}`,
    generateDescription: (r) =>
      r.item([
        "{name} publishes in journals most species can't decode.",
        '{name} runs grant seasons like harvests—citation counts are the weather.',
        '{name} is funded by a trust that predates the last three governments on this rock.',
        '{name} is half university and half bunker; the tours stop at a painted door.',
      ]),
    prepareCharacterConfigForRole: (role, base) => {
      const c = { ...base };
      c.allowedAgeCategoryNames = role === 'junior' ? ['adult', 'teenager'] : ['adult', 'elderly'];
      return c;
    },
  };
}
