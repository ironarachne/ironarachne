import { appendLandscapeReading } from './region_landscape_presentation';
import { landscapePlaceFactIds } from './region_landscape_reading';
import { editorialSentenceCount } from './region_editorial_policy';
import type { RegionDocument } from './region_presentation';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionEditorialSection } from './region_editorial_types';
import { editorialSentenceChecker } from './region_editorial_evidence';
import { regionSemanticFactLists } from './region_fact_lists';

const headings: Record<RegionEditorialSection, string> = {
  opening: '',
  landscape: 'Landscape',
  'notable-place': 'Notable places',
  ecology: 'Flora and fauna',
  'materials-work': 'Materials and work',
  travel: 'Travel',
  hazards: 'Hazards',
  settlement: 'Settlements',
};
/** The UI and every export consume these exact saved sentences and authored overrides. */
export function regionEditorialDocument(snapshot: RegionSnapshot): RegionDocument {
  const readable = editorialSentenceChecker(snapshot);
  const document: RegionDocument = {
    title: snapshot.name.trim().replace(/^the\s+/, 'The ') || 'Region',
    paragraphs: [],
    sections: [],
  };
  const authoredEcology = snapshot.facts.claims.some(
    (fact) => fact.id === 'claim:ecology-summary' && fact.origin === 'authored',
  );
  const landscapeIds = new Set(
    snapshot.gazetteer?.version === 2
      ? snapshot.gazetteer.landscapePlaces.flatMap(landscapePlaceFactIds)
      : [],
  );
  for (const block of snapshot.gazetteer?.blocks ?? []) {
    if (snapshot.gazetteer?.version === 2 && block.destination.landscapePlaceId) continue;
    if (authoredEcology && block.destination.section === 'ecology') continue;
    if (block.destination.section === 'opening' && snapshot.overviewReason === undefined) continue;
    const sentences = block.sentences.filter(readable).map((sentence) => sentence.text);
    if (!sentences.length) continue;
    if (block.destination.section === 'opening') {
      // Two sentences per opening paragraph, as saved; no new wording on read.
      let paragraph = '';
      let count = 0;
      for (const sentence of sentences) {
        const size = editorialSentenceCount(sentence);
        if (count + size > 2 && paragraph) {
          document.paragraphs.push(paragraph);
          paragraph = '';
          count = 0;
        }
        paragraph = [paragraph, sentence].filter(Boolean).join(' ');
        count += size;
      }
      if (paragraph) document.paragraphs.push(paragraph);
      continue;
    }
    const heading = headings[block.destination.section];
    let section = document.sections.find((entry) => entry.heading === heading);
    if (!section) {
      section = { heading, lines: [] };
      document.sections.push(section);
    }
    const target = block.destination.settlement;
    const name =
      target?.kind === 'embedded'
        ? snapshot.settlements.find((entry) => entry.id === target.settlementId)?.snapshot.name
        : undefined;
    section.entryHeadings ??= section.lines.map(() => '');
    section.entryHeadings.push(name ?? '');
    section.lines.push([name, sentences.join(' ')].filter(Boolean).join('\n\n'));
  }
  if (snapshot.overviewReason === undefined && snapshot.description.trim())
    document.paragraphs = [snapshot.description];
  // Authored source prose is intentionally outside generated sentence budgets, including blanks.
  for (const key of regionSemanticFactLists) {
    for (const fact of snapshot.facts[key].filter(
      (entry) => entry.origin === 'authored' && !landscapeIds.has(entry.id),
    )) {
      if (!fact.description.trim()) continue;
      const sectionName =
        fact.id === 'claim:ecology-summary'
          ? 'Flora and fauna'
          : key === 'routes'
            ? 'Travel'
            : key === 'ecologyInhabitants' || key === 'ecologyRelationships'
              ? 'Flora and fauna'
              : key === 'notables'
                ? 'kind' in fact && fact.kind === 'hazard'
                  ? 'Hazards'
                  : 'Notable places'
                : 'Authored details';
      let section = document.sections.find((entry) => entry.heading === sectionName);
      if (!section) {
        section = { heading: sectionName, lines: [] };
        document.sections.push(section);
      }
      section.factIds ??= section.lines.map(() => '');
      section.factIds.push(fact.id);
      section.lines.push(
        sectionName === 'Flora and fauna'
          ? fact.description
          : [fact.name, fact.description].filter(Boolean).join(': '),
      );
    }
  }
  for (const settlement of snapshot.settlements.filter(
    (entry) => entry.descriptionReason === undefined && entry.snapshot.description.trim(),
  )) {
    let section = document.sections.find((entry) => entry.heading === 'Settlements');
    if (!section) {
      section = { heading: 'Settlements', lines: [] };
      document.sections.push(section);
    }
    section.entryHeadings ??= section.lines.map(() => '');
    section.entryHeadings.push(settlement.snapshot.name);
    section.lines.push(`${settlement.snapshot.name}\n\n${settlement.snapshot.description}`);
  }
  // A name remains discoverable even when no generated paragraph earns space.
  for (const settlement of snapshot.settlements) {
    const shown = document.sections.some(
      (section) =>
        section.heading === 'Settlements' &&
        section.lines.some(
          (line) =>
            line === settlement.snapshot.name || line.startsWith(`${settlement.snapshot.name}\n`),
        ),
    );
    if (!shown) {
      let section = document.sections.find((entry) => entry.heading === 'Settlements');
      if (!section) {
        section = { heading: 'Settlements', lines: [] };
        document.sections.push(section);
      }
      section.entryHeadings ??= section.lines.map(() => '');
      section.entryHeadings.push(settlement.snapshot.name);
      section.lines.push(settlement.snapshot.name);
    }
  }
  appendLandscapeReading(snapshot, document);
  return document;
}
