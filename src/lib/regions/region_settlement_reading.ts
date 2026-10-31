import { editorialSentenceCount } from './region_editorial_policy';
import { resolveProcessingChain } from './region_processing_chain';
import { SETTLEMENT_FEATURE_RULES, settlementPortraitSubject } from '$lib/settlements';
import type Region from './region';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionEditorialCandidate } from './region_editorial_types';
import type { FactSource, SettlementTarget } from './region_fact_types';
import type { RegionSettlementReading } from './region_settlement_reading_types';
import { settlementFeatureSources } from './region_activities';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { sameSettlement } from './region_livelihood_evidence';
import {
  settlementCharacterObservation,
  settlementWorkOptions,
} from './region_settlement_reading_evidence';
export function settlementReadingCandidates(
  region: Region,
  snapshot: RegionSnapshot,
): RegionEditorialCandidate[] {
  const current = createRegionEvidenceChecker(snapshot);
  const result: RegionEditorialCandidate[] = [];
  for (const [index, settlement] of region.settlements.entries()) {
    const id = region.settlementIds?.[index];
    if (!id || region.settlementDescriptionReasons?.[id] === undefined || !settlement.name.trim())
      continue;
    const target: SettlementTarget = { kind: 'embedded', settlementId: id };
    const role = snapshot.facts.settlementRoles.find(
      (entry) =>
        sameSettlement(entry.settlement, target) &&
        entry.id.startsWith('role:site:') &&
        current(entry),
    );
    const sources = new Map<string, FactSource[]>();
    for (const rule of SETTLEMENT_FEATURE_RULES) {
      const support = rule.requirements.map((requirement) =>
        role ? settlementFeatureSources(region, settlement, role, requirement) : null,
      );
      if (support.every((entry) => entry !== null))
        sources.set(
          rule.id,
          support.flatMap((entry) => entry!),
        );
    }
    const subject = settlementPortraitSubject(settlement, id, [...sources.keys()]);
    for (const candidate of subject.candidates) {
      const support = sources.get(candidate.id) ?? [];
      const practice = candidate.topic === 'practice';
      // The activity's own saved qualification is part of the assertion, not optional flavor.
      const activity = practice
        ? snapshot.facts.activities.find((entry) =>
            support.some((source) => source.kind === 'fact' && source.factId === entry.id),
          )
        : undefined;
      let options = candidate.templates[0].parts[0].options;
      if (activity) {
        const input =
          activity.support.kind !== 'unknown'
            ? activity.support.inputs.find((input) => input.kind === 'product')
            : undefined;
        const product =
          input?.kind === 'product'
            ? snapshot.facts.products.find((entry) => entry.id === input.productId)
            : undefined;
        if (product) {
          const work = settlementWorkOptions(snapshot, product)[0];
          if (!work) continue;
          options = [
            work.replace(`${settlement.name} could `, 'Households '),
            work.replace(`${settlement.name} could `, 'Local households '),
          ];
        }
      }
      const peerCount = practice
        ? snapshot.facts.activities.filter(
            (entry) => entry.activityKey === activity?.activityKey && current(entry),
          ).length
        : 0;
      result.push({
        narrative: {
          ...candidate,
          sourceIds: support.flatMap((source) => (source.kind === 'fact' ? [source.factId] : [])),
          id: `editorial:portrait:${id}:${candidate.id}`,
          importance: practice && peerCount === 1 ? 'distinctive' : 'supporting',
          templates: [
            {
              ...candidate.templates[0],
              parts: [
                {
                  id: 'sentence',
                  options: options.map(
                    (text) =>
                      `At ${settlement.name}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`,
                  ),
                },
              ],
            },
          ],
        },
        subjectKey: id,
        settlementReadingRole: 'portrait',
        assertionKeys: [`portrait:${id}:${candidate.id}`],
        destinations: [{ section: 'settlement', settlement: target }],
        priority: {
          residentConsequence: practice && peerCount === 1,
          connectsSubjects: practice && peerCount === 1,
          locatedDetail: !!role,
          peerSupportCount: peerCount,
        },
        sources: [
          ...(role
            ? [{ kind: 'fact' as const, factId: role.id }]
            : [
                {
                  kind: 'environment' as const,
                  field: 'biome' as const,
                  observedValue: JSON.stringify(snapshot.environment.biome),
                },
              ]),
          ...support,
        ],
        observations: [
          settlementCharacterObservation(id, settlement),
          {
            kind: 'notable-name',
            subject: { kind: 'settlement', target },
            observedName: settlement.name,
          },
        ],
      });
    }
  }
  const practicedProducts = new Set(
    snapshot.facts.activities
      .filter((activity) => current(activity))
      .flatMap((activity) =>
        activity.support.kind === 'unknown'
          ? []
          : activity.support.inputs.flatMap((input) =>
              input.kind === 'product'
                ? resolveProcessingChain(snapshot.facts, input.productId).products.map(
                    (product) => product.id,
                  )
                : [],
            ),
      ),
  );
  for (const product of snapshot.facts.products) {
    if (practicedProducts.has(product.id)) continue;
    const options = settlementWorkOptions(snapshot, product);
    if (!options.length) continue;
    const target = product.settlement;
    if (target.kind !== 'embedded') continue;
    const chain = resolveProcessingChain(snapshot.facts, product.id);
    const key = JSON.stringify([
      product.productKey,
      [...new Set(chain.localInputs.map((input) => input.resourceId))].sort(),
      chain.imports.map((input) => JSON.stringify([input.resourceName, input.satisfies])).sort(),
    ]);
    result.push({
      narrative: {
        id: `editorial:work:${product.id}`,
        topic: 'material',
        importance: 'distinctive',
        sourceIds: [product.id],
        templates: [{ id: `settlement-work:${key}`, parts: [{ id: 'sentence', options }] }],
      },
      subjectKey: target.settlementId,
      settlementReadingRole: 'opportunity',
      assertionKeys: [`work:${product.id}`],
      destinations: [{ section: 'settlement', settlement: target }],
      priority: {
        residentConsequence: false,
        connectsSubjects: true,
        locatedDetail: true,
        peerSupportCount: 1,
      },
      sources: [{ kind: 'fact', factId: product.id }],
      observations: [
        {
          kind: 'notable-name',
          subject: { kind: 'settlement', target },
          observedName: snapshot.settlements.find((entry) => entry.id === target.settlementId)!
            .snapshot.name,
        },
      ],
    });
  }
  for (const entry of result.filter((entry) => entry.settlementReadingRole === 'opportunity')) {
    const key = entry.narrative.templates[0].id;
    const peers = new Set(
      result
        .filter(
          (peer) =>
            peer.settlementReadingRole === 'opportunity' && peer.narrative.templates[0].id === key,
        )
        .map((peer) => peer.subjectKey),
    ).size;
    entry.priority.peerSupportCount = peers;
    if (peers > 1) entry.narrative.importance = 'supporting';
  }
  return result.filter((entry) =>
    entry.narrative.templates[0].parts[0].options.every(
      (text) => editorialSentenceCount(text) === 1,
    ),
  );
}

export function emptySettlementReadings(snapshot: RegionSnapshot): RegionSettlementReading[] {
  const targets: SettlementTarget[] = snapshot.settlements.map((entry) => ({
    kind: 'embedded',
    settlementId: entry.id,
  }));
  for (const fact of [
    ...snapshot.facts.settlementRoles,
    ...snapshot.facts.activities,
    ...snapshot.facts.dailyLife,
    ...snapshot.facts.products,
    ...snapshot.facts.supply,
  ]) {
    if (
      fact.settlement.kind === 'artifact' &&
      !targets.some((target) => sameSettlement(target, fact.settlement))
    )
      targets.push(fact.settlement);
  }
  return targets
    .sort((a, b) =>
      JSON.stringify(a) < JSON.stringify(b) ? -1 : JSON.stringify(a) > JSON.stringify(b) ? 1 : 0,
    )
    .map((settlement) => ({ settlement, portraitSentenceIds: [], opportunitySentenceIds: [] }));
}
