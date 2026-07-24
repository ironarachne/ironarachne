import {
  generate as generateCharacter,
  getDefaultCharacterGenerationConfig,
} from '$lib/characters/character_generation.js';
import type { CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import type { Settlement, SettlementImportantPerson } from './settlement_types.js';
import {
  getSettlementNotableRolePool,
  SETTLEMENT_NOTABLE_ROLES,
  type SettlementNotableRoleDefinition,
} from './settlement_notable_roles.js';
import {
  applyNotableRoleToCharacter,
  buildNotableImportance,
  getNotableRoleTitleDisplay,
  resolveNotableArchetype,
  salientNotableDetail,
} from './settlement_notable_mutators.js';

type NotableInput = {
  count: number;
  settlement: Pick<Settlement, 'name' | 'population' | 'category' | 'settlementTags'>;
  seedPrefix: string;
  rng: RNG;
  characterConfig: CharacterGenerationConfig;
};

function pickRoleSequence(
  rng: RNG,
  pool: SettlementNotableRoleDefinition[],
  n: number,
): SettlementNotableRoleDefinition[] {
  if (n <= 0) {
    return [];
  }
  let p = pool;
  if (p.length === 0) {
    p = SETTLEMENT_NOTABLE_ROLES.filter(
      (r) => r.allowedCategoryNames == null && r.requiresTag == null,
    );
  }
  if (p.length === 0) {
    p = [...SETTLEMENT_NOTABLE_ROLES];
  }
  const shuffled = rng.shuffle([...p]);
  const out: SettlementNotableRoleDefinition[] = [];
  for (let i = 0; i < n; i++) {
    out.push(shuffled[i % shuffled.length]!);
  }
  return out;
}

/**
 * Important locals: generated as adults, then civic titles, archetype, and description are applied.
 */
export function generateSettlementNotables(input: NotableInput): SettlementImportantPerson[] {
  const { count, settlement, seedPrefix, rng, characterConfig } = input;
  if (count <= 0) {
    return [];
  }
  const pool = getSettlementNotableRolePool({
    population: settlement.population,
    category: settlement.category,
    settlementTags: settlement.settlementTags,
  });
  const roles = pickRoleSequence(rng, pool, count);
  const out: SettlementImportantPerson[] = [];
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i]!;
    const archetype = resolveNotableArchetype(role);
    const seed = `${seedPrefix}-notable-${settlement.name}-${i}-${role.id}`;
    const config: CharacterGenerationConfig = {
      ...characterConfig,
      archetypeOptions: [archetype],
      allowedAgeCategoryNames: ['adult', 'elderly'],
    };
    const raw = generateCharacter(seed, config);
    const withRole = applyNotableRoleToCharacter(raw, role, archetype, rng);
    const { salientPersonality, salientPhysical } = salientNotableDetail(withRole);
    out.push({
      character: withRole,
      roleId: role.id,
      roleDisplay: getNotableRoleTitleDisplay(withRole),
      importance: buildNotableImportance(role, settlement.name, withRole),
      salientPersonality,
      salientPhysical,
    });
  }
  return out;
}

/**
 * Resolves a character config for notables when the caller did not pass one in enrichment.
 */
export function resolveNotableCharacterConfig(
  characterConfig: CharacterGenerationConfig | undefined,
  seedPrefix: string,
): CharacterGenerationConfig {
  if (characterConfig) {
    return characterConfig;
  }
  return getDefaultCharacterGenerationConfig(`${seedPrefix}-notable-default`);
}
