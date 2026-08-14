import { getAllChargeGlyphs, matchingAnyTags } from '$lib/charges';
import { mergeHeraldryGeneratorConfig, type HeraldryGeneratorConfig } from '$lib/heraldry';
import type { Character, CharacterGenerationConfig } from '$lib/characters';
import * as Names from '$lib/names';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'proprietor', roleName: 'Proprietor', order: 2 },
  { id: 'manager', roleName: 'Manager', order: 1 },
  { id: 'employee', roleName: 'Employee', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const mutProprietor: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Proprietor',
    maleTitle: 'Proprietor',
    femaleHonorific: 'Mistress',
    maleHonorific: 'Master',
    hasLands: false,
    landName: '',
    precedence: 0,
  });

const mutManager: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Manager',
    maleTitle: 'Manager',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 1,
  });

const mutEmployee: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Employee',
    maleTitle: 'Employee',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['proprietor', mutProprietor],
  ['manager', mutManager],
  ['employee', mutEmployee],
]);

/** Unused when `visualEmblemStyle` is merchant_mark; kept for type & future heraldry use. */
function placeholderHeraldryConfig(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({ chargeCount: 0, rng });
}

function prepareConfig(roleId: string, base: CharacterGenerationConfig): CharacterGenerationConfig {
  const c = { ...base };
  if (roleId === 'proprietor') {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  } else {
    c.allowedAgeCategoryNames = ['adult'];
  }
  return c;
}

function generateNameImpl(rng: RNG, _characterConfig: CharacterGenerationConfig): string {
  const nameTypes = [
    () => {
      const prefix = rng.item(['Dynasty', 'Gilded', 'Luxury']);
      const suffix = rng.item([
        'Trading Company',
        'Traders',
        'Navigation Company',
        'Trade Company',
        'Trade and Navigation Company',
      ]);
      return `${prefix} ${suffix}`;
    },
    () => {
      const direction = rng.item(['North', 'West', 'South', 'East']);
      const feature = rng.item(['Wind', 'Sea', 'Mountain', 'Ocean']);
      const suffix = rng.item([
        'Trading Company',
        'Traders',
        'Navigation Company',
        'Trade Company',
        'Trade and Navigation Company',
      ]);
      return `${direction} ${feature} ${suffix}`;
    },
    () => {
      const nameGeneratorSet = Names.getFantasyNameGeneratorSet('human', rng);
      if (nameGeneratorSet.family === null) {
        return 'Anonymous Trading Company';
      }
      const familyName = rng.item(nameGeneratorSet.family.generate(100));
      const moniker = rng.item([' Brothers', ' & Sons', ' & Son', ' Family', '']);
      const suffix = rng.item([
        'Trading Company',
        'Traders',
        'Navigation Company',
        'Trade Company',
        'Trade and Navigation Company',
      ]);
      return `${familyName} ${moniker} ${suffix}`;
    },
  ];
  return rng.item(nameTypes)();
}

export function buildTradingCompanyKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'trading_company',
    genre: 'fantasy',
    typeLabel: 'Trading company',
    namingProfile: {
      style: 'family_business',
      description: 'Commercial compound names and family "House" trading lines',
    },
    defaultSizeRange: { min: 30, max: 200 },
    hierarchy,
    mutators,
    visualEmblemStyle: 'merchant_mark',
    merchantMarkChargeOptions: matchingAnyTags(
      ['barrel', 'galleon', 'water', 'objects'],
      getAllChargeGlyphs(),
    ),
    heraldryConfig: placeholderHeraldryConfig(rng),
    generateName: (r, ctx) => generateNameImpl(r, ctx.characterConfig),
    prepareCharacterConfigForRole: prepareConfig,
  };
}
