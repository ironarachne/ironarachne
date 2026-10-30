import type { RegionSnapshot } from './region_snapshot';
import type { RegionDocument, RegionSection } from './region_presentation';
import { editorialSentenceChecker } from './region_editorial_evidence';
import {
  landscapeFacts,
  landscapeOwnerHeading,
  landscapePlaceAnchor,
  landscapePlaceCurrent,
  landscapePlaceFactIds,
} from './region_landscape_reading';

/** Arrange saved choices and names. No selection, replacement descriptions or RNG on read. */
export function appendLandscapeReading(snapshot: RegionSnapshot, document: RegionDocument): void {
  if (snapshot.gazetteer?.version !== 2) return;
  const gazetteer = snapshot.gazetteer;
  const readable = editorialSentenceChecker(snapshot);
  const all = landscapeFacts(snapshot);
  const sectionFor = (heading: string): RegionSection => {
    let section = document.sections.find((entry) => entry.heading === heading);
    if (!section) {
      section = { heading, lines: [] };
      document.sections.push(section);
    }
    return section;
  };
  for (const place of gazetteer.landscapePlaces) {
    const facts = landscapePlaceFactIds(place).flatMap((id) =>
      all.filter((fact) => fact.id === id),
    );
    const primary =
      facts.find((fact) => fact.id === place.primaryFactId) ??
      facts.find((fact) => fact.origin === 'authored');
    if (!primary) continue;
    const current = landscapePlaceCurrent(snapshot, place);
    const authored = facts.filter((fact) => fact.origin === 'authored');
    const displayName =
      primary.origin === 'authored' ? primary.name : primary.name.replace(/^the /, 'The ');
    const label = authored.length
      ? displayName
      : place.descriptor
        ? current
          ? place.descriptor
          : ''
        : displayName;
    const named = !place.descriptor || authored.length > 0;
    const sentences =
      current && !authored.length
        ? gazetteer.blocks
            .filter((block) => block.destination.landscapePlaceId === place.id)
            .flatMap((block) => block.sentences.filter(readable).map((sentence) => sentence.text))
        : [];
    if (place.descriptor && !sentences.length && !authored.length) continue;
    if (!label.trim() && !authored.some((fact) => fact.description.trim())) continue;
    const section = sectionFor(landscapeOwnerHeading(place.owner));
    const append = (heading: string, body: string, anchorId: string, factId?: string) => {
      section.factIds ??= section.lines.map(() => '');
      section.factIds.push(factId ?? place.primaryFactId);
      section.entryHeadings ??= section.lines.map(() => '');
      section.entryAnchors ??= section.lines.map(() => '');
      section.inspectionFactIds ??= section.lines.map(() => []);
      section.entryHeadings.push(heading);
      section.entryAnchors.push(anchorId);
      section.inspectionFactIds.push(factId ? [factId] : landscapePlaceFactIds(place));
      section.lines.push([heading, body].filter(Boolean).join('\n\n'));
    };
    if (authored.length) {
      for (const [index, fact] of authored.entries())
        append(
          fact.name,
          fact.description,
          index === 0
            ? landscapePlaceAnchor(place.id)
            : `${landscapePlaceAnchor(place.id)}-${encodeURIComponent(fact.id)}`,
          fact.id,
        );
    } else append(label, sentences.join(' '), landscapePlaceAnchor(place.id));
    const directoryName = authored.length ? authored[0].name : label;
    if (named && directoryName.trim()) {
      const landscape = sectionFor('Landscape');
      landscape.landscapeReferences ??= [];
      landscape.landscapeReferences.push({
        label: directoryName,
        placeId: place.id,
        owner: place.owner,
      });
    }
  }
  document.sections = document.sections.filter(
    (section) => section.lines.length || section.landscapeReferences?.length,
  );
  const order = [
    'Landscape',
    'Notable places',
    'Flora and fauna',
    'Materials and work',
    'Travel',
    'Hazards',
    'Settlements',
  ];
  document.sections.sort((a, b) => {
    const left = order.indexOf(a.heading),
      right = order.indexOf(b.heading);
    return (left < 0 ? order.length : left) - (right < 0 ? order.length : right);
  });
}
