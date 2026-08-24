import type { Religion } from '$lib/religion';

import type { Settlement, SettlementImportantPerson, SettlementProblem } from './settlement_types';

export type SettlementPresentationOptions = {
  /**
   * The faith practised here, when the user built the settlement around a saved religion.
   *
   * Passed in rather than read off the settlement, because a settlement holds no copy of it: the
   * link is recorded on the artifact and the religion is a record of its own, which someone may
   * edit later. Left out, an exported settlement simply has no faith section — honest, where a
   * line about a religion the library was never given would not be.
   */
  religion?: Religion | null;
};

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type SettlementSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A settlement arranged for reading, independent of the format it is finally written in. */
export type SettlementDocument = {
  title: string;
  sections: SettlementSection[];
};

function section(heading: string, paragraphs: string[], items: string[] = []): SettlementSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function hasContent(entry: SettlementSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

function problemLine(problem: SettlementProblem): string {
  return problem.detail === undefined || problem.detail.trim() === ''
    ? problem.summary
    : `${problem.summary} ${problem.detail}`;
}

/**
 * The heading one notable is printed under: the civic role and the person holding it.
 *
 * The role is in the heading rather than in a line beneath it so a section reads as what it is
 * without the paragraph under it — "Harbourmaster Maren Voss" is unmistakably a person, where a
 * bare name sitting at the same level as Trade and Organizations is not. `roleId` stands in when a
 * settlement has been edited to have no title, since a heading is not optional.
 */
function notableHeading(person: SettlementImportantPerson): string {
  const role = isPrintable(person.roleDisplay) ? person.roleDisplay : person.roleId;
  const name = `${person.character.firstName} ${person.character.lastName}`.trim();
  return isPrintable(name) ? `${role} ${name}`.trim() : role;
}

function notableLines(person: SettlementImportantPerson): string[] {
  return [
    person.importance,
    person.salientPersonality.length === 0
      ? ''
      : `Notable demeanor: ${person.salientPersonality.join(', ')}`,
    person.salientPhysical.length === 0
      ? ''
      : `Striking look: ${person.salientPhysical.join(', ')}`,
  ];
}

function tradeSection(settlement: Settlement): SettlementSection {
  return section(
    'Trade',
    [settlement.tradeBlurb ?? ''],
    [
      (settlement.primaryExports ?? []).length === 0
        ? ''
        : `Exports: ${(settlement.primaryExports ?? []).join(', ')}`,
      (settlement.primaryImports ?? []).length === 0
        ? ''
        : `Imports: ${(settlement.primaryImports ?? []).join(', ')}`,
    ],
  );
}

function faithSection(religion: Religion | null | undefined): SettlementSection[] {
  if (religion === null || religion === undefined) {
    return [];
  }
  return [section('Faith', [religion.name, religion.description])];
}

/**
 * One section per notable, and no heading grouping them.
 *
 * A "Important People" heading would have nothing of its own under it — a settlement has no
 * paragraph about its notables as a body — and an empty heading is exactly what requirement 6.4
 * forbids. Each person carries their own role in their heading instead.
 */
function notableSections(settlement: Settlement): SettlementSection[] {
  return (settlement.importantPeople ?? []).map((person) =>
    section(notableHeading(person), notableLines(person)),
  );
}

/**
 * The line under the title: what kind of place this is, how many live there, and how it is doing.
 *
 * Assembled here rather than in each renderer so the Markdown and the PDF cannot disagree about
 * how a settlement introduces itself.
 */
export function settlementSummaryLine(settlement: Settlement): string {
  return `${settlement.category.name} · population ${settlement.population.toLocaleString()} · prosperity ${settlement.prosperity} · ${settlement.economicRole}`;
}

/**
 * Arrange a settlement for reading.
 *
 * Every empty section is dropped here, once, rather than in each renderer — which is what makes
 * requirement 6.4 (no stray blank lines from empty sections) a property of the model instead of
 * something two formats have to remember separately. It matters more for a settlement than for
 * anything else on the site: enrichment is opt-in four times over, so the plainest settlement the
 * generator makes has four of these sections empty, and a renderer that printed headings anyway
 * would hand the user a page of bare titles.
 */
export function settlementToDocument(
  settlement: Settlement,
  options: SettlementPresentationOptions = {},
): SettlementDocument {
  const sections = [
    section('Overview', [settlementSummaryLine(settlement), settlement.description]),
    section(
      'Facets',
      [],
      [
        `Law and order: ${settlement.lawAndOrder}`,
        `Commerce: ${settlement.commerce}`,
        `Food security: ${settlement.foodSecurity}`,
        `Public health: ${settlement.publicHealth}`,
      ],
    ),
    section('Environment', [settlement.environment.description], settlement.settlementTags),
    ...faithSection(options.religion),
    tradeSection(settlement),
    section('Acute Problems', [], (settlement.acuteProblems ?? []).map(problemLine)),
    section('Creeping Problems', [], (settlement.creepingProblems ?? []).map(problemLine)),
    section(
      'Organizations',
      [],
      (settlement.organizations ?? []).map(
        (organization) => `${organization.name}: ${organization.profile.hook}`,
      ),
    ),
    ...notableSections(settlement),
  ];

  return { title: settlement.name, sections: sections.filter(hasContent) };
}

/** A settlement as Markdown, for a user who wants it in their own notes. */
export function settlementToMarkdown(
  settlement: Settlement,
  options: SettlementPresentationOptions = {},
): string {
  const document = settlementToDocument(settlement, options);
  const blocks = [`# ${document.title}`];

  for (const entry of document.sections) {
    blocks.push(`## ${entry.heading}`);
    blocks.push(...entry.paragraphs);
    if (entry.items.length > 0) {
      blocks.push(entry.items.map((item) => `- ${item}`).join('\n'));
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/**
 * A settlement as plain text, for the PDF export.
 *
 * Separate from the Markdown because `#` and `-` are punctuation a PDF reader has to see past
 * rather than formatting it renders — the same content, written for a page instead of an editor.
 */
export function settlementToPlainText(
  settlement: Settlement,
  options: SettlementPresentationOptions = {},
): string {
  const document = settlementToDocument(settlement, options);
  const blocks: string[] = [];

  for (const entry of document.sections) {
    blocks.push(entry.heading.toUpperCase());
    blocks.push(...entry.paragraphs);
    blocks.push(...entry.items);
  }

  return `${blocks.join('\n\n')}\n`;
}

/** A filename stem for an exported settlement: its name, reduced to something a filesystem takes. */
export function settlementFileStem(settlement: Settlement): string {
  const stem = settlement.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'settlement' : stem;
}
