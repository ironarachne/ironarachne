import type { RNG } from '@ironarachne/rng';
import { generateOrganization } from '$lib/organizations/generate_organization.js';
import { getOrganizationKindsForRegistry } from '$lib/organizations/kind_registry.js';
import type { Organization } from '$lib/organizations/organization_types.js';
import { getDefaultOrganizationCharacterConfig } from '$lib/organizations/fantasy.js';
import type { CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { SettlementEconomicRole } from './settlement_types.js';
import type Environment from '$lib/environment/environment.js';

/** Minimum population before a kind is allowed to headquarter in the settlement. */
const KIND_MIN_POPULATION: Partial<Record<string, number>> = {
  wizard_school: 9000,
  noble_house: 5000,
  signet_circle: 7000,
  research_institute: 8000,
  corporate_division: 15000,
  starship_squadron: 12000,
  colonial_syndicate: 9000,
  trading_company: 800,
  thieves_guild: 2500,
  mercenary_company: 600,
  sf_mercenary_outfit: 600,
  holy_order: 3000,
  smuggler_outfit: 2000,
  weavers_collective: 2000,
  druid_circle: 400,
};

function matchesOrganizationGenre(
  kind: ReturnType<typeof getOrganizationKindsForRegistry>[number],
  genre: 'fantasy' | 'science_fiction' | 'any',
): boolean {
  if (genre === 'fantasy') {
    return kind.genre === 'fantasy';
  }
  if (genre === 'science_fiction') {
    return kind.genre === 'science_fiction';
  }
  return true;
}

function filterKindsForSettlement(
  population: number,
  economicRole: SettlementEconomicRole,
  genre: 'fantasy' | 'science_fiction' | 'any',
  kinds: ReturnType<typeof getOrganizationKindsForRegistry>,
): ReturnType<typeof getOrganizationKindsForRegistry> {
  return kinds.filter((k) => {
    if (population < (KIND_MIN_POPULATION[k.id] ?? 0)) {
      return false;
    }
    if (!matchesOrganizationGenre(k, genre)) {
      return false;
    }
    if (economicRole === 'agrarian' && (k.id === 'corporate_division' || k.id === 'starship_squadron')) {
      return false;
    }
    if (population < 2000 && k.defaultSizeRange.min > 80) {
      return false;
    }
    return true;
  });
}

type OrgGenInput = {
  count: number;
  population: number;
  economicRole: SettlementEconomicRole;
  environment: Environment;
  /** Used for `generateOrganization` seeds and optional world flavor. */
  settlementName: string;
  seedPrefix: string;
  genre: 'fantasy' | 'science_fiction' | 'any';
  rng: RNG;
  characterConfig: CharacterGenerationConfig;
};

/**
 * Produces N organizations with kinds suited to population and `economicRole`, reusing the global registry.
 */
export function generateSettlementOrganizations(input: OrgGenInput): Organization[] {
  const { count, population, economicRole, environment, settlementName, seedPrefix, genre, rng, characterConfig } =
    input;
  if (count <= 0) {
    return [];
  }
  const allKinds = getOrganizationKindsForRegistry(rng);
  let pool = filterKindsForSettlement(population, economicRole, genre, allKinds);
  if (pool.length === 0) {
    pool = allKinds.filter(
      (k) =>
        population >= (KIND_MIN_POPULATION[k.id] ?? 0) && matchesOrganizationGenre(k, genre),
    );
  }
  if (pool.length === 0) {
    return [];
  }
  const out: Organization[] = [];
  for (let i = 0; i < count; i++) {
    const kind = rng.item(pool);
    out.push(
      generateOrganization({
        rng,
        characterConfig,
        kindId: kind.id,
        genre: genre === 'any' ? 'any' : genre,
        size: { kind: 'preset', value: 'medium' },
        seedPrefix: `${seedPrefix}-org-${settlementName}-${i}`,
        environment,
        worldContext: { kind: 'hint', text: `Operating near the settlement of ${settlementName}.` },
      }),
    );
  }
  return out;
}

/**
 * Resolves a character config for org generation when the caller did not pass one.
 */
export function resolveOrgCharacterConfig(
  characterConfig: CharacterGenerationConfig | undefined,
  seedPrefix: string,
): CharacterGenerationConfig {
  if (characterConfig) {
    return characterConfig;
  }
  return getDefaultOrganizationCharacterConfig(`${seedPrefix}-org-chars`);
}
