import { describe, expect, it } from 'vitest';

import type { Character } from '$lib/characters';

import {
  describeEncounterMob,
  encounterDisplayName,
  encounterFileStem,
  encounterGroupHeading,
  encounterToDocument,
  encounterToMarkdown,
  encounterToText,
  type PresentableEncounter,
} from './encounter_presentation.js';
import { rollEncounter, rollEncounterSnapshot } from './encounter_roll.js';

const live = rollEncounter('presentation-live', { templateName: 'group of bandits' });
const stored = rollEncounterSnapshot('presentation-stored', { templateName: 'pack of ghouls' });

const bare: PresentableEncounter = { name: 'ambush', description: '', difficulty: 0, groups: [] };

describe('describeEncounterMob', () => {
  it('reads a live character: name, species and archetype', () => {
    const mob = live.groups[0].mobs[0];
    const line = describeEncounterMob(mob);

    expect(line.name).toBe(mob.name);
    expect(line.kind).toContain((mob as Character).species.name);
    expect(line.kind).toContain((mob as Character).archetype?.name ?? '');
  });

  it('reads a stored mob: the same words from the stored names', () => {
    const mob = stored.groups[0].mobs[0];
    const line = describeEncounterMob(mob);

    expect(line.name).toBe(mob.name);
    expect(line.kind.startsWith(mob.speciesName)).toBe(true);
  });

  it('says so for a mob with no name, because the row is still a combatant', () => {
    expect(describeEncounterMob({ ...stored.groups[0].mobs[0], name: ' ' }).name).toBe(
      'An unnamed combatant',
    );
  });
});

describe('encounterGroupHeading', () => {
  it('names the band and counts it', () => {
    expect(encounterGroupHeading({ name: 'bandits', mobs: [1, 2, 3] }, 0)).toBe('Bandits (3)');
  });

  it('numbers a band with no name', () => {
    expect(encounterGroupHeading({ mobs: [] }, 1)).toBe('Group 2 (0)');
    expect(encounterGroupHeading({ name: ' ', mobs: [1] }, 0)).toBe('Group 1 (1)');
  });
});

describe('the encounter document', () => {
  it('heads the document with the encounter and gives every band a section', () => {
    const document = encounterToDocument(live);

    expect(document.title).toBe(encounterDisplayName(live));
    expect(document.groups).toHaveLength(live.groups.length);
    expect(document.groups[0].mobs).toHaveLength(live.groups[0].mobs.length);
  });

  /** Requirement 6.4: no blank paragraph, and no "Difficulty: 0", on every sheet ever made. */
  it('drops an empty description and an unset difficulty', () => {
    expect(encounterToDocument(bare).paragraphs).toEqual([]);
  });

  it('prints a description and a difficulty when there is one', () => {
    expect(
      encounterToDocument({ ...bare, description: 'A trap.', difficulty: 40 }).paragraphs,
    ).toEqual(['A trap.', 'Difficulty: 40']);
  });
});

describe('encounterToMarkdown', () => {
  const markdown = encounterToMarkdown(live);

  it('leads with the encounter, heads every band, and lists every combatant', () => {
    expect(markdown.startsWith(`# ${encounterDisplayName(live)}`)).toBe(true);
    for (const [index, group] of live.groups.entries()) {
      expect(markdown).toContain(`## ${encounterGroupHeading(group, index)}`);
      for (const mob of group.mobs) {
        expect(markdown).toContain(`- ${mob.name} — `);
      }
    }
  });

  it('ends with a newline, as a text file should', () => {
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('prints a heading and nothing else for an encounter with nothing in it', () => {
    expect(encounterToMarkdown(bare)).toBe('# Ambush\n');
  });

  it('prints a band with no mobs as its heading alone', () => {
    expect(encounterToMarkdown({ ...bare, groups: [{ name: 'bandits', mobs: [] }] })).toBe(
      '# Ambush\n\n## Bandits (0)\n',
    );
  });
});

describe('encounterToText', () => {
  it('carries the same content as the Markdown, without the title', () => {
    const text = encounterToText(live);

    expect(text.startsWith('#')).toBe(false);
    expect(text).toContain(encounterGroupHeading(live.groups[0], 0).toUpperCase());
    expect(text).toContain(`${live.groups[0].mobs[0].name} — `);
  });

  it('prints nothing for an encounter with nothing in it', () => {
    expect(encounterToText(bare)).toBe('');
  });
});

describe('encounterDisplayName', () => {
  it('capitalises the template name the generator wrote', () => {
    expect(encounterDisplayName({ name: 'group of bandits' })).toBe('Group of bandits');
  });

  it('falls back to the kind for an encounter with no name', () => {
    expect(encounterDisplayName({ name: ' ' })).toBe('Encounter');
  });
});

describe('encounterFileStem', () => {
  it('reduces the name to something a filesystem takes', () => {
    expect(encounterFileStem({ name: "assassins' meeting" })).toBe('encounter-assassins-meeting');
  });

  it('falls back for a name that reduces to nothing', () => {
    expect(encounterFileStem({ name: '!!!' })).toBe('encounter');
  });
});
