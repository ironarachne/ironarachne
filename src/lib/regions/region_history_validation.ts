import { asRecord } from '$lib/artifact_kinds';
import type { RegionSnapshot } from './region_snapshot';
import type { HistoryEvent, HistoryReference, HistoryObservation } from './region_history_types';
import { regionSourcesError } from './region_assessment_validation';
import { regionSemanticFactLists } from './region_fact_lists';
import { historyEvidenceKey } from './region_history_evidence';

const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const natural = (v: unknown): v is number => Number.isSafeInteger(v) && Number(v) >= 0;
const origin = (v: unknown) => v === 'generated' || v === 'authored';
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(text) && new Set(v).size === v.length;
const relations = [
  'allied',
  'rival',
  'subsidiary',
  'parent',
  'client',
  'supplier',
  'vassal',
  'overlord',
];
const consequenceKinds = [
  'existence',
  'claim-continuity',
  'subordination',
  'rivalry',
  'abandonment',
  'recovery',
  'population-origin',
];
export const historyReferenceKey = (ref: HistoryReference): string => historyEvidenceKey(ref);

/** Validate stored structure independently of whether observed support is still current. */
export function regionHistoryError(value: unknown, snapshot: RegionSnapshot): string | null {
  const history = asRecord(value);
  if (
    !history ||
    (history.version !== 1 && history.version !== 2) ||
    !['unrecorded', 'generated', 'authored'].includes(String(history.state)) ||
    !Array.isArray(history.actors) ||
    !Array.isArray(history.events)
  )
    return 'region history has an invalid schema';
  if (history.state === 'unrecorded' && (history.actors.length || history.events.length))
    return 'unrecorded history must be empty';
  const actors = new Map<string, 'realm' | 'community'>();
  for (const v of history.actors) {
    const actor = asRecord(v);
    if (
      !actor ||
      !text(actor.id) ||
      !text(actor.name) ||
      !origin(actor.origin) ||
      (actor.kind !== 'realm' && actor.kind !== 'community') ||
      actors.has(actor.id)
    )
      return 'history has an invalid or duplicate actor';
    actors.set(actor.id, actor.kind);
  }
  const facts = new Set(
    regionSemanticFactLists.flatMap((key) => snapshot.facts[key].map((fact) => fact.id)),
  );
  const refValid = (v: unknown, present = false): v is HistoryReference => {
    const ref = asRecord(v);
    if (!ref) return false;
    switch (ref.kind) {
      case 'realm':
        return text(ref.realmId) && snapshot.realmIds.includes(ref.realmId);
      case 'settlement':
        return (
          text(ref.settlementId) && snapshot.settlements.some((s) => s.id === ref.settlementId)
        );
      case 'organization':
        return (
          text(ref.organizationId) &&
          snapshot.organizations.some((o) => o.id === ref.organizationId)
        );
      case 'fact':
        return text(ref.factId) && facts.has(ref.factId);
      case 'historicalActor':
        return !present && text(ref.actorId) && actors.has(ref.actorId);
      default:
        return false;
    }
  };
  const observationValid = (v: unknown): v is HistoryObservation => {
    const obs = asRecord(v);
    if (!obs) return false;
    if (obs.kind === 'historicalActor')
      return history.version === 2 && refValid({ ...obs }) && typeof obs.name === 'string';
    if (!refValid({ ...obs }, true)) return false;
    if (obs.kind === 'fact') {
      if (!text(obs.observed)) return false;
      try {
        return asRecord(JSON.parse(obs.observed))?.id === obs.factId;
      } catch {
        return false;
      }
    }
    if (typeof obs.name !== 'string') return false;
    if (obs.kind === 'settlement')
      return natural(obs.mapNodeId) && snapshot.map.nodes.some((node) => node.id === obs.mapNodeId);
    if (obs.kind === 'realm')
      return (
        (obs.parentRealmId === null ||
          (text(obs.parentRealmId) && snapshot.realmIds.includes(obs.parentRealmId))) &&
        Array.isArray(obs.tiles) &&
        obs.tiles.every((id) => natural(id) && snapshot.map.nodes.some((node) => node.id === id)) &&
        new Set(obs.tiles).size === obs.tiles.length &&
        Array.isArray(obs.claims) &&
        obs.claims.every((v) => {
          const claim = asRecord(v);
          return (
            !!claim &&
            text(claim.claimantRealmId) &&
            snapshot.realmIds.includes(claim.claimantRealmId) &&
            text(claim.status)
          );
        })
      );
    return (
      Array.isArray(obs.relationships) &&
      obs.relationships.every((v) => {
        const relation = asRecord(v);
        return (
          !!relation &&
          text(relation.relatedOrganizationId) &&
          relations.includes(String(relation.kind))
        );
      })
    );
  };
  const events: HistoryEvent[] = [];
  const eventIds = new Set<string>(),
    orders = new Set<number>();
  for (const v of history.events) {
    const event = asRecord(v),
      time = asRecord(event?.time),
      evidence = asRecord(event?.evidence),
      reason = asRecord(evidence?.reason);
    if (
      !event ||
      !text(event.id) ||
      eventIds.has(event.id) ||
      typeof event.name !== 'string' ||
      typeof event.description !== 'string' ||
      !origin(event.origin) ||
      !time ||
      !natural(time.order) ||
      orders.has(time.order) ||
      (time.yearsBeforePresent !== undefined && !natural(time.yearsBeforePresent)) ||
      !Array.isArray(event.participants) ||
      !event.participants.length ||
      !event.participants.every((ref) => refValid(ref)) ||
      new Set(event.participants.map((ref) => historyReferenceKey(ref))).size !==
        event.participants.length ||
      !strings(event.causedByEventIds) ||
      !Array.isArray(event.consequences) ||
      !event.consequences.length ||
      !event.consequences.every((v) => {
        const c = asRecord(v);
        return !!c && refValid(c.target, true) && consequenceKinds.includes(String(c.kind));
      }) ||
      !reason ||
      !text(reason.ruleId) ||
      !['current', 'stale'].includes(String(reason.status)) ||
      !Array.isArray(evidence?.observations) ||
      !evidence.observations.some((obs) => asRecord(obs)?.kind !== 'historicalActor') ||
      !evidence.observations.every(observationValid)
    )
      return 'history has an invalid event, time, participant or observation';
    const sourceError = regionSourcesError(
      reason.sources,
      reason.status === 'stale',
      snapshot.map,
      facts,
    );
    if (sourceError) return sourceError;
    const typed = event as unknown as HistoryEvent;
    const outcome = asRecord(event.outcome);
    const participant = (v: unknown) =>
      refValid(v) &&
      typed.participants.some((ref) => historyReferenceKey(ref) === historyReferenceKey(v));
    const realmParticipant = (id: unknown) =>
      text(id) && participant({ kind: 'realm', realmId: id });
    const historicalParticipant = (id: unknown, kind: 'realm' | 'community') =>
      text(id) && actors.get(id) === kind && participant({ kind: 'historicalActor', actorId: id });
    let allowed: string[] = [];
    if (!outcome) return 'history event has no outcome';
    switch (outcome.kind) {
      case 'founding': {
        const founded = asRecord(outcome.founded);
        if (
          !founded ||
          !participant(founded) ||
          !['settlement', 'realm', 'organization', 'historicalActor'].includes(String(founded.kind))
        )
          return 'history founding has an invalid subject';
        allowed = ['existence'];
        break;
      }
      case 'war': {
        if (
          !Array.isArray(outcome.sides) ||
          outcome.sides.length < 2 ||
          !outcome.sides.every(
            (side) =>
              participant(side) && ['realm', 'organization', 'historicalActor'].includes(side.kind),
          ) ||
          new Set(outcome.sides.map(historyReferenceKey)).size !== outcome.sides.length ||
          !['rivalry-persists', 'claim-persists'].includes(String(outcome.resolution))
        )
          return 'history war has invalid sides or resolution';
        allowed = outcome.resolution === 'rivalry-persists' ? ['rivalry'] : ['claim-continuity'];
        break;
      }
      case 'incorporation': {
        const predecessor = asRecord(outcome.predecessor);
        if (
          !predecessor ||
          !participant(predecessor) ||
          !['realm', 'historicalActor'].includes(String(predecessor.kind)) ||
          (predecessor.kind === 'historicalActor' &&
            actors.get(String(predecessor.actorId)) !== 'realm') ||
          !realmParticipant(outcome.successorRealmId) ||
          (predecessor.kind === 'realm' && predecessor.realmId === outcome.successorRealmId)
        )
          return 'history incorporation has invalid realms';
        allowed = ['subordination', 'claim-continuity'];
        break;
      }
      case 'fall':
        if (
          !historicalParticipant(outcome.historicalRealmId, 'realm') ||
          !realmParticipant(outcome.successorRealmId)
        )
          return 'history fall has invalid realms';
        allowed = ['claim-continuity'];
        break;
      case 'disaster':
        if (
          !text(outcome.disasterKind) ||
          !participant({ kind: 'fact', factId: outcome.damageFactId })
        )
          return 'history disaster has no damage fact';
        allowed = ['abandonment', 'recovery'];
        break;
      case 'migration':
        if (
          !historicalParticipant(outcome.communityId, 'community') ||
          !participant({ kind: 'fact', factId: outcome.movementFactId })
        )
          return 'history migration has invalid community or movement';
        allowed = ['population-origin'];
        break;
      default:
        return 'history has an unknown outcome';
    }
    if (typed.consequences.some((c) => !allowed.includes(c.kind)))
      return 'history consequence is incompatible with outcome';
    const observedTarget = (ref: HistoryReference) =>
      typed.evidence.observations.some(
        (obs) =>
          (ref.kind === 'realm' && obs.kind === 'realm' && obs.realmId === ref.realmId) ||
          (ref.kind === 'organization' &&
            obs.kind === 'organization' &&
            obs.organizationId === ref.organizationId) ||
          (ref.kind === 'settlement' &&
            obs.kind === 'settlement' &&
            obs.settlementId === ref.settlementId) ||
          (ref.kind === 'fact' && obs.kind === 'fact' && obs.factId === ref.factId),
      );
    if (
      typed.consequences.some((c) => !observedTarget(c.target)) ||
      typed.participants.some((ref) => ref.kind !== 'historicalActor' && !observedTarget(ref))
    )
      return 'history consequence needs a positive observation';
    if (
      history.version === 2 &&
      (typed.participants.some(
        (ref) =>
          ref.kind === 'historicalActor' &&
          !typed.evidence.observations.some(
            (obs) => obs.kind === 'historicalActor' && obs.actorId === ref.actorId,
          ),
      ) ||
        typed.evidence.observations.some(
          (obs) =>
            obs.kind === 'historicalActor' &&
            !typed.participants.some(
              (ref) => ref.kind === 'historicalActor' && ref.actorId === obs.actorId,
            ),
        ))
    )
      return 'history actor names need observations matching their participants';
    const outcomeValue = typed.outcome;
    if (
      outcomeValue.kind === 'founding' &&
      outcomeValue.founded.kind !== 'historicalActor' &&
      typed.consequences.some(
        (c) => historyReferenceKey(c.target) !== historyReferenceKey(outcomeValue.founded),
      )
    )
      return 'founding must explain the founded subject';
    if (outcomeValue.kind === 'war') {
      const sideKeys = new Set(outcomeValue.sides.map(historyReferenceKey));
      if (typed.consequences.some((c) => !sideKeys.has(historyReferenceKey(c.target))))
        return 'war consequence must involve a side';
      if (outcomeValue.resolution === 'rivalry-persists') {
        if (
          outcomeValue.sides.some((side) => side.kind !== 'organization') ||
          !typed.evidence.observations.some(
            (obs) =>
              obs.kind === 'organization' &&
              sideKeys.has(
                historyReferenceKey({ kind: 'organization', organizationId: obs.organizationId }),
              ) &&
              obs.relationships.some(
                (r) =>
                  r.kind === 'rival' &&
                  r.relatedOrganizationId !== obs.organizationId &&
                  sideKeys.has(
                    historyReferenceKey({
                      kind: 'organization',
                      organizationId: r.relatedOrganizationId,
                    }),
                  ),
              ),
          )
        )
          return 'war rivalry needs a saved rivalry between its sides';
      } else if (
        outcomeValue.sides.some(
          (side) =>
            side.kind !== 'realm' &&
            !(side.kind === 'historicalActor' && actors.get(side.actorId) === 'realm'),
        ) ||
        !typed.evidence.observations.some(
          (obs) =>
            obs.kind === 'realm' &&
            sideKeys.has(historyReferenceKey({ kind: 'realm', realmId: obs.realmId })) &&
            obs.claims.some(
              (c) =>
                c.status === 'unpressed' &&
                c.claimantRealmId !== obs.realmId &&
                sideKeys.has(historyReferenceKey({ kind: 'realm', realmId: c.claimantRealmId })),
            ),
        )
      )
        return 'war claim continuity needs a recognized saved claim';
    }
    if (outcomeValue.kind === 'incorporation' || outcomeValue.kind === 'fall') {
      if (
        typed.consequences.some(
          (c) =>
            c.target.kind !== 'realm' ||
            (c.target.realmId !== outcomeValue.successorRealmId &&
              !(
                outcomeValue.kind === 'incorporation' &&
                outcomeValue.predecessor.kind === 'realm' &&
                c.target.realmId === outcomeValue.predecessor.realmId
              )),
        )
      )
        return 'realm succession consequence has an unrelated target';
      if (outcomeValue.kind === 'incorporation' && outcomeValue.predecessor.kind === 'realm') {
        const predecessorId = outcomeValue.predecessor.realmId;
        if (
          !typed.evidence.observations.some(
            (obs) =>
              obs.kind === 'realm' &&
              obs.realmId === predecessorId &&
              obs.parentRealmId === outcomeValue.successorRealmId,
          )
        )
          return 'incorporation must retain saved subordination';
      }
    }
    if (outcomeValue.kind === 'disaster' || outcomeValue.kind === 'migration')
      return 'history disaster and migration require an approved typed evidence adapter';
    events.push(typed);
    eventIds.add(typed.id);
    orders.add(typed.time.order);
  }
  const ordered = [...events].sort((a, b) => a.time.order - b.time.order);
  const byId = new Map(events.map((e) => [e.id, e]));
  const founded = new Set<string>(),
    dissolved = new Set<string>();
  const foundingOrders = new Map(
    events.flatMap((event) =>
      event.outcome.kind === 'founding'
        ? [[historyReferenceKey(event.outcome.founded), event.time.order] as const]
        : [],
    ),
  );
  if (foundingOrders.size !== events.filter((event) => event.outcome.kind === 'founding').length)
    return 'history subject has duplicate foundings';
  let previousDate = Infinity;
  for (const event of ordered) {
    for (const id of event.causedByEventIds) {
      const parent = byId.get(id);
      if (!parent || parent.time.order >= event.time.order)
        return 'history causal edges must point to earlier events';
    }
    const date = event.time.yearsBeforePresent;
    if (date !== undefined) {
      if (date > previousDate) return 'history dates run backwards';
      previousDate = date;
    }
    const subject = event.outcome.kind === 'founding' ? event.outcome.founded : undefined;
    if (
      event.participants.some(
        (ref) => (foundingOrders.get(historyReferenceKey(ref)) ?? -1) > event.time.order,
      )
    )
      return 'history participant acts before founding';
    for (const ref of event.participants)
      if (ref.kind === 'historicalActor') {
        if (dissolved.has(ref.actorId)) return 'historical actor acts after dissolution';
        if (subject?.kind === 'historicalActor' && subject.actorId === ref.actorId)
          founded.add(ref.actorId);
        else if (!founded.has(ref.actorId)) return 'historical actor acts before founding';
      }
    if (event.outcome.kind === 'fall') dissolved.add(event.outcome.historicalRealmId);
    if (
      event.outcome.kind === 'incorporation' &&
      event.outcome.predecessor.kind === 'historicalActor'
    )
      dissolved.add(event.outcome.predecessor.actorId);
  }
  if (
    [...actors.keys()].some(
      (id) =>
        !events.some((e) =>
          e.participants.some((r) => r.kind === 'historicalActor' && r.actorId === id),
        ),
    )
  )
    return 'history contains an unused actor';
  return null;
}
