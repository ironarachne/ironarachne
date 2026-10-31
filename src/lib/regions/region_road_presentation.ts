import { regionHook } from './region_prose';
import { editorialSentenceChecker } from './region_editorial_evidence';
import { readableRoad, roadPathCurrent } from './region_road_evidence';
import { notableSubjectName, notableHeading, notableEntryAnchor } from './region_notable_identity';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionDocument } from './region_presentation';
import type { RegionNotableReferenceContext } from './region_notable_reading_types';

export const roadEntryAnchor = (id: string) => `route-${encodeURIComponent(id)}`;

/** Directory headings resolve identities; all descriptive sentences are already saved. */
export function appendRoadReading(
  snapshot: RegionSnapshot,
  document: RegionDocument,
  references: RegionNotableReferenceContext = {},
) {
  if (snapshot.gazetteer?.version !== 4) return;
  const gazetteer = snapshot.gazetteer;
  const readable = editorialSentenceChecker(snapshot, references);
  for (const route of [...snapshot.facts.routes]
    .filter((route) => route.kind === 'road')
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const reading = gazetteer.roadReadings.find((entry) => entry.routeId === route.id);
    const authored = route.origin === 'authored';
    if (!authored && !readableRoad(snapshot, route)) continue;
    const labels = route.endpoints.map((endpoint) =>
      endpoint.kind === 'settlement'
        ? notableSubjectName(
            snapshot,
            { kind: 'settlement', target: endpoint.settlement },
            references,
          ) || (endpoint.settlement.kind === 'artifact' ? 'Referenced settlement' : 'Settlement')
        : endpoint.kind === 'notable'
          ? snapshot.facts.notables.find((entry) => entry.id === endpoint.notableId)?.name ||
            'Notable place'
          : 'Region boundary',
    );
    const heading = authored && route.name ? route.name : labels.join(' to ');
    const current =
      reading &&
      reading.observations.every(
        (observation) => observation.kind === 'road-path' && roadPathCurrent(snapshot, observation),
      );
    const sentences = current
      ? gazetteer.blocks
          .filter((block) => block.destination.routeId === route.id)
          .flatMap((block) => block.sentences.filter(readable))
      : [];
    const authoredText = regionHook(route.description);
    const text = authored
      ? authoredText.body
      : sentences.map((sentence) => sentence.text).join(' ');
    let section = document.sections.find((section) => section.heading === 'Travel');
    if (!section) {
      section = { heading: 'Travel', lines: [] };
      document.sections.push(section);
    }
    section.entryHeadings ??= section.lines.map(() => '');
    section.entryAnchors ??= section.lines.map(() => '');
    section.factIds ??= section.lines.map(() => '');
    section.inspectionFactIds ??= section.lines.map(() => []);
    section.entryReferences ??= section.lines.map(() => []);
    const links: { label: string; anchorId: string }[] = [];
    if (current && !authored && reading.detailOwnerRouteId) {
      const owner = snapshot.facts.routes.find((route) => route.id === reading.detailOwnerRouteId);
      const block = gazetteer.blocks.find(
        (block) => block.destination.routeId === owner?.id && block.sentences.some(readable),
      );
      if (owner && block)
        links.push({
          label:
            'Shared road–river detail: ' +
            owner.endpoints
              .map((endpoint) =>
                endpoint.kind === 'settlement'
                  ? notableSubjectName(
                      snapshot,
                      { kind: 'settlement', target: endpoint.settlement },
                      references,
                    ) || 'Settlement'
                  : 'Route endpoint',
              )
              .join(' to '),
          anchorId: roadEntryAnchor(owner.id),
        });
    }
    if (current && !authored && reading.promptNotableId) {
      const notable = snapshot.facts.notables.find((fact) => fact.id === reading.promptNotableId);
      const shown = document.sections.some((section) =>
        section.factIds?.some((id, index) => id === notable?.id && section.entryPrompts?.[index]),
      );
      if (notable && shown)
        links.push({
          label: 'Suggested adventure: ' + notableHeading(snapshot, notable, references),
          anchorId: notableEntryAnchor(notable.id),
        });
    }
    section.entryReferences.push(links);
    section.entryPrompts ??= section.lines.map(() => '');
    section.entryPromptHeadings ??= section.lines.map(() => '');
    section.entryPrompts.push(authored ? (authoredText.hook ?? '') : '');
    section.entryPromptHeadings.push(authored && authoredText.hook ? 'Authored adventure' : '');
    section.entryHeadings.push(heading);
    section.entryAnchors.push(roadEntryAnchor(route.id));
    section.factIds.push(route.id);
    section.inspectionFactIds.push([route.id]);
    section.lines.push([heading, text].filter(Boolean).join('\n\n'));
  }
}
