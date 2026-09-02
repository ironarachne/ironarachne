import { describe, expect, it } from 'vitest';

import { setDrugText } from './drug_editing';
import {
  describeDrug,
  drugDisplayName,
  drugFileStem,
  drugToDocument,
  drugToMarkdown,
  drugToText,
} from './drug_presentation';
import { rollDrugSnapshot } from './drug_roll';

const snapshot = rollDrugSnapshot('presentation-seed');

describe('arranging a drug for reading', () => {
  const document = drugToDocument(snapshot);

  it('is headed by the street name and opens with the paragraphs', () => {
    expect(document.title).toEqual(snapshot.name);
    expect(document.paragraphs).toEqual([snapshot.description, snapshot.effectDescription]);
  });

  it('lists the eight fields the page used to hide behind the description', () => {
    expect(document.lines.map((line) => line.label)).toEqual([
      'Form',
      'Taken',
      'Effect',
      'Strength',
      'Colour',
      'Duration',
      'Side effects',
      'Availability',
    ]);
  });
});

describe('dropping what is empty (6.4)', () => {
  it('drops a line whose field has been cleared', () => {
    const cleared = setDrugText(snapshot, 'sideEffect', '  ');
    expect(drugToDocument(cleared).lines.some((line) => line.label === 'Side effects')).toBe(false);
  });

  it('drops a paragraph that has been emptied', () => {
    const blanked = setDrugText(setDrugText(snapshot, 'description', ''), 'effectDescription', ' ');
    expect(drugToDocument(blanked).paragraphs).toEqual([]);
  });

  it('exports a drug emptied of everything as its title alone', () => {
    let bare = snapshot;
    for (const field of Object.keys(snapshot) as (keyof typeof snapshot)[]) {
      if (field !== 'name') {
        bare = setDrugText(bare, field, '');
      }
    }
    expect(drugToMarkdown(bare)).toEqual(`# ${snapshot.name}\n`);
  });

  it('never leaves a blank line where a field had nothing to say', () => {
    const bare = setDrugText(snapshot, 'description', '');
    expect(drugToMarkdown(bare)).not.toContain('\n\n\n');
    expect(drugToText(bare)).not.toContain('\n\n\n');
  });
});

describe('rewriting the description from the fields', () => {
  it('reads as the generator words it', () => {
    // The counterpart to the editor never recomputing it: this is offered, not applied.
    const described = describeDrug(snapshot);
    expect(described).toContain(snapshot.name);
    expect(described).toContain(snapshot.strength);
    expect(described).toContain(snapshot.commonality);
  });

  it('drops the clauses whose fields are empty rather than printing gaps', () => {
    const cleared = setDrugText(setDrugText(snapshot, 'sideEffect', ''), 'duration', '');
    const described = describeDrug(cleared);
    expect(described).not.toContain('Side effects can include');
    expect(described).not.toContain('  ');
  });

  it('picks the article from the colour', () => {
    expect(describeDrug(setDrugText(snapshot, 'color', 'amber'))).toContain("It's an amber");
    expect(describeDrug(setDrugText(snapshot, 'color', 'crimson'))).toContain("It's a crimson");
  });
});

describe('exporting a drug (6.3)', () => {
  it('writes Markdown a referee can drop into their notes', () => {
    const markdown = drugToMarkdown(snapshot);
    expect(markdown).toContain(`# ${snapshot.name}`);
    expect(markdown).toContain(`- Form: ${snapshot.drugTypeName}`);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = drugToText(snapshot);
    expect(text).toContain(`Form: ${snapshot.drugTypeName}`);
    // The title is not repeated as a line of its own — the PDF draws it as a heading. The body
    // does begin with the drug's name, because the generated description opens with it.
    expect(text.split('\n')[0]).not.toEqual(snapshot.name);
    expect(text.split('\n')[0]).toEqual(snapshot.description);
  });

  it('carries an edit straight into the export', () => {
    expect(drugToMarkdown(setDrugText(snapshot, 'name', 'Blue Jack'))).toContain('# Blue Jack');
  });
});

describe('naming a drug for a file', () => {
  it('uses the street name', () => {
    expect(drugDisplayName(snapshot)).toEqual(snapshot.name);
    expect(drugFileStem({ name: 'Star Wonder' })).toEqual('drug-star-wonder');
  });

  it('falls back to the bare stem for one with no name', () => {
    expect(drugDisplayName({ name: '  ' })).toEqual('Drug');
    expect(drugFileStem({ name: '' })).toEqual('drug');
  });

  it('reduces punctuation a filesystem would not take', () => {
    expect(drugFileStem({ name: 'Synth-9!!' })).toEqual('drug-synth-9');
  });
});
