import { organizationDisplayName, organizationSummaryLine } from '$lib/organizations';
import type { RegionSnapshot } from './region_snapshot';
import type { RegionDocument } from './region_presentation';
import { editorialSentenceChecker } from './region_editorial_evidence';

/** Saved words and a live structured directory; no selection or paraphrase while reading. */
export function appendOrganizationReading(
  snapshot: RegionSnapshot,
  document: RegionDocument,
): void {
  const gazetteer = snapshot.gazetteer;
  if (gazetteer?.version !== 6) return;
  const readable = editorialSentenceChecker(snapshot);
  const sentences = gazetteer.blocks.flatMap((block) => block.sentences);
  const section = {
    heading: 'Organizations',
    lines: [] as string[],
    entryHeadings: [] as string[],
    entryAnchors: [] as string[],
    entrySummaries: [] as string[],
  };
  for (const reading of gazetteer.organizationReadings) {
    const organization = snapshot.organizations.find(
      (entry) => entry.id === reading.organizationId,
    );
    if (!organization) continue;
    const name = organizationDisplayName(organization);
    const body =
      reading.origin === 'authored'
        ? organization.description
        : sentences
            .filter((sentence) => reading.sentenceIds.includes(sentence.id) && readable(sentence))
            .map((sentence) => sentence.text)
            .join(' ');
    section.entryHeadings.push(name);
    section.entryAnchors.push(`organization-${encodeURIComponent(organization.id)}`);
    section.entrySummaries.push(organizationSummaryLine(organization));
    section.lines.push([name, body].filter(Boolean).join('\n\n'));
  }
  if (section.lines.length) document.sections.push(section);
}
