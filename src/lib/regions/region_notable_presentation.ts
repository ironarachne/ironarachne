import { notableEditorialCandidates } from './region_notable_candidates';
import { editorialSentenceChecker } from './region_editorial_evidence';
import {
  notableEntryAnchor,
  notableHeading,
  notableLocation,
  notableReadingCurrent,
} from './region_notable_identity';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionDocument } from './region_presentation';
import type { RegionNotableReferenceContext } from './region_notable_reading_types';

/** Only validate stored suggestions. Never pick, compose, or replace one while reading. */
export function appendNotableReading(
  snapshot: RegionSnapshot,
  document: RegionDocument,
  references: RegionNotableReferenceContext = {},
) {
  if (snapshot.gazetteer?.version !== 3 && snapshot.gazetteer?.version !== 4) return;
  const gazetteer = snapshot.gazetteer;
  const readable = editorialSentenceChecker(snapshot, references);
  const candidates = notableEditorialCandidates(snapshot);
  const currentCandidates = candidates.prompts;
  for (const reading of gazetteer.notableReadings) {
    const fact = snapshot.facts.notables.find((entry) => entry.id === reading.notableId);
    if (!fact || !notableReadingCurrent(snapshot, reading)) continue;
    const landscape = gazetteer.landscapePlaces.find((place) => place.primaryFactId === fact.id);
    const blocks = gazetteer.blocks.filter((block) =>
      landscape
        ? block.destination.landscapePlaceId === landscape.id
        : block.destination.notableId === fact.id,
    );
    const sentences = blocks.flatMap((block) =>
      block.sentences.filter(
        (sentence) =>
          readable(sentence) &&
          (landscape ||
            candidates.descriptions.some(
              (candidate) =>
                candidate.narrative.id === sentence.candidateId &&
                candidate.narrative.templates[0].parts[0].options.includes(sentence.text),
            )),
      ),
    );
    if (!blocks.length) continue;
    const heading = notableHeading(snapshot, fact, references);
    const location = landscape ? undefined : notableLocation(snapshot, fact);
    const prompt = reading.prompt;
    const validPrompt =
      sentences.length > 0 &&
      prompt &&
      readable(prompt.sentence) &&
      currentCandidates.some(
        (candidate) =>
          candidate.notableId === fact.id &&
          candidate.familyId === prompt.familyId &&
          candidate.editorial.narrative.templates.some(
            (template) =>
              template.id === prompt.sentence.selection.templateId &&
              template.parts[0].options.includes(prompt.sentence.text),
          ),
      );
    if (landscape) {
      const section = document.sections.find((entry) =>
        entry.entryAnchors?.some(
          (anchor) => anchor === `landscape-${encodeURIComponent(landscape.id)}`,
        ),
      );
      const index = section?.factIds?.indexOf(fact.id) ?? -1;
      if (section && index >= 0 && validPrompt) {
        section.entryPrompts ??= section.lines.map(() => '');
        section.entryPrompts[index] = prompt.sentence.text;
      }
      continue;
    }
    const sectionHeading = fact.kind === 'hazard' ? 'Hazards' : 'Notable places';
    let section = document.sections.find((entry) => entry.heading === sectionHeading);
    if (!section) {
      section = { heading: sectionHeading, lines: [] };
      document.sections.push(section);
    }
    section.entryHeadings ??= section.lines.map(() => '');
    section.entryAnchors ??= section.lines.map(() => '');
    section.factIds ??= section.lines.map(() => '');
    section.inspectionFactIds ??= section.lines.map(() => []);
    section.entryLocations ??= section.lines.map(() => '');
    section.entryPrompts ??= section.lines.map(() => '');
    section.entryHeadings.push(heading);
    section.entryAnchors.push(notableEntryAnchor(fact.id));
    section.factIds.push(fact.id);
    section.inspectionFactIds.push([fact.id]);
    section.entryLocations.push(location ?? '');
    section.entryPrompts.push(validPrompt ? prompt.sentence.text : '');
    section.lines.push(
      [heading, sentences.map((sentence) => sentence.text).join(' ')].filter(Boolean).join('\n\n'),
    );
  }
}
