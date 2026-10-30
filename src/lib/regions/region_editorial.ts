import { editorialSentenceCount, editorialSingleSentence } from './region_editorial_policy';
export { editorialSentenceCount } from './region_editorial_policy';
import { siteClause } from './region_overview';
import { emptyRegionFacts } from './region_facts';
import { regionSemanticFactLists } from './region_fact_lists';
import { RNG } from '@ironarachne/rng';
import { composeNarrative, type NarrativeCandidate } from '$lib/narrative';
import type Region from './region';
import type { FactBase, FactSource, SettlementTarget } from './region_fact_types';
import type {
  RegionEditorialCandidate,
  RegionEditorialContext,
  RegionEditorialDestination,
  RegionEditorialObservation,
  RegionEditorialSection,
  RegionGazetteer,
  RegionGazetteerBlock,
} from './region_editorial_types';
import { toRegionSnapshot } from './region_snapshot';
import { createRegionEvidenceChecker } from './region_context_evidence';
import { overviewLandscape, overviewSettlement } from './region_geography_narrative';
import { identityCandidates } from './region_identity';
import { ecologyCandidates } from './region_ecology_narrative';
import {
  lexical,
  ordered,
  editorialRoads,
  populationObservation,
  roadObservation,
} from './region_editorial_evidence';

const destination = (
  section: RegionEditorialSection,
  settlement?: SettlementTarget,
): RegionEditorialDestination => ({ section, ...(settlement ? { settlement } : {}) });
export const editorialDestinationKey = (value: RegionEditorialDestination) =>
  `${value.section}:${JSON.stringify(value.settlement ?? null)}`;
const weight = { defining: 0, distinctive: 1, supporting: 2 };
const meaningKey = (entry: RegionEditorialCandidate) => entry.narrative.templates[0].id;
const targetKey = (target: SettlementTarget) =>
  target.kind === 'embedded' ? target.settlementId : JSON.stringify(target);

