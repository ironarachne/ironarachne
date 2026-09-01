/**
 * A family arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export at all before requirement 6.3 — the tree was drawn on the page and went
 * nowhere — so alongside the tree's own download this is the roster: each person, who they are
 * married to, whose child they are and who theirs are, which is what the page prints and what a
 * GM wants in their notes. The one document model is written once as Markdown and once as plain
 * text for the PDF so the two cannot drift.
 *
 * 6.4: a member with no mate prints no "Mate" line, one with no children no "Children" line, and a
 * description a user has emptied prints nothing where the prose was. A family with no members
 * prints its title alone.
 *
 * Presentation works over the field names the live and stored shapes share, so the page (a
 * `Family`) and the editor (a `FamilySnapshot`) print through the same code. The species is the
 * one field that differs — an object on one side, a name on the other — and `familyMemberSpeciesName`
 * is where they meet.
 */

import {
  familyChildrenOf,
  familyMateOf,
  familyParentsOf,
  type FamilyLike,
} from './family_relations.js';

/** The parts of a member the roster prints, which both shapes carry. */
export type PresentableFamilyMember = {
  id: string;
  firstName: string;
  lastName: string;
  description: string;
  age: number;
  gender: { name: string };
  ageCategory: { noun: string };
  tags: string[];
} & ({ species: { name: string } } | { speciesName: string });

/** A family as the presentation reads it. */
export type PresentableFamily = FamilyLike<PresentableFamilyMember> & { name: string };

/** One member arranged for reading. */
export type FamilyMemberSection = {
  heading: string;
  /** The "42-year-old human adult" line, always present because age and species are facts. */
  summary: string;
  paragraphs: string[];
  /** "Mate: …", "Children: …", "Parents: …" — only the ones that apply. */
  relations: string[];
};

export type FamilyDocument = {
  title: string;
  members: FamilyMemberSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** The symbol the page prints beside a name. */
export function familyGenderSymbol(genderName: string): string {
  if (genderName === 'male') return '♂';
  if (genderName === 'female') return '♀';
  return '⚥';
}

/** A member's species by name, from whichever shape carries it. */
export function familyMemberSpeciesName(member: PresentableFamilyMember): string {
  return 'speciesName' in member ? member.speciesName : member.species.name;
}

/** What to head the document with: "The X Family", or the kind when there is no name. */
export function familyDisplayName(family: { name: string }): string {
  const name = family.name.trim();
  return name === '' ? 'Family' : `The ${name} Family`;
}

/** A member's full name, or a stand-in for one whose names have been emptied. */
export function familyMemberName(member: { firstName: string; lastName: string }): string {
  const name = `${member.firstName} ${member.lastName}`.trim();
  return name === '' ? 'An unnamed member' : name;
}

function nameWithSymbol(member: PresentableFamilyMember): string {
  return `${familyMemberName(member)} ${familyGenderSymbol(member.gender.name)}`;
}

/** The "42-year-old human adult (dead)" line. */
export function familyMemberSummary(member: PresentableFamilyMember): string {
  const parts = [
    `${member.age}-year-old ${familyMemberSpeciesName(member)} ${member.ageCategory.noun}`.trim(),
  ];
  if (member.tags.includes('dead')) {
    parts.push('(dead)');
  }
  return parts.join(' ');
}

function childLabel(child: PresentableFamilyMember): string {
  const marks = [];
  if (child.tags.includes('adopted')) marks.push('adopted');
  if (child.tags.includes('illegitimate')) marks.push('illegitimate');
  return marks.length === 0
    ? nameWithSymbol(child)
    : `${nameWithSymbol(child)} (${marks.join(', ')})`;
}

function memberRelations(family: PresentableFamily, member: PresentableFamilyMember): string[] {
  const relations: string[] = [];
  const mate = familyMateOf(family, member);
  if (mate !== undefined) {
    relations.push(`Mate: ${nameWithSymbol(mate)}`);
  }
  const children = familyChildrenOf(family, member);
  if (children.length > 0) {
    relations.push(`Children: ${children.map(childLabel).join(', ')}`);
  }
  const parents = familyParentsOf(family, member);
  if (parents.length > 0) {
    relations.push(`Parents: ${parents.map(nameWithSymbol).join(', ')}`);
  }
  return relations;
}

export function familyToDocument(family: PresentableFamily): FamilyDocument {
  return {
    title: familyDisplayName(family),
    members: family.members.map((member) => ({
      heading: nameWithSymbol(member),
      summary: familyMemberSummary(member),
      paragraphs: [member.description].filter(isPrintable),
      relations: memberRelations(family, member),
    })),
  };
}

/** A family as Markdown, for a GM who wants the roster in their own notes. */
export function familyToMarkdown(family: PresentableFamily): string {
  const document = familyToDocument(family);
  const blocks = [`# ${document.title}`];

  for (const member of document.members) {
    blocks.push(`## ${member.heading}`);
    blocks.push(member.summary);
    blocks.push(...member.paragraphs);
    if (member.relations.length > 0) {
      blocks.push(member.relations.map((line) => `- ${line}`).join('\n'));
    }
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function familyToText(family: PresentableFamily): string {
  const document = familyToDocument(family);
  return document.members
    .map((member) =>
      [
        member.heading.toUpperCase(),
        member.summary,
        ...member.paragraphs,
        ...member.relations,
      ].join('\n'),
    )
    .join('\n\n');
}

/** A filename stem for an exported family, reduced to something a filesystem takes. */
export function familyFileStem(family: { name: string }): string {
  const stem = family.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'family' : `${stem}-family`;
}
