import * as Characters from '$lib/characters';
import { generateHeraldry } from '$lib/heraldry/generator.js';
import type { CharacterGenerationConfig } from '$lib/characters/character_types.js';
import type { RNG } from '@ironarachne/rng';
import { generateMerchantMark } from '$lib/merchant_marks/generate_merchant_mark.js';
import {
  createEmptyVisualIdentity,
  withHeraldryEmblem,
  withMerchantMarkEmblem,
} from '$lib/visual_identity/visual_identity.js';
import type { VisualIdentity } from '$lib/visual_identity/visual_identity_types.js';
import { getKindsForGenerator, getOrganizationKindByIdOrLabel } from './kind_registry.js';
import type { Organization, RoleId } from './organization_types.js';
import type { OrganizationKindDefinition } from './organization_kind.js';
import {
  assertValidOrganizationHierarchy,
  describeLeaderForOrganization,
  leaderRoleIdFromHierarchy,
} from './member_mutations.js';
import { mergeHeraldryGeneratorConfig } from '$lib/heraldry/generatorconfig.js';

const SIZE_PRESETS = {
  small: { min: 5, max: 50 },
  medium: { min: 25, max: 200 },
  large: { min: 100, max: 800 },
} as const;

export type OrganizationSizeInput =
  | { kind: 'preset'; value: 'small' | 'medium' | 'large' }
  | { kind: 'range'; min: number; max: number };

export type GenerateOrganizationOptions = {
  rng: RNG;
  characterConfig: CharacterGenerationConfig;
  genre?: 'fantasy' | 'science_fiction' | 'any';
  kindId?: string | 'any';
  size?: OrganizationSizeInput;
  /** Prefix for character generation seeds. */
  seedPrefix?: string;
};

function effectiveMemberRange(
  kind: OrganizationKindDefinition,
  size: OrganizationSizeInput | undefined,
): { min: number; max: number } {
  const k = kind.defaultSizeRange;
  if (!size) {
    return { ...k };
  }
  if (size.kind === 'range') {
    const min = Math.max(k.min, size.min);
    const max = Math.min(k.max, size.max);
    return min <= max ? { min, max } : { ...k };
  }
  const p = SIZE_PRESETS[size.value];
  const min = Math.max(k.min, p.min);
  const max = Math.min(k.max, p.max);
  return min <= max ? { min, max } : { ...k };
}

function pickKindDefinition(
  rng: RNG,
  options: GenerateOrganizationOptions,
  kinds: OrganizationKindDefinition[],
): OrganizationKindDefinition {
  let pool = kinds;
  if (options.genre && options.genre !== 'any') {
    pool = pool.filter((d) => d.genre === options.genre);
  }
  if (pool.length === 0) {
    throw new Error('No organization kinds match the given genre filter.');
  }
  if (options.kindId && options.kindId !== 'any') {
    const found = pool.find((d) => d.id === options.kindId);
    if (!found) {
      throw new Error(`Unknown organization kind: ${options.kindId}`);
    }
    return found;
  }
  return rng.item(pool);
}

function buildVisualMaterialization(
  kind: OrganizationKindDefinition,
  rng: RNG,
): VisualIdentity {
  const emblemStyle = kind.visualEmblemStyle ?? 'heraldry';

  if (emblemStyle === 'merchant_mark') {
    const chargeOptions = kind.merchantMarkChargeOptions ?? [];
    if (chargeOptions.length === 0) {
      throw new Error(
        `Organization kind ${kind.id} uses merchant_mark but merchantMarkChargeOptions is empty`,
      );
    }
    const mark = generateMerchantMark(rng, { chargeOptions });
    let identity = withMerchantMarkEmblem(createEmptyVisualIdentity(), mark);
    const extras = kind.buildVisualExtras?.(rng);
    if (extras?.colors) {
      identity = { ...identity, colors: extras.colors };
    }
    if (extras?.motto !== undefined) {
      identity = { ...identity, motto: extras.motto };
    }
    if (extras?.emblem) {
      identity = { ...identity, emblem: extras.emblem };
    }
    return identity;
  }

  const cfg = mergeHeraldryGeneratorConfig({
    ...kind.heraldryConfig,
    rng,
  });
  const arms = kind.fixedArms ?? generateHeraldry(cfg);
  let identity = withHeraldryEmblem(createEmptyVisualIdentity(), arms);
  const extras = kind.buildVisualExtras?.(rng);
  if (extras?.colors) {
    identity = { ...identity, colors: extras.colors };
  }
  if (extras?.motto !== undefined) {
    identity = { ...identity, motto: extras.motto };
  }
  if (extras?.emblem) {
    identity = { ...identity, emblem: extras.emblem };
  }
  return identity;
}

/**
 * Picks subordinate role ids to generate (below leader’s order, separate runs per order band).
 */