/** Domain adapters evaluate the entire saved pool before any editorial cap is applied. */
export function regionEditorialCandidates(region: Region): RegionEditorialCandidate[] {
  // Canonicalize copies before adapters choose peers or resolve equivalent supporting roles.
  const canonicalFacts = region.facts ? { ...region.facts } : emptyRegionFacts('current');
  for (const key of regionSemanticFactLists)
    Object.assign(canonicalFacts, {
      [key]: [...canonicalFacts[key]].sort((a, b) => lexical(a.id, b.id)),
    });
  const places = region.settlements
    .map((settlement, index) => ({
      settlement,
      id: region.settlementIds?.[index] ?? `settlement:${index + 1}`,
    }))
    .sort((a, b) => lexical(a.id, b.id));
  region = {
    ...region,
    facts: canonicalFacts,
    settlements: places.map((entry) => entry.settlement),
    settlementIds: places.map((entry) => entry.id),
  };
  const snapshot = toRegionSnapshot(region);
  const facts = snapshot.facts;
  const current = createRegionEvidenceChecker(snapshot);
  const candidates: RegionEditorialCandidate[] = [];
  const add = (
    id: string,
    topic: string,
    importance: NarrativeCandidate['importance'],
    subjectKey: string,
    options: string[],
    support: FactBase[],
    destinations: RegionEditorialDestination[],
    extra: {
      sources?: FactSource[];
      observations?: RegionEditorialObservation[];
      assertions?: string[];
      consequence?: boolean;
      connects?: boolean;
      located?: boolean;
      meaning?: string;
      peers?: number;
    } = {},
  ) => {
    options = options
      .map(editorialSingleSentence)
      .filter((text) => editorialSentenceCount(text) === 1);
    if (!options.length || support.some((fact) => !current(fact) || fact.origin === 'authored'))
      return;
    const sourceIds = ordered(support.map((fact) => fact.id));
    candidates.push({
      narrative: {
        id,
        topic,
        importance,
        sourceIds,
        templates: [
          { id: extra.meaning ?? `editorial:${topic}:${id}`, parts: [{ id: 'sentence', options }] },
        ],
      },
      subjectKey,
      assertionKeys: extra.assertions ?? [id],
      destinations,
      priority: {
        residentConsequence: extra.consequence ?? false,
        connectsSubjects: extra.connects ?? false,
        locatedDetail: extra.located ?? false,
        peerSupportCount: extra.peers ?? 0,
      },
      sources: [
        ...sourceIds.map((factId): FactSource => ({ kind: 'fact', factId })),
        ...(extra.sources ?? []),
      ],
      observations: extra.observations ?? [],
    });
  };
  const landscape = overviewLandscape(region, (fact) => current(fact));
  if (landscape)
    add(
      'editorial:landscape',
      'landscape',
      'defining',
      'region',
      landscape.candidate.templates[0].parts[0].options,
      landscape.candidate.sourceIds.flatMap((id) =>
        facts.habitats.filter((fact) => fact.id === id),
      ),
      [destination('opening'), destination('landscape')],
      { sources: landscape.sources },
    );
  else {
    const land = facts.areas.find((fact) => fact.id === 'area:land');
    if (land?.description.trim())
      add(
        'editorial:land',
        'landscape',
        'defining',
        'region',
        [land.description],
        [land],
        [destination('opening'), destination('landscape')],
      );
  }
  for (const role of facts.settlementRoles) {
    const settlement = overviewSettlement(region, role);
    const clauses = siteClause(role);
    if (!settlement || !clauses.length) continue;
    const woodland = role.reason?.ruleId === 'fantasy:region:forest-settlement:v1';
    add(
      `editorial:site:${role.id}`,
      'settlement-role',
      facts.settlementRoles.filter((entry) => entry.reason?.ruleId === role.reason?.ruleId)
        .length === 1
        ? 'distinctive'
        : 'supporting',
      targetKey(role.settlement),
      clauses.map((clause) => `${settlement.name} ${clause}.`),
      [role],
      [destination('opening'), destination('settlement', role.settlement)],
      {
        connects: true,
        // A generic site is less specific than a relation to a named landscape.
        located: false,
        meaning: `editorial:site:${role.reason?.ruleId}`,
        assertions: [woodland ? `woodland-site:${targetKey(role.settlement)}` : `site:${role.id}`],
      },
    );
  }
  for (const entry of identityCandidates(region)) {
    const support = [entry.fact.subjectId, ...entry.fact.relatedIds].flatMap((id) =>
      [
        ...facts.routes,
        ...facts.settlementRoles,
        ...facts.denseForests,
        ...facts.mountainRanges,
        ...facts.resources,
        ...facts.resourceDeposits,
      ].filter((fact) => fact.id === id),
    );
    add(
      entry.fact.id,
      entry.family === 'resource-range'
        ? 'material'
        : entry.family === 'road-landscape'
          ? 'access'
          : 'settlement-role',
      'distinctive',
      (() => {
        const role = facts.settlementRoles.find((fact) => fact.id === entry.fact.subjectId);
        return role ? targetKey(role.settlement) : entry.fact.subjectId;
      })(),
      entry.options,
      support,
      [
        destination('opening'),
        destination(
          entry.family === 'road-landscape'
            ? 'travel'
            : entry.family === 'resource-range'
              ? 'materials-work'
              : 'landscape',
        ),
      ],
      {
        sources: entry.fact.reason?.sources,
        connects: true,
        located: true,
        assertions: [
          entry.fact.id,
          ...(entry.family === 'settlement-forest'
            ? [
                `woodland-site:${targetKey(facts.settlementRoles.find((role) => role.id === entry.fact.subjectId)!.settlement)}`,
              ]
            : []),
        ],
        meaning: `editorial:identity:${entry.family}`,
      },
    );
  }
  const roads = editorialRoads(snapshot);
  const populations = populationObservation(snapshot);
  if (populations.kind === 'settlement-populations' && populations.values.length >= 2) {
    const max = Math.max(...populations.values.map((entry) => entry.population));
    const largest = populations.values.filter((entry) => entry.population === max);
    if (largest.length === 1) {
      const id = largest[0].settlementId;
      const settlement = snapshot.settlements.find((entry) => entry.id === id)!;
      const role = facts.settlementRoles.find(
        (entry) =>
          entry.settlement.kind === 'embedded' &&
          entry.settlement.settlementId === id &&
          current(entry),
      );
      if (role)
        add(
          `editorial:largest:${id}`,
          'settlement-role',
          'defining',
          id,
          [
            `${settlement.snapshot.name} is the largest of the region's recorded settlements.`,
            `Among the region's recorded settlements, ${settlement.snapshot.name} has the largest population.`,
          ],
          [role],
          [destination('opening'), destination('settlement', role.settlement)],
          {
            observations: [populations],
            located: true,
            connects: true,
            meaning: 'editorial:largest',
          },
        );
    }
  }
  const connections = snapshot.settlements
    .filter((entry) => entry.snapshot.name.trim())
    .map((entry) => roadObservation(snapshot, entry.id, roads))
    .filter((entry) => entry.kind === 'settlement-roads');
  const maxConnections = Math.max(0, ...connections.map((entry) => entry.neighbourIds.length));
  for (const observation of connections.filter(
    (entry) => maxConnections >= 3 && entry.neighbourIds.length === maxConnections,
  )) {
    const id = observation.settlementId;
    const settlement = snapshot.settlements.find((entry) => entry.id === id)!;
    const tied =
      connections.filter((entry) => entry.neighbourIds.length === maxConnections).length > 1;
    add(
      `editorial:hub:${id}`,
      'access',
      tied ? 'distinctive' : 'defining',
      id,
      tied
        ? [
            `${settlement.snapshot.name} is one of the region's most connected settlements, with roads to ${maxConnections} other settlements.`,
          ]
        : [
            `${settlement.snapshot.name} is the region's most connected settlement, a road hub linked to ${maxConnections} other settlements.`,
            `Roads connect ${settlement.snapshot.name} to ${maxConnections} other settlements, making it the region's most connected road hub.`,
          ],
      roads.map((entry) => entry.route),
      [destination('opening'), destination('settlement', { kind: 'embedded', settlementId: id })],
      {
        observations: connections,
        sources: roads.flatMap((entry) => entry.road.sources),
        connects: true,
        consequence: true,
        located: true,
        meaning: 'editorial:hub',
      },
    );
  }
  const allFacts = [
    ...facts.ecologyRelationships,
    ...facts.ecologyInhabitants,
    ...facts.habitats,
    ...facts.notables,
  ];
  for (const entry of ecologyCandidates(snapshot, false)) {
    const support = entry.sourceIds.flatMap((id) => allFacts.filter((fact) => fact.id === id));
    const hazard = facts.notables.some((fact) => fact.id === entry.id && fact.kind === 'hazard');
    const relation = facts.ecologyRelationships.find((fact) => fact.id === entry.id);
    const significantUse =
      relation?.relation.kind === 'used-by' &&
      support.some((fact) => 'category' in fact && fact.category === 'fantastical');
    // Routine uses and feeding do not become defining just because the old local adapter said so.
    add(
      `editorial:ecology:${entry.id}`,
      hazard ? 'hazard' : 'ecology',
      hazard ? 'defining' : significantUse ? 'distinctive' : 'supporting',
      relation?.subjectId ?? entry.id,
      entry.templates[0].parts[0].options,
      support,
      [destination(hazard ? 'hazards' : 'ecology'), destination('opening')],
      {
        consequence: hazard || significantUse,
        connects: true,
        located: true,
        assertions: [`ecology:${entry.id}`],
        meaning: `editorial:ecology:${relation?.relation.kind ?? 'hazard'}`,
      },
    );
  }
  for (const population of facts.ecologyInhabitants.filter(
    (fact) => fact.category === 'fantastical',
  )) {
    const habitats = facts.habitats.filter(
      (fact) => population.habitatIds.includes(fact.id) && fact.name.trim(),
    );
    if (!habitats.length || habitats.length !== population.habitatIds.length) continue;
    const where = habitats
      .map((fact) => fact.name)
      .sort(lexical)
      .join(' and ');
    add(
      `editorial:presence:${population.id}`,
      'ecology',
      'distinctive',
      population.id,
      [
        `The local ${population.name} population occurs in ${where}.`,
        `The ${population.name} population inhabits ${where}.`,
      ],
      [population, ...habitats],
      [destination('ecology'), destination('opening')],
      { located: true, connects: true, meaning: `editorial:presence:${population.name}` },
    );
  }
  const peers = new Map<string, Set<string>>();
  for (const fact of facts.dailyLife.filter((fact) => current(fact))) {
    const key = `${fact.category}:${fact.activityKey}:${fact.name.toLowerCase()}`;
    if (!peers.has(key)) peers.set(key, new Set());
    peers.get(key)!.add(targetKey(fact.settlement));
  }
  for (const fact of facts.activities.filter((fact) => current(fact))) {
    const key = `practice:${fact.activityKey}`;
    if (!peers.has(key)) peers.set(key, new Set());
    peers.get(key)!.add(targetKey(fact.settlement));
  }
  for (const fact of facts.supply.filter((fact) => current(fact))) {
    const key = `provision:${fact.needKey}:${fact.status}`;
    if (!peers.has(key)) peers.set(key, new Set());
    peers.get(key)!.add(targetKey(fact.settlement));
  }
  const nameFor = (target: SettlementTarget) =>
    target.kind === 'embedded'
      ? snapshot.settlements.find((entry) => entry.id === target.settlementId)?.snapshot.name.trim()
      : undefined;
  for (const fact of [...facts.dailyLife, ...facts.activities, ...facts.supply]) {
    const name = nameFor(fact.settlement);
    if (!name || !fact.description.trim()) continue;
    const practice = 'support' in fact;
    const provision = 'status' in fact;
    if (provision && fact.status !== 'limited-local') continue;
    const key =
      'category' in fact
        ? `${fact.category}:${fact.activityKey}:${fact.name.toLowerCase()}`
        : practice
          ? `practice:${fact.activityKey}`
          : `provision:${fact.needKey}:${fact.status}`;
    const distinguishes = (peers.get(key)?.size ?? 0) <= 1;
    const extraction = 'category' in fact && fact.activityKey === 'raw-extraction';
    const topic = extraction
      ? 'material'
      : practice
        ? 'practice'
        : provision
          ? 'provision'
          : fact.category === 'livelihood'
            ? 'practice'
            : 'material';
    const centralPractice =
      practice &&
      distinguishes &&
      candidates.some(
        (entry) =>
          entry.narrative.importance === 'defining' &&
          entry.subjectKey === targetKey(fact.settlement),
      );
    add(
      `editorial:local:${fact.id}`,
      topic,
      centralPractice
        ? 'defining'
        : practice && distinguishes
          ? 'distinctive'
          : provision
            ? distinguishes
              ? 'distinctive'
              : 'supporting'
            : (extraction && (peers.get(key)?.size ?? 0) < snapshot.settlements.length) ||
                (distinguishes && 'category' in fact && fact.category === 'livelihood')
              ? 'distinctive'
              : 'supporting',
      targetKey(fact.settlement),
      [`${name}: ${fact.description}`],
      [fact],
      [
        destination('settlement', fact.settlement),
        ...(distinguishes && !provision ? [destination('opening')] : []),
      ],
      {
        consequence: (practice || provision) && distinguishes,
        located: true,
        connects: true,
        meaning: `editorial:local:${key}`,
        peers: peers.get(key)?.size ?? 0,
      },
    );
  }
  for (const source of facts.resourceSources) {
    if (!['available', 'limited'].includes(source.availability) || !source.description.trim())
      continue;
    const geological = source.source.kind === 'deposit';
    add(
      `editorial:source:${source.id}`,
      'material',
      geological ? 'distinctive' : 'supporting',
      source.resource.id,
      [
        `In ${snapshot.name.trim()}, ${source.resource.name} could be obtained by ${source.method}${source.availability === 'limited' ? ' in limited supply' : ''}${source.requirements.length ? `, requiring ${source.requirements.join(', ')}` : ''}.`,
      ],
      [source],
      [destination('materials-work')],
      {
        located: source.anchor.nodeIds.length > 0,
        connects: true,
        meaning: `editorial:source:${source.resource.id}`,
        peers: new Set(
          facts.dailyLife
            .filter(
              (fact) =>
                current(fact) &&
                fact.inputs.some(
                  (input) => input.kind === 'resource' && input.sourceId === source.id,
                ),
            )
            .map((fact) => targetKey(fact.settlement)),
        ).size,
      },
    );
  }
  for (const hazard of facts.notables.filter((fact) => fact.kind === 'hazard')) {
    if (candidates.some((entry) => entry.narrative.sourceIds.includes(hazard.id))) continue;
    add(
      `editorial:hazard:${hazard.id}`,
      'hazard',
      'distinctive',
      hazard.id,
      [hazard.description.split(' Hook:')[0].trim()],
      [hazard],
      [destination('hazards'), destination('opening')],
      { consequence: true, located: true },
    );
  }
  return candidates
    .filter((entry) => entry.narrative.templates[0].parts[0].options.every((text) => text.trim()))
    .sort((a, b) => lexical(a.narrative.id, b.narrative.id));
}

