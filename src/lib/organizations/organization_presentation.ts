/**
 * An organization arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export at all before requirement 6.3. What a GM wants at the table is the page
 * on paper: the name and motto, the paragraph, the profile as a list, the leader, and the notable
 * members with their lines. The one document model is written once as Markdown and once as plain
 * text for the PDF so the two cannot drift. The emblem is exported separately, as SVG from its
 * parameters, because text cannot carry it; the document says what it is instead.
 *
 * 6.4: no motto line for an organization without one, no environment line without a narrative,
 * no "Relationships" heading over an empty list, no "Notable members" heading over none, and a
 * description a user has emptied prints nothing where the prose was.
 *
 * Presentation works on the *stored* shape, so the page and the editor print through one model.
 */

import type { StoredCharacter } from '$lib/characters';
import { getHighestPrecedenceTitle, getHonorific } from '$lib/characters';

import { describeOrganizationEmblem } from './organization_emblem.js';
import type { OrganizationSnapshot } from './organization_snapshot.js';

export type OrganizationMemberSection = {
  heading: string;
  paragraphs: string[];
};

export type OrganizationDocument = {
  title: string;
  /** The motto, quoted, when there is one. */
  motto?: string;
  paragraphs: string[];
  /** "Traits: …", "Goal: …" — the profile as the page lists it. */
  profile: string[];
  hook: string;
  emblem: string;
  leader: OrganizationMemberSection;
  members: OrganizationMemberSection[];
  relationships: string[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** What to head the document with: the organization's name, or the kind when it has none. */
export function organizationDisplayName(organization: { name: string }): string {
  const name = organization.name.trim();
  return name === '' ? 'Organization' : name;
}

/**
 * A person's name with their honorific, as the page prints it.
 *
 * Reads the stored character: titles and gender travel as they are, so the same helper the page
 * uses for a live one applies.
 */
export function organizationPersonHeading(person: StoredCharacter): string {
  const honorific = getHonorific(
    person.gender.name,
    getHighestPrecedenceTitle(person.titles ?? []),
    person.gender.pronouns,
  );
  const name = `${person.firstName} ${person.lastName}`.trim();
  const named = name === '' ? 'An unnamed member' : name;
  return honorific === '' ? named : `${honorific} ${named}`;
}

function personSection(person: StoredCharacter): OrganizationMemberSection {
  return {
    heading: organizationPersonHeading(person),
    paragraphs: [person.description].filter(isPrintable),
  };
}

export function organizationToDocument(organization: OrganizationSnapshot): OrganizationDocument {
  const { profile, visualIdentity } = organization;
  const traits = profile.personalityTraits.map((trait) => trait.label).filter(isPrintable);
  const lines = [
    ...(traits.length > 0 ? [`Traits: ${traits.join(' · ')}`] : []),
    ...(isPrintable(profile.goal.label) ? [`Goal: ${profile.goal.label}`] : []),
    ...(isPrintable(profile.weakness.label) ? [`Weakness: ${profile.weakness.label}`] : []),
    ...(isPrintable(profile.publicStanding.label)
      ? [`Public standing: ${profile.publicStanding.label}`]
      : []),
    ...(profile.environmentNarrative !== undefined &&
    isPrintable(profile.environmentNarrative.shortLabel)
      ? [`Environment: ${profile.environmentNarrative.shortLabel}`]
      : []),
  ];
  const motto = visualIdentity.motto?.trim() ?? '';
  return {
    title: organizationDisplayName(organization),
    ...(motto === '' ? {} : { motto: `“${motto}”` }),
    paragraphs: [organization.description].filter(isPrintable),
    profile: lines,
    hook: profile.hook.trim(),
    emblem: describeOrganizationEmblem(visualIdentity.emblem),
    leader: personSection(organization.leader),
    members: organization.notableMembers.map(personSection),
    relationships: organization.relationships.map(
      (relationship) => `${relationship.kind}: ${relationship.relatedOrganizationId}`,
    ),
  };
}

/** An organization as Markdown, for a GM who wants it in their own notes. */
export function organizationToMarkdown(organization: OrganizationSnapshot): string {
  const document = organizationToDocument(organization);
  const blocks = [`# ${document.title}`];
  if (document.motto !== undefined) {
    blocks.push(`*${document.motto}*`);
  }
  blocks.push(...document.paragraphs);
  if (document.profile.length > 0) {
    blocks.push(document.profile.map((line) => `- ${line}`).join('\n'));
  }
  if (isPrintable(document.hook)) {
    blocks.push(`**Hook** ${document.hook}`);
  }
  if (isPrintable(document.emblem)) {
    blocks.push(document.emblem);
  }
  blocks.push(`## ${document.leader.heading}`, ...document.leader.paragraphs);
  if (document.members.length > 0) {
    blocks.push('## Notable members');
    for (const member of document.members) {
      blocks.push(`### ${member.heading}`, ...member.paragraphs);
    }
  }
  if (document.relationships.length > 0) {
    blocks.push('## Relationships', document.relationships.map((line) => `- ${line}`).join('\n'));
  }
  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function organizationToText(organization: OrganizationSnapshot): string {
  const document = organizationToDocument(organization);
  const blocks: string[] = [];
  if (document.motto !== undefined) {
    blocks.push(document.motto);
  }
  blocks.push(...document.paragraphs);
  if (document.profile.length > 0) {
    blocks.push(document.profile.join('\n'));
  }
  if (isPrintable(document.hook)) {
    blocks.push(`Hook: ${document.hook}`);
  }
  if (isPrintable(document.emblem)) {
    blocks.push(document.emblem);
  }
  blocks.push([document.leader.heading.toUpperCase(), ...document.leader.paragraphs].join('\n'));
  if (document.members.length > 0) {
    blocks.push(
      [
        'NOTABLE MEMBERS',
        ...document.members.map((m) => [m.heading, ...m.paragraphs].join('\n')),
      ].join('\n\n'),
    );
  }
  if (document.relationships.length > 0) {
    blocks.push(['RELATIONSHIPS', ...document.relationships].join('\n'));
  }
  return blocks.join('\n\n');
}

/** A filename stem for an exported organization, reduced to something a filesystem takes. */
export function organizationFileStem(organization: { name: string }): string {
  const stem = organization.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'organization' : stem;
}
