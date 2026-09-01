import { describe, expect, it } from 'vitest';

import { RNG } from '@ironarachne/rng';

import { describeOrganizationEmblem, renderOrganizationEmblemSvg } from './organization_emblem.js';
import {
  organizationDisplayName,
  organizationFileStem,
  organizationPersonHeading,
  organizationToDocument,
  organizationToMarkdown,
  organizationToText,
} from './organization_presentation.js';
import { rollOrganizationSnapshot } from './organization_roll.js';

const house = rollOrganizationSnapshot('presentation-house', {
  genre: 'fantasy',
  kindId: 'noble_house',
});
const company = rollOrganizationSnapshot('presentation-company', {
  genre: 'fantasy',
  kindId: 'trading_company',
});
const weavers = rollOrganizationSnapshot('presentation-weavers', {
  genre: 'fantasy',
  kindId: 'weavers_collective',
});
const circle = rollOrganizationSnapshot('presentation-circle', {
  genre: 'fantasy',
  kindId: 'signet_circle',
});

describe('the organization document', () => {
  const document = organizationToDocument(house);

  it('heads the document with the organization and lists its profile', () => {
    expect(document.title).toBe(house.name);
    expect(document.profile.some((line) => line.startsWith('Traits: '))).toBe(true);
    expect(document.profile.some((line) => line.startsWith('Goal: '))).toBe(true);
    expect(document.hook).toBe(house.profile.hook);
    expect(document.leader.heading).toContain(house.leader.lastName);
    expect(document.members).toHaveLength(house.notableMembers.length);
  });

  /** Requirement 6.4, several times over. */
  it('prints no motto, environment, description or relationships when there are none', () => {
    const bare = organizationToDocument({
      ...house,
      description: ' ',
      relationships: [],
      visualIdentity: { ...house.visualIdentity, motto: undefined },
      profile: { ...house.profile, environmentNarrative: undefined },
    });

    expect(bare.motto).toBeUndefined();
    expect(bare.paragraphs).toEqual([]);
    expect(bare.relationships).toEqual([]);
    expect(bare.profile.some((line) => line.startsWith('Environment: '))).toBe(false);
  });

  it('prints a motto, quoted, and relationships when there are some', () => {
    const full = organizationToDocument({
      ...house,
      visualIdentity: { ...house.visualIdentity, motto: 'Ever upward' },
      relationships: [{ kind: 'rival', relatedOrganizationId: 'the-other-house' }],
    });

    expect(full.motto).toBe('“Ever upward”');
    expect(full.relationships).toEqual(['rival: the-other-house']);
  });
});

describe('organizationPersonHeading', () => {
  it('prints the honorific and the name', () => {
    expect(organizationPersonHeading(house.leader)).toContain(house.leader.firstName);
  });

  it('stands in for a person with no name', () => {
    expect(
      organizationPersonHeading({ ...house.leader, firstName: '', lastName: '', titles: [] }),
    ).toBe('An unnamed member');
  });
});

describe('organizationToMarkdown', () => {
  const markdown = organizationToMarkdown(house);

  it('leads with the organization, lists the profile, heads the leader and the members', () => {
    expect(markdown.startsWith(`# ${house.name}`)).toBe(true);
    expect(markdown).toContain('- Goal: ');
    expect(markdown).toContain('**Hook** ');
    expect(markdown).toContain(`## ${organizationToDocument(house).leader.heading}`);
    expect(markdown).toContain('## Notable members');
    expect(markdown).toContain('Arms: ');
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('prints no members heading over none', () => {
    expect(organizationToMarkdown({ ...house, notableMembers: [] })).not.toContain(
      '## Notable members',
    );
  });
});

describe('organizationToText', () => {
  it('carries the same content as the Markdown, without the title', () => {
    const text = organizationToText(house);

    expect(text.startsWith('#')).toBe(false);
    expect(text).toContain('Goal: ');
    expect(text).toContain('NOTABLE MEMBERS');
    expect(text).toContain(organizationToDocument(house).leader.heading.toUpperCase());
  });
});

describe('the emblem', () => {
  it('draws every kind of emblem from its parameters', () => {
    for (const organization of [house, company, weavers, circle]) {
      const svg = renderOrganizationEmblemSvg(organization.visualIdentity.emblem, new RNG('draw'));
      expect(svg, organization.kindId).toContain('<svg');
    }
  });

  it('draws the same arms the same way from the same RNG', () => {
    expect(renderOrganizationEmblemSvg(house.visualIdentity.emblem, new RNG('same'))).toBe(
      renderOrganizationEmblemSvg(house.visualIdentity.emblem, new RNG('same')),
    );
  });

  it('draws nothing for no emblem, or for referenced arms', () => {
    expect(renderOrganizationEmblemSvg({ kind: 'none' }, new RNG('x'))).toBeNull();
    expect(renderOrganizationEmblemSvg({ kind: 'heraldry', arms: null }, new RNG('x'))).toBeNull();
  });

  it('describes each kind of emblem in a sentence', () => {
    expect(describeOrganizationEmblem(house.visualIdentity.emblem)).toMatch(/^Arms: /);
    expect(describeOrganizationEmblem(company.visualIdentity.emblem)).toMatch(/^Merchant mark: /);
    expect(describeOrganizationEmblem(weavers.visualIdentity.emblem)).toMatch(/^Pattern: /);
    expect(describeOrganizationEmblem(circle.visualIdentity.emblem)).toMatch(/^Disc emblem: /);
    expect(describeOrganizationEmblem({ kind: 'heraldry', arms: null })).toBe(
      'Bears a saved coat of arms.',
    );
    expect(describeOrganizationEmblem({ kind: 'none' })).toBe('');
  });
});

describe('organizationDisplayName and organizationFileStem', () => {
  it('read the name, and stand in for none', () => {
    expect(organizationDisplayName({ name: 'The Compact' })).toBe('The Compact');
    expect(organizationDisplayName({ name: ' ' })).toBe('Organization');
    expect(organizationFileStem({ name: "Ashford & Sons' Compact" })).toBe('ashford-sons-compact');
    expect(organizationFileStem({ name: '!!!' })).toBe('organization');
  });
});