function planNotableRoleIds(
  kind: OrganizationKindDefinition,
  rng: RNG,
  leaderId: RoleId,
): RoleId[] {
  const h = kind.hierarchy;
  const { idToOrder, childToParent } = h;
  const leaderOrder = idToOrder.get(leaderId);
  if (leaderOrder === undefined) {
    return [];
  }
  const allIds = [...new Set([...childToParent.keys(), ...idToOrder.keys()])];
  const subIds = allIds.filter((id) => {
    const o = idToOrder.get(id);
    return o !== undefined && o < leaderOrder;
  });
  if (subIds.length === 0) {
    return [];
  }
  const byOrder = new Map<number, RoleId[]>();
  for (const id of subIds) {
    const o = idToOrder.get(id)!;
    const arr = byOrder.get(o) ?? [];
    arr.push(id);
    byOrder.set(o, arr);
  }
  const sortedOrders = [...byOrder.keys()].sort((a, b) => b - a);
  const plan: RoleId[] = [];
  for (let i = 0; i < sortedOrders.length; i++) {
    const roles = byOrder.get(sortedOrders[i]) ?? [];
    if (roles.length === 0) {
      continue;
    }
    let count = 1;
    if (i === 0) {
      count = rng.int(2, 4);
    } else if (i === 1) {
      count = rng.int(1, 3);
    } else {
      count = rng.int(1, 2);
    }
    for (let k = 0; k < count; k++) {
      plan.push(rng.item(roles));
    }
  }
  return plan;
}

function randomPopularityLine(rng: RNG): string {
  return rng.item([
    'They enjoy a surprising amount of local popularity.',
    'They are not terribly popular locally.',
    "They're disliked by the local population.",
    "They're fairly popular locally but relatively unknown in the wider region.",
    'While locals are ambivalent about them, they are fairly popular in the wider region.',
    'The locals actively hate them.',
  ]);
}

/**
 * Produces a fully generated organization (name, hierarchy structure, materialized visual identity, leader, notables).
 */
export function generateOrganization(options: GenerateOrganizationOptions): Organization {
  const { rng, characterConfig } = options;
  const prefix = options.seedPrefix ?? 'org';
  const kinds = getKindsForGenerator(rng);
  const kind = pickKindDefinition(rng, options, kinds);
  const range = effectiveMemberRange(kind, options.size);
  const memberCount = rng.int(range.min, range.max);
  assertValidOrganizationHierarchy(kind.hierarchy);
  const name = kind.generateName(rng, { characterConfig });
  const descriptionCore = kind.generateDescription(rng, { name }).replace('{name}', name);
  const description =
    descriptionCore + ` It has ${memberCount} members. ` + randomPopularityLine(rng);
  const visualIdentity = buildVisualMaterialization(kind, rng);
  const leaderId = leaderRoleIdFromHierarchy(kind.hierarchy.childToParent, kind.hierarchy.idToOrder);
  if (leaderId === null) {
    throw new Error(`Organization kind ${kind.id} has no leader role.`);
  }
  const mutator = kind.mutators.get(leaderId);
  if (!mutator) {
    throw new Error(`Organization kind ${kind.id} has no mutator for leader ${leaderId}.`);
  }
  const leaderConfig = kind.prepareCharacterConfigForRole(leaderId, { ...characterConfig });
  const leaderBase = Characters.generate(
    `${prefix}-leader-${rng.randomString(12)}`,
    leaderConfig,
  );
  const leader = mutator({
    rng,
    baseCharacter: leaderBase,
    characterConfig: leaderConfig,
    roleId: leaderId,
    organizationName: name,
  });
  leader.description = describeLeaderForOrganization(leader, name);
  const notableRolePlan = planNotableRoleIds(kind, rng, leaderId);
  const notableMembers: (typeof leaderBase)[] = [];
  for (let n = 0; n < notableRolePlan.length; n++) {
    const roleId = notableRolePlan[n];
    const m = kind.mutators.get(roleId);
    if (!m) {
      continue;
    }
    const cfg = kind.prepareCharacterConfigForRole(roleId, { ...characterConfig });
    const base = Characters.generate(`${prefix}-notable-${n}-${rng.randomString(10)}`, cfg);
    notableMembers.push(
      m({ rng, baseCharacter: base, characterConfig: cfg, roleId, organizationName: name }),
    );
  }
  return {
    id: `${prefix}-${rng.randomString(16)}`,
    name,
    description,
    memberCount,
    visualIdentity,
    hierarchy: kind.hierarchy,
    leader,
    notableMembers,
    relationships: [],
    genre: kind.genre,
    kindId: kind.id,
  };
}

/**
 * @throws if id or `typeLabel` is not in the live registry
 */
export function getOrganizationTypeDefinitionByName(
  name: string,
  rng: RNG,
): OrganizationKindDefinition {
  return getOrganizationKindByIdOrLabel(name, rng);
}

/** @deprecated use {@link getOrganizationTypeDefinitionByName} */
export const getTypeByName = getOrganizationTypeDefinitionByName;