/** Selection and wording own independent deterministic child streams; variants cannot shift focus. */
export function composeRegionGazetteer(
  candidates: RegionEditorialCandidate[],
  rng: RNG,
  context: RegionEditorialContext = { wording: { recentSelections: [] }, recentMeaningKeys: [] },
): { gazetteer: RegionGazetteer; nextContext: RegionEditorialContext } {
  const token = rng.int(0, 2147483647);
  const selectionRng = new RNG(JSON.stringify(['gazetteer-selection-v1', token]));
  const wordingRng = new RNG(JSON.stringify(['gazetteer-wording-v1', token]));
  const nextContext = structuredClone(context);
  const blocks = new Map<string, RegionGazetteerBlock>();
  const assertionKeys = new Set<string>();
  const subjectTopics = new Map<string, number>();
  const blockTopics = new Set<string>();
  const selected: { entry: RegionEditorialCandidate; destination: RegionEditorialDestination }[] =
    [];
  const remaining = [...candidates].sort((a, b) => lexical(a.narrative.id, b.narrative.id));
  let sentences = 0;
  const counts = new Map<string, number>();
  const chooseDestination = (entry: RegionEditorialCandidate) => {
    const sections = [...entry.destinations];
    // Connected meanings follow the leading subject where their importance permits it.
    sections.sort(
      (a, b) =>
        Number(b.section === 'opening' && entry.narrative.importance !== 'supporting') -
        Number(a.section === 'opening' && entry.narrative.importance !== 'supporting'),
    );
    return sections.find((dest) => {
      const key = editorialDestinationKey(dest);
      const cost = Math.max(
        ...entry.narrative.templates[0].parts[0].options.map(editorialSentenceCount),
      );
      if (dest.section === 'opening' && cost > 2) return false;
      if (
        sentences + cost > 24 ||
        (counts.get(key) ?? 0) + cost > (dest.section === 'opening' ? 4 : 3)
      )
        return false;
      if (blockTopics.has(`${key}:${entry.narrative.topic}`)) return false;
      if (
        dest.section === 'opening' &&
        entry.narrative.topic !== 'landscape' &&
        selected.some(
          ({ entry: previous, destination: place }) =>
            place.section === 'opening' && previous.narrative.topic !== 'landscape',
        ) &&
        !selected.some(
          ({ entry: previous, destination: place }) =>
            place.section === 'opening' && previous.subjectKey === entry.subjectKey,
        )
      )
        return false;
      return true;
    });
  };
  const compareImportance = (a: RegionEditorialCandidate, b: RegionEditorialCandidate) => {
    const left = a.priority,
      right = b.priority;
    return (
      weight[a.narrative.importance] - weight[b.narrative.importance] ||
      Number(right.residentConsequence) - Number(left.residentConsequence) ||
      Number(right.connectsSubjects) - Number(left.connectsSubjects) ||
      Number(right.locatedDetail) - Number(left.locatedDetail)
    );
  };
  const compare = (a: RegionEditorialCandidate, b: RegionEditorialCandidate) =>
    compareImportance(a, b) ||
    (counts.get(editorialDestinationKey(chooseDestination(a) ?? a.destinations[0])) ?? 0) -
      (counts.get(editorialDestinationKey(chooseDestination(b) ?? b.destinations[0])) ?? 0) ||
    Number(nextContext.recentMeaningKeys.includes(meaningKey(a))) -
      Number(nextContext.recentMeaningKeys.includes(meaningKey(b)));
  while (remaining.length) {
    const available = remaining.filter(
      (entry) =>
        !entry.assertionKeys.some((key) => assertionKeys.has(key)) &&
        (subjectTopics.get(`${entry.subjectKey}:${entry.narrative.topic}`) ?? 0) < 2 &&
        (entry.narrative.importance !== 'supporting' ||
          selected.some(({ entry: previous }) => previous.subjectKey === entry.subjectKey)) &&
        chooseDestination(entry),
    );
    // Compare peer rarity only within material candidates of equal editorial priority.
    // Eliminating dominated candidates first keeps the global sort a total ordering.
    const eligible = available.filter(
      (entry) =>
        entry.narrative.topic !== 'material' ||
        !available.some(
          (other) =>
            other.narrative.topic === 'material' &&
            compareImportance(entry, other) === 0 &&
            other.priority.peerSupportCount < entry.priority.peerSupportCount,
        ),
    );
    if (!eligible.length) break;
    eligible.sort((a, b) => compare(a, b) || lexical(a.narrative.id, b.narrative.id));
    const equal = eligible.filter((entry) => compare(entry, eligible[0]) === 0);
    const entry = selectionRng.item(equal);
    const dest = chooseDestination(entry)!;
    selected.push({ entry, destination: dest });
    const cost = Math.max(
      ...entry.narrative.templates[0].parts[0].options.map(editorialSentenceCount),
    );
    sentences += cost;
    const key = editorialDestinationKey(dest);
    counts.set(key, (counts.get(key) ?? 0) + cost);
    blockTopics.add(`${key}:${entry.narrative.topic}`);
    subjectTopics.set(
      `${entry.subjectKey}:${entry.narrative.topic}`,
      (subjectTopics.get(`${entry.subjectKey}:${entry.narrative.topic}`) ?? 0) + 1,
    );
    entry.assertionKeys.forEach((assertion) => assertionKeys.add(assertion));
    nextContext.recentMeaningKeys = [...nextContext.recentMeaningKeys, meaningKey(entry)].slice(-8);
    remaining.splice(remaining.indexOf(entry), 1);
  }
  const sectionOrder: RegionEditorialSection[] = [
    'opening',
    'landscape',
    'ecology',
    'materials-work',
    'travel',
    'hazards',
    'settlement',
  ];
  selected.sort(
    (a, b) =>
      sectionOrder.indexOf(a.destination.section) - sectionOrder.indexOf(b.destination.section) ||
      lexical(editorialDestinationKey(a.destination), editorialDestinationKey(b.destination)) ||
      Number(b.entry.narrative.topic === 'landscape') -
        Number(a.entry.narrative.topic === 'landscape') ||
      lexical(a.entry.narrative.id, b.entry.narrative.id),
  );
  for (const { entry, destination: dest } of selected) {
    const result = composeNarrative(
      { id: entry.subjectKey, kind: 'region-editorial', candidates: [entry.narrative] },
      { maxSentences: 1, maxPerTopic: 1, repetitionWindow: 8 },
      {
        recentSelections: nextContext.wording.recentSelections.map((selection) =>
          selection.templateId === meaningKey(entry)
            ? { ...selection, candidateId: entry.narrative.id }
            : selection,
        ),
      },
      wordingRng,
    );
    nextContext.wording = {
      recentSelections: [...nextContext.wording.recentSelections, ...result.selections].slice(-8),
    };
    const key = editorialDestinationKey(dest);
    if (!blocks.has(key)) blocks.set(key, { id: key, destination: dest, sentences: [] });
    blocks.get(key)!.sentences.push({
      id: entry.narrative.id,
      text: result.text,
      candidateId: entry.narrative.id,
      assertionKeys: entry.assertionKeys,
      repeatedOrientation: false,
      selection: result.selections[0],
      reason: {
        ruleId: 'fantasy:region:gazetteer-editorial:v1',
        status: 'current',
        sources: entry.sources,
      },
      observations: entry.observations,
    });
  }
  return { gazetteer: { version: 1, blocks: [...blocks.values()] }, nextContext };
}

export function generateRegionGazetteer(region: Region, rng: RNG): void {
  if (region.gazetteer) return;
  region.gazetteer = composeRegionGazetteer(regionEditorialCandidates(region), rng).gazetteer;
  const opening = region.gazetteer.blocks
    .filter((block) => block.destination.section === 'opening')
    .flatMap((block) => block.sentences);
  region.description = opening.map((sentence) => sentence.text).join(' ');
  if (opening.length)
    region.overviewReason = {
      ruleId: 'fantasy:region:gazetteer-editorial:v1',
      status: 'current',
      sources: opening.flatMap((sentence) => sentence.reason.sources),
    };
  else delete region.overviewReason;
}
