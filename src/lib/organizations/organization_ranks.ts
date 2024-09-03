import type OrganizationRank from "./organization_rank";

export function getRanksOfTier(tier: number, ranks: OrganizationRank[]): OrganizationRank[] {
  const ranksOfTier = ranks.filter(rank => rank.tier === tier);
  return ranksOfTier;
}

export function getLowerRanks(rank: OrganizationRank, ranks: OrganizationRank[]): OrganizationRank[] {
  const lowerRanks = [];

  for (let i = 0; i < rank.children.length; i++) {
    const childRank = ranks[rank.children[i]];
    if (childRank) {
      lowerRanks.push(childRank);
    }
  }

  return lowerRanks;
}

export function getHigherRank(rank: OrganizationRank, ranks: OrganizationRank[]): OrganizationRank | null {
  if (rank.parent === null) {
    return null;
  }

  return ranks[rank.parent];
}

export function getDistinctTiers(ranks: OrganizationRank[]): number[] {
  const tiers = ranks.map(rank => rank.tier);
  const distinctTiers = [...new Set(tiers)];
  return distinctTiers;
}
