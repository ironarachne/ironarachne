import type { RNG } from '@ironarachne/rng';
import type { OrganizationKindDefinition } from './organization_kind.js';
import { buildColonialSyndicateKind } from './kinds/science_fiction/colonial_syndicate.js';
import { buildCorporateDivisionKind } from './kinds/science_fiction/corporate_division.js';
import { buildSfMercenaryOutfitKind } from './kinds/science_fiction/mercenary_outfit.js';
import { buildResearchInstituteKind } from './kinds/science_fiction/research_institute.js';
import { buildSmugglerOutfitKind } from './kinds/science_fiction/smuggler_outfit.js';
import { buildStarshipSquadronKind } from './kinds/science_fiction/starship_squadron.js';
import { buildDruidCircleKind } from './kinds/fantasy/druid_circle.js';
import { buildHolyOrderKind } from './kinds/fantasy/holy_order.js';
import { buildMercenaryCompanyKind } from './kinds/fantasy/mercenary_company.js';
import { buildNobleHouseKind } from './kinds/fantasy/noble_house.js';
import { buildThievesGuildKind } from './kinds/fantasy/thieves_guild.js';
import { buildSignetCircleKind } from './kinds/fantasy/signet_circle.js';
import { buildTradingCompanyKind } from './kinds/fantasy/trading_company.js';
import { buildWeaversCollectiveKind } from './kinds/fantasy/weavers_collective.js';
import { buildWizardSchoolKind } from './kinds/fantasy/wizard_school.js';

/**
 * All registered kinds for one RNG snapshot (heraldry templates may differ per call, matching legacy behavior).
 */
export function getOrganizationKindsForRegistry(rng: RNG): OrganizationKindDefinition[] {
  return [
    buildMercenaryCompanyKind(rng),
    buildTradingCompanyKind(rng),
    buildWeaversCollectiveKind(rng),
    buildSignetCircleKind(rng),
    buildWizardSchoolKind(rng),
    buildHolyOrderKind(rng),
    buildThievesGuildKind(rng),
    buildDruidCircleKind(rng),
    buildNobleHouseKind(rng),
    buildCorporateDivisionKind(rng),
    buildSfMercenaryOutfitKind(rng),
    buildResearchInstituteKind(rng),
    buildSmugglerOutfitKind(rng),
    buildStarshipSquadronKind(rng),
    buildColonialSyndicateKind(rng),
  ];
}

export function getKindsForGenerator(rng: RNG): OrganizationKindDefinition[] {
  return getOrganizationKindsForRegistry(rng);
}

export function getOrganizationKindById(id: string, rng: RNG): OrganizationKindDefinition {
  const k = getOrganizationKindsForRegistry(rng).find((d) => d.id === id);
  if (!k) {
    throw new Error(`Organization kind not found: ${id}`);
  }
  return k;
}

/**
 * Resolves a human label or `snake_case` id from the live registry.
 */
export function getOrganizationKindByIdOrLabel(value: string, rng: RNG): OrganizationKindDefinition {
  const all = getOrganizationKindsForRegistry(rng);
  const byId = all.find((d) => d.id === value);
  if (byId) {
    return byId;
  }
  const v = value.toLowerCase();
  const byLabel = all.find((d) => d.typeLabel.toLowerCase() === v);
  if (byLabel) {
    return byLabel;
  }
  throw new Error(`Organization kind not found: ${value}`);
}
