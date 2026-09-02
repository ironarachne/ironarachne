/**
 * A drug arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export, and the page showed one paragraph — the generated description — while
 * the ten fields behind it stayed invisible. Both halves are fixed by the same document: the page
 * renders it and the exports write it, so what a referee reads on screen and what they take away
 * cannot drift.
 *
 * 6.4 applies field by field rather than section by section here, because there are no sections.
 * Every line is dropped when its field is empty, which an edited drug can be in any of eleven
 * places, and a drug emptied of everything exports its name alone.
 */

import type { DrugSnapshot } from './drug_snapshot.js';

/** One line of the sheet: a label and what it says. */
export type DrugLine = {
  label: string;
  value: string;
};

/** A drug arranged for reading, independent of the format it is finally written in. */
export type DrugDocument = {
  title: string;
  paragraphs: string[];
  lines: DrugLine[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** What to head the document with: the drug's street name, or the kind when it has none. */
export function drugDisplayName(drug: { name: string }): string {
  const name = drug.name.trim();
  return name === '' ? 'Drug' : name.trim();
}

/**
 * The description as the generator words it, from the fields as they stand now.
 *
 * The same sentence `describe()` builds during generation, exposed so a user who has edited the
 * fields can ask for the paragraph to match — the counterpart to the editor never recomputing it
 * (4.2). Nothing calls this automatically.
 */
export function describeDrug(snapshot: DrugSnapshot): string {
  const article = /^[aeiou]/i.test(snapshot.color.trim()) ? 'an' : 'a';
  const parts = [
    isPrintable(snapshot.strength) || isPrintable(snapshot.effectTypeName)
      ? `${drugDisplayName(snapshot)} is a ${[snapshot.strength, snapshot.effectTypeName].filter(isPrintable).join(' ')}.`
      : '',
    isPrintable(snapshot.color) || isPrintable(snapshot.drugTypeName)
      ? `It's ${article} ${[snapshot.color, snapshot.drugTypeName].filter(isPrintable).join(' ')}${isPrintable(snapshot.method) ? ` that is ${snapshot.method}` : ''}.`
      : '',
    snapshot.effectDescription,
    snapshot.duration,
    isPrintable(snapshot.sideEffect) ? `Side effects can include ${snapshot.sideEffect}.` : '',
    snapshot.commonality,
  ];

  return parts.filter(isPrintable).join(' ');
}

/** Arrange a drug for reading. */
export function drugToDocument(snapshot: DrugSnapshot): DrugDocument {
  const lines: DrugLine[] = [
    { label: 'Form', value: snapshot.drugTypeName },
    { label: 'Taken', value: snapshot.method },
    { label: 'Effect', value: snapshot.effectTypeName },
    { label: 'Strength', value: snapshot.strength },
    { label: 'Colour', value: snapshot.color },
    { label: 'Duration', value: snapshot.duration },
    { label: 'Side effects', value: snapshot.sideEffect },
    { label: 'Availability', value: snapshot.commonality },
  ];

  return {
    title: drugDisplayName(snapshot),
    paragraphs: [snapshot.description, snapshot.effectDescription].filter(isPrintable),
    lines: lines.filter((line) => isPrintable(line.value)),
  };
}

/** A drug as Markdown, for a referee who wants it in their own notes. */
export function drugToMarkdown(snapshot: DrugSnapshot): string {
  const document = drugToDocument(snapshot);
  const blocks = [`# ${document.title}`, ...document.paragraphs];

  if (document.lines.length > 0) {
    blocks.push(document.lines.map((line) => `- ${line.label}: ${line.value}`).join('\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document as plain text, without the title the PDF draws itself. */
export function drugToText(snapshot: DrugSnapshot): string {
  const document = drugToDocument(snapshot);
  const blocks = [...document.paragraphs];

  if (document.lines.length > 0) {
    blocks.push(document.lines.map((line) => `${line.label}: ${line.value}`).join('\n'));
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported drug, reduced to something a filesystem takes. */
export function drugFileStem(drug: { name: string }): string {
  const stem = drugDisplayName(drug)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'drug' ? 'drug' : `drug-${stem}`;
}
