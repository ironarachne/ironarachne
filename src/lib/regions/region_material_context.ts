import type { MaterialSourceSettlement, RegionalMaterialPresentation } from '$lib/settlements';
import { unavailableRegionalMaterials } from '$lib/settlements';
import type { RegionSnapshot } from './region_snapshot';
import { settlementDailyLifeContext } from './region_livelihood_presentation';
import {
  dailyLifeEvidenceCurrent,
  dailyLifeInputCurrent,
  sameSettlement,
} from './region_livelihood_evidence';
import { regionContextEvidenceCurrent } from './region_context_evidence';

export function regionMaterialSources(
  snapshot: RegionSnapshot,
): { target: MaterialSourceSettlement; name: string }[] {
  const embedded = snapshot.settlements.map((entry) => ({
    target: { kind: 'embedded' as const, settlementId: entry.id },
    name: entry.snapshot.name || 'Unnamed settlement',
  }));
  const ids = [
    ...new Set(
      snapshot.facts.settlementRoles.flatMap((entry) =>
        entry.settlement.kind === 'artifact' ? [entry.settlement.targetId] : [],
      ),
    ),
  ].sort();
  return [
    ...embedded.sort((a, b) => (a.target.settlementId < b.target.settlementId ? -1 : 1)),
    ...ids.map((targetId) => ({
      target: { kind: 'artifact' as const, targetId },
      name: `Referenced settlement (${targetId})`,
    })),
  ];
}

/** A current, attributed projection of saved facts, not a new settlement's supply claim. */
export function describeRegionMaterials(
  snapshot: RegionSnapshot,
  source: MaterialSourceSettlement,
): RegionalMaterialPresentation {
  const chosen = regionMaterialSources(snapshot).find((entry) =>
    sameSettlement(entry.target, source),
  );
  if (!chosen)
    return unavailableRegionalMaterials(
      'The selected source settlement is no longer in the region.',
    );
  const context = settlementDailyLifeContext(snapshot.facts, source);
  const result: RegionalMaterialPresentation = {
    status: 'empty',
    sourceName: chosen.name,
    buildingMaterials: [],
    fuel: [],
    crafts: [],
    notices: [],
  };
  const categories = [
    ['building-material', 'buildingMaterials'],
    ['fuel', 'fuel'],
    ['craft', 'crafts'],
  ] as const;
  for (const [category, key] of categories) {
    for (const fact of context[category]) {
      const role = snapshot.facts.settlementRoles.find((entry) => entry.id === fact.siteRoleId);
      const start = role?.anchor.nodeIds[0];
      const current =
        role !== undefined &&
        start !== undefined &&
        sameSettlement(role.settlement, source) &&
        dailyLifeEvidenceCurrent(snapshot.facts, fact) &&
        regionContextEvidenceCurrent(snapshot, fact) &&
        fact.inputs.every((input) =>
          dailyLifeInputCurrent(snapshot.facts, snapshot.map, start, source, input),
        );
      if (!current) {
        result.status = 'needs-review';
        result.notices.push(
          `${fact.name || 'Material assertion'} needs review because its supporting explanation is stale or unavailable.`,
        );
      } else {
        result[key].push([fact.name, fact.description].filter((text) => text.trim()).join(': '));
        if (result.status !== 'needs-review') result.status = 'current';
      }
    }
  }
  if (result.status === 'empty')
    result.notices.push('No building materials, fuel or crafts are recorded for this source.');
  return result;
}
