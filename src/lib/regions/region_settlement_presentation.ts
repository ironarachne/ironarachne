import { settlementSummaryLine } from '$lib/settlements';
import type { RegionDocument } from './region_presentation';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionNotableReferenceContext } from './region_notable_reading_types';
import { editorialSentenceChecker } from './region_editorial_evidence';
import { sameSettlement } from './region_livelihood_evidence';
import { notableSubjectName } from './region_notable_identity';

/** Arrange the saved roles; never select omitted facts or generate wording while reading. */
export function appendSettlementReading(
  snapshot: RegionSnapshot,
  document: RegionDocument,
  references: RegionNotableReferenceContext,
): void {
  const gazetteer = snapshot.gazetteer;
  if (gazetteer?.version !== 5) return;
  const readable = editorialSentenceChecker(snapshot, references);
  const sentences = gazetteer.blocks.flatMap((block) => block.sentences);
  const section = {
    heading: 'Settlements',
    lines: [] as string[],
    entryHeadings: [] as string[],
    entryAnchors: [] as string[],
    entrySummaries: [] as string[],
    entryPossibleWork: [] as string[],
    inspectionFactIds: [] as string[][],
  };
  for (const reading of gazetteer.settlementReadings) {
    const target = reading.settlement;
    const settlement =
      target.kind === 'embedded'
        ? snapshot.settlements.find((entry) => entry.id === target.settlementId)
        : undefined;
    if (target.kind === 'embedded' && !settlement) continue;
    const name =
      notableSubjectName(snapshot, { kind: 'settlement', target }, references) ||
      'Referenced settlement';
    const saved = (ids: string[]) =>
      sentences
        .filter((sentence) => ids.includes(sentence.id) && readable(sentence))
        .map((sentence) => sentence.text)
        .join(' ');
    const portrait =
      settlement?.descriptionReason === undefined && settlement
        ? settlement.snapshot.description
        : saved(reading.portraitSentenceIds);
    const authoredPortrait = snapshot.facts.activities.filter(
      (fact) => fact.origin === 'authored' && sameSettlement(fact.settlement, target),
    );
    const authoredWork = [
      ...snapshot.facts.products,
      ...snapshot.facts.dailyLife,
      ...snapshot.facts.supply,
    ].filter((fact) => fact.origin === 'authored' && sameSettlement(fact.settlement, target));
    section.entryHeadings.push(name);
    section.entryAnchors.push(
      target.kind === 'embedded'
        ? `settlement-${encodeURIComponent(target.settlementId)}`
        : `settlement-reference-${encodeURIComponent(target.targetId)}`,
    );
    section.entrySummaries.push(settlement ? settlementSummaryLine(settlement.snapshot) : '');
    section.entryPossibleWork.push(
      [saved(reading.opportunitySentenceIds), ...authoredWork.map((fact) => fact.description)]
        .filter(Boolean)
        .join('\n\n'),
    );
    section.inspectionFactIds.push([...authoredPortrait, ...authoredWork].map((fact) => fact.id));
    section.lines.push(
      [
        name,
        [portrait, ...authoredPortrait.map((fact) => fact.description)]
          .filter(Boolean)
          .join('\n\n'),
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
  }
  if (section.lines.length) document.sections.push(section);
}
