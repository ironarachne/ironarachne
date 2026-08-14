import {
  getChargesMatchingAnyTags,
  mergeHeraldryGeneratorConfig,
  type HeraldryGeneratorConfig,
} from '$lib/heraldry';
import type { Character, CharacterGenerationConfig } from '$lib/characters';
import type { RNG } from '@ironarachne/rng';
import { withPushedTitle, type MemberMutator } from '../../member_mutations.js';
import { lineChain } from '../../organization_hierarchy_builders.js';
import type { OrganizationKindDefinition } from '../../organization_kind.js';

const hierarchy = lineChain([
  { id: 'headmaster', roleName: 'Headmaster', order: 2 },
  { id: 'professor', roleName: 'Professor', order: 1 },
  { id: 'student', roleName: 'Student', order: 0 },
]);

function copyCharTitles(c: Character): Character {
  return { ...c, titles: [...(c.titles || [])] };
}

const mutHead: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Headmaster',
    maleTitle: 'Headmaster',
    femaleHonorific: 'Headmaster',
    maleHonorific: 'Headmaster',
    hasLands: false,
    landName: '',
    precedence: 0,
  });

const mutProf: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Professor',
    maleTitle: 'Professor',
    femaleHonorific: 'Professor',
    maleHonorific: 'Professor',
    hasLands: false,
    landName: '',
    precedence: 1,
  });

const mutStu: MemberMutator = (ctx) =>
  withPushedTitle(copyCharTitles(ctx.baseCharacter), {
    femaleTitle: 'Student',
    maleTitle: 'Student',
    femaleHonorific: '',
    maleHonorific: '',
    hasLands: false,
    landName: '',
    precedence: 2,
  });

const mutators: ReadonlyMap<string, MemberMutator> = new Map([
  ['headmaster', mutHead],
  ['professor', mutProf],
  ['student', mutStu],
]);

function heraldryForSchool(rng: RNG): HeraldryGeneratorConfig {
  return mergeHeraldryGeneratorConfig({
    chargeCount: rng.item([0, 1]),
    chargeOptions: getChargesMatchingAnyTags(['owl', 'wisdom', 'mythical', 'monster', 'monsters']),
  });
}

function prepareConfig(roleId: string, base: CharacterGenerationConfig): CharacterGenerationConfig {
  const c = { ...base };
  if (roleId === 'headmaster' || roleId === 'professor') {
    c.allowedAgeCategoryNames = ['adult', 'elderly'];
  } else if (roleId === 'student') {
    c.allowedAgeCategoryNames = ['child', 'teenager'];
  } else {
    c.allowedAgeCategoryNames = ['adult'];
  }
  return c;
}

function generateSchoolName(r: RNG): string {
  const schoolType = r.item(['School', 'Academy', 'College', 'Institute']);
  const variant = r.int(0, 2);
  if (variant === 0) {
    return `The ${schoolType} of ${r.item(['Witchcraft', 'Wizardry', 'Sorcery', 'Mysticism'])}`;
  }
  if (variant === 1) {
    const modifier = r.item([
      'Arcane',
      'Cherished',
      'Eldritch',
      'Esoteric',
      'Forbidden',
      'Forgotten',
      'Hidden',
      'Lost',
      'Mystical',
      'Occult',
      'Unknown',
    ]);
    const focus = r.item([
      'Mysteries',
      'Arts',
      'Sciences',
      'Paths',
      'Ways',
      'Secrets',
      'Knowledge',
      'Wisdom',
      'Power',
      'Magic',
      'Enchantment',
      'Illusion',
      'Divination',
      'Conjuration',
      'Abjuration',
      'Evocation',
      'Necromancy',
      'Transmutation',
    ]);
    return `The ${schoolType} of ${modifier} ${focus}`;
  }
  return `The ${schoolType} of ${r.item(['Arcane', 'Mystical', 'Eldritch', 'Occult'])} ${r.item(['Arts', 'Sciences', 'Paths', 'Ways', 'Secrets'])}`;
}

export function buildWizardSchoolKind(rng: RNG): OrganizationKindDefinition {
  return {
    id: 'wizard_school',
    genre: 'fantasy',
    typeLabel: 'Wizard school',
    namingProfile: {
      style: 'compound_institutional',
      description: 'The <Academy|School> of <Mystical Focus>',
    },
    defaultSizeRange: { min: 50, max: 600 },
    hierarchy,
    mutators,
    heraldryConfig: heraldryForSchool(rng),
    generateName: (r) => generateSchoolName(r),
    prepareCharacterConfigForRole: (roleId, base) => prepareConfig(roleId, base),
  };
}
