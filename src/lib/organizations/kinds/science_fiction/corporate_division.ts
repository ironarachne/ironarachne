import { getChargesMatchingAnyTags } from '$lib/heraldry/charge_data.js';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';
import type { Character, CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'regional_executive', roleName: 'Regional executive', order: 2 },
  { id: 'project_lead', roleName: 'Project lead', order: 1 },
  { id: 'associate', roleName: 'Associate', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const m1: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Executive',
    maleTitle: 'Executive',
    femaleHonorific: 'Director',
    maleHonorific: 'Director',
    hasLands: false,
    landName: '',
    precedence: 0,
  });
const m2: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Project lead',
    maleTitle: 'Project lead',
    femaleHonorific: 'Lead',
    maleHonorific: 'Lead',
    hasLands: false,
    landName: '',
    precedence: 1,
  });
const m3: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Associate',
    maleTitle: 'Associate',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['regional_executive', m1],
  ['project_lead', m2],
  ['associate', m3],
]);

function heraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags(['geometric', 'star', 'compass', 'objects', 'tower', 'crown', 'fleur']),
  });
}

export function buildCorporateDivisionKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'corporate_division',
    genre: 'science_fiction',
    typeLabel: 'Corporate division',
    namingProfile: { style: 'acronym_numeric', description: '<CONSORT> Division <Greek> / <Planet> Acquisitions' },
    defaultSizeRange: { min: 40, max: 15000 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryConfig(rng),
    buildVisualExtras: (r) => ({
      motto: r.item(['Profit in orbit.', 'We own the margin.', 'Compliance is a product.', 'Sustainable extraction.']),
    }),
    generateName: (r) => {
      const greek = r.item(['Lambda', 'Sigma', 'Omega', 'Theta', 'Zeta', 'Kappa', 'Iota']);
      const con = r.item(['AstraDyne', 'HeliosMesa', 'VoidCartel', 'SynapseCore', 'TerraFirm', 'NyxaHoldings']);
      return `${con}—${greek} Division`;
    },
    generateDescription: (r) =>
      r.item([
        '{name} negotiates in boardrooms and blockades with the same cold patience.',
        '{name} is the polite face of a parent corp that will never forgive a missed quarter.',
        '{name} is tasked with a vertical no rival has cracked yet; failures vanish from the org chart.',
        '{name} outbid three planets for a lease on local labor law.',
      ]),
    prepareCharacterConfigForRole: (_id, base) => ({ ...base, allowedAgeCategoryNames: ['adult', 'elderly'] }),
  };
}
