/**
 * A constructed language arranged for reading, and the Markdown and PDF exports written from it.
 *
 * **6.3 was a real loss here, and the issue says so.** A conlang *is* a document — the phonology,
 * the typology, the morphology, and the lexicon as a two-column glossary — and this tool had no
 * export at all. A user who generated a language they liked could read it on screen and take
 * nothing away.
 *
 * 6.4 comes with it. A language whose lexicon has been pruned of every adjective must not print an
 * Adjectives heading over nothing, and one with no possession marker must not print a line
 * describing an affix it does not have. Every section is dropped by construction when what would go
 * under it is empty.
 *
 * The glossary is grouped by part of speech and alphabetised by gloss, which is what makes it a
 * dictionary rather than a dump: the generator emits words in bucket order, which is neither the
 * order a reader wants nor a stable one to diff against.
 */

import { applyMorphologicalAffix } from './generator.js';
import type { LanguageSnapshot } from './language_snapshot.js';
import type { Word } from './language_types.js';

/** One heading and what sits under it. A section with neither prose nor items is not printed. */
export type LanguageSection = {
  heading: string;
  paragraphs: string[];
  items: string[];
};

/** A language arranged for reading, independent of the format it is finally written in. */
export type LanguageDocument = {
  title: string;
  sections: LanguageSection[];
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

function section(heading: string, paragraphs: string[], items: string[] = []): LanguageSection {
  return { heading, paragraphs: paragraphs.filter(isPrintable), items: items.filter(isPrintable) };
}

function hasContent(entry: LanguageSection): boolean {
  return entry.paragraphs.length > 0 || entry.items.length > 0;
}

/** A part of speech as a heading: `noun` reads as `Nouns`. */
export function speechPartHeading(speechPart: string): string {
  if (speechPart === '') {
    return 'Other';
  }
  const capitalised = speechPart.charAt(0).toUpperCase() + speechPart.slice(1);
  return capitalised.endsWith('s') ? capitalised : `${capitalised}s`;
}

/** How the language marks possession, in words rather than as a union tag. */
export function possessionDescription(snapshot: LanguageSnapshot): string {
  const strategy = snapshot.possessionStrategy;
  if (strategy.kind === 'none') {
    return 'Possession is unmarked.';
  }
  if (strategy.kind === 'juxtapose_possessor_before') {
    return 'Possession is shown by placing the possessor before the thing possessed.';
  }
  if (strategy.kind === 'juxtapose_possessor_after') {
    return 'Possession is shown by placing the possessor after the thing possessed.';
  }
  return `Possession is marked on the thing possessed, with the ${strategy.placement} “${strategy.affix}”.`;
}

/** What the language does with articles, in words. */
export function articleDescription(snapshot: LanguageSnapshot): string {
  if (snapshot.articleSystem === 'none') {
    return 'The language has no articles.';
  }
  if (snapshot.articleSystem === 'definite_only') {
    return 'The language has a definite article and no indefinite one.';
  }
  return 'The language has both definite and indefinite articles.';
}

function typologyLines(snapshot: LanguageSnapshot): string[] {
  const pattern = snapshot.syllablePattern.join('');
  return [
    `Word order: ${snapshot.wordOrder}`,
    isPrintable(snapshot.phonemeSetName) ? `Phoneme set: ${snapshot.phonemeSetName}` : '',
    isPrintable(snapshot.syllableProfile) ? `Syllable profile: ${snapshot.syllableProfile}` : '',
    isPrintable(pattern) ? `Syllable template: ${pattern}` : '',
  ];
}

/**
 * The two inflections the language has, each shown on a real word from the lexicon.
 *
 * An affix on its own is hard to read — `-ka` says less than `venka` beside `ven` does — so each
 * line carries an example when the lexicon has one to give. A language with no nouns prints the
 * plural rule without an example rather than not printing it.
 */
function morphologyLines(snapshot: LanguageSnapshot): string[] {
  const { morphology } = snapshot;
  const firstNoun = snapshot.lexicon.words.find((word) => word.speechPart === 'noun');
  const firstVerb = snapshot.lexicon.words.find((word) => word.speechPart === 'verb');

  const lines: string[] = [];
  if (isPrintable(morphology.pluralAffix)) {
    const example =
      firstNoun === undefined
        ? ''
        : ` — ${firstNoun.root} becomes ${applyMorphologicalAffix(firstNoun.root, morphology.pluralAffix, morphology.pluralPlacement)}`;
    lines.push(`Plural: ${morphology.pluralPlacement} “${morphology.pluralAffix}”${example}`);
  }
  if (isPrintable(morphology.pastAffix)) {
    const example =
      firstVerb === undefined
        ? ''
        : ` — ${firstVerb.root} becomes ${applyMorphologicalAffix(firstVerb.root, morphology.pastAffix, morphology.pastPlacement)}`;
    lines.push(`Past tense: ${morphology.pastPlacement} “${morphology.pastAffix}”${example}`);
  }
  return lines;
}

/** One glossary line: the form, how it sounds, and what it means. */
export function glossaryLine(word: Word): string {
  const pronunciation = isPrintable(word.pronunciation) ? ` /${word.pronunciation}/` : '';
  return `${word.root}${pronunciation} — ${word.meaning}`;
}

/**
 * The lexicon as a glossary, grouped by part of speech and alphabetised by gloss within each.
 *
 * A part of speech with no words left produces no section at all, which is 6.4: a user who has
 * deleted every adjective should not be handed an Adjectives heading with nothing beneath it.
 */
export function glossarySections(snapshot: LanguageSnapshot): LanguageSection[] {
  const byPart = new Map<string, Word[]>();
  for (const word of snapshot.lexicon.words) {
    const bucket = byPart.get(word.speechPart);
    if (bucket === undefined) {
      byPart.set(word.speechPart, [word]);
    } else {
      bucket.push(word);
    }
  }

  return [...byPart.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([speechPart, words]) =>
      section(
        speechPartHeading(speechPart),
        [],
        [...words].sort((a, b) => a.meaning.localeCompare(b.meaning)).map(glossaryLine),
      ),
    )
    .filter(hasContent);
}

/** Arrange a language for reading. Every empty section is dropped here, once. */
export function languageToDocument(snapshot: LanguageSnapshot): LanguageDocument {
  const sections = [
    section('Typology', [], typologyLines(snapshot)),
    section(
      'Orthography',
      isPrintable(snapshot.orthographySummary) ? [snapshot.orthographySummary] : [],
    ),
    section('Morphology', [], morphologyLines(snapshot)),
    section('Syntax', [articleDescription(snapshot), possessionDescription(snapshot)]),
    ...glossarySections(snapshot),
  ];

  return {
    title: languageDisplayName(snapshot),
    sections: sections.filter(hasContent),
  };
}

/** What to head the document with. */
export function languageDisplayName(snapshot: LanguageSnapshot): string {
  const given = snapshot.name.trim();
  return given === '' ? 'Language' : given;
}

/** A language as Markdown, for a conlanger who wants the glossary in their own notes. */
export function languageToMarkdown(snapshot: LanguageSnapshot): string {
  const document = languageToDocument(snapshot);
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

/** The body of the PDF: the same document without the title the PDF draws as its own heading. */
export function languageToText(snapshot: LanguageSnapshot): string {
  const document = languageToDocument(snapshot);
  return document.sections
    .map((entry) =>
      [entry.heading, ...entry.paragraphs, ...entry.items.map((item) => `  ${item}`)].join('\n'),
    )
    .join('\n\n');
}

/** A filename stem for an exported language: its name, reduced to something a filesystem takes. */
export function languageFileStem(snapshot: LanguageSnapshot): string {
  const stem = languageDisplayName(snapshot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' ? 'language' : `language-${stem}`;
}
