/**
 * A potion arranged for reading, and the Markdown and PDF exports written from it.
 *
 * This tool had no export at all. It also had one piece of logic in the component that belonged
 * here: the page worked out whether a potion was a drink, an oil or an ointment by sniffing
 * `liquid.properties` for the words, three levels of nested ternary deep, where nothing could test
 * it. `potionForm` owns that now.
 *
 * 6.4 applies section by section: a potion with no modifications prints no modifications line, one
 * whose base formula is the same as its display name prints no base formula, and one emptied of
 * everything exports its name alone.
 */

import { COMMON_FANTASY, valueToString } from '$lib/currency';

import { describeDurationShort, describeEffect } from './potion_descriptor';
import type { PotionSnapshot } from './potion_snapshot';
import type { PotionForm, PotionModification } from './potion_types';

/** One line of the sheet: a label and what it says. */
export type PotionLine = {
  label: string;
  value: string;
};

/** A potion arranged for reading, independent of the format it is finally written in. */
export type PotionDocument = {
  title: string;
  lines: PotionLine[];
  /** The effect sentence, and the two numbers under it. */
  effect: { description: string; lines: PotionLine[] };
  sensory: PotionLine[];
  container: { name: string; description: string; value: string };
  /** The composed prose the generator wrote. */
  description: string;
};

function isPrintable(value: string): boolean {
  return value.trim() !== '';
}

/** What to head the document with: the label on the bottle, falling back to the base formula. */
export function potionDisplayName(snapshot: PotionSnapshot): string {
  const name = snapshot.displayName.trim();
  if (name !== '') {
    return name;
  }
  const canonical = (snapshot.canonicalName ?? '').trim();
  return canonical === '' ? 'Potion' : canonical;
}

/**
 * Whether the potion is a drink, an oil or an ointment.
 *
 * The form is pushed into `liquid.properties` at generation time beside the catalog entry's tags,
 * so it is read back out of them. The page did this inline in a nested ternary; it is one function
 * with one test now, and it defaults to `drink` because that is what a potion is unless it says
 * otherwise.
 */
export function potionForm(snapshot: PotionSnapshot): PotionForm {
  if (snapshot.liquid.properties.includes('oil')) {
    return 'oil';
  }
  if (snapshot.liquid.properties.includes('ointment')) {
    return 'ointment';
  }
  return 'drink';
}

/** A price, in the currency the rest of the site quotes prices in. */
export function potionValueText(value: number): string {
  return value <= 0 ? '0 cp' : valueToString(value, COMMON_FANTASY);
}

/** One modification, as a reader meets it rather than as a tagged union. */
export function describeModification(modification: PotionModification): string {
  switch (modification.kind) {
    case 'potency':
      return `${modification.tier} (magnitude ${modification.magnitudeDelta >= 0 ? '+' : ''}${modification.magnitudeDelta})`;
    case 'duration':
      return `${modification.change} duration`;
    case 'tainted':
      return 'tainted';
    case 'homebrew':
      return 'homebrew';
    default:
      // A modification kind this build does not know is still a modification a payload carries.
      return (modification as { kind: string }).kind;
  }
}

/** Arrange a potion for reading. */
export function potionToDocument(snapshot: PotionSnapshot): PotionDocument {
  const canonical = (snapshot.canonicalName ?? '').trim();

  return {
    title: potionDisplayName(snapshot),
    lines: [
      // 6.4: a base formula the same as the display name says nothing, so it is not printed.
      {
        label: 'Base formula',
        value: canonical === snapshot.displayName.trim() ? '' : canonical,
      },
      { label: 'Form', value: potionForm(snapshot) },
      { label: 'Rarity', value: snapshot.liquid.rarity },
      { label: 'Value', value: potionValueText(snapshot.liquid.value) },
      {
        label: 'Modifications',
        value: snapshot.modifications.map(describeModification).join(', '),
      },
    ].filter((line) => isPrintable(line.value)),
    effect: {
      description: describeEffect(snapshot.effect),
      lines: [
        { label: 'Duration', value: describeDurationShort(snapshot.effect.duration) },
        { label: 'Magnitude', value: String(snapshot.effect.magnitude) },
      ].filter((line) => isPrintable(line.value)),
    },
    sensory: [
      { label: 'Appearance', value: snapshot.sensory.appearance },
      { label: 'Viscosity', value: snapshot.sensory.viscosity },
      { label: 'Flavor', value: snapshot.sensory.flavor },
      { label: 'Scent', value: snapshot.sensory.scent },
    ].filter((line) => isPrintable(line.value)),
    container: {
      name: snapshot.container.name,
      description: snapshot.container.description,
      value: potionValueText(snapshot.container.value),
    },
    description: snapshot.liquid.description.trim(),
  };
}

function labelledList(lines: PotionLine[], bullet: string): string {
  return lines.map((line) => `${bullet}${line.label}: ${line.value}`).join('\n');
}

/** A potion as Markdown, for a referee who keeps their treasure in their own notes. */
export function potionToMarkdown(snapshot: PotionSnapshot): string {
  const document = potionToDocument(snapshot);
  const blocks = [`# ${document.title}`];

  if (document.lines.length > 0) {
    blocks.push(labelledList(document.lines, '- '));
  }
  if (isPrintable(document.description)) {
    blocks.push(document.description);
  }

  const effect = ['## Effect'];
  if (isPrintable(document.effect.description)) {
    effect.push(document.effect.description);
  }
  if (document.effect.lines.length > 0) {
    effect.push(labelledList(document.effect.lines, '- '));
  }
  if (effect.length > 1) {
    blocks.push(effect.join('\n\n'));
  }

  if (document.sensory.length > 0) {
    blocks.push(['## Sensory profile', labelledList(document.sensory, '- ')].join('\n\n'));
  }

  if (isPrintable(document.container.name)) {
    const container = ['## Container', `**${document.container.name}**`];
    if (isPrintable(document.container.description)) {
      container.push(document.container.description);
    }
    container.push(`- Value: ${document.container.value}`);
    blocks.push(container.join('\n\n'));
  }

  return `${blocks.join('\n\n')}\n`;
}

/** The body of the PDF: the same document without the title the PDF draws itself. */
export function potionToText(snapshot: PotionSnapshot): string {
  const document = potionToDocument(snapshot);
  const blocks: string[] = [];

  if (document.lines.length > 0) {
    blocks.push(labelledList(document.lines, ''));
  }
  if (isPrintable(document.description)) {
    blocks.push(document.description);
  }

  const effect = ['Effect'];
  if (isPrintable(document.effect.description)) {
    effect.push(`  ${document.effect.description}`);
  }
  effect.push(...document.effect.lines.map((line) => `  ${line.label}: ${line.value}`));
  if (effect.length > 1) {
    blocks.push(effect.join('\n'));
  }

  if (document.sensory.length > 0) {
    blocks.push(['Sensory profile', labelledList(document.sensory, '  ')].join('\n'));
  }

  if (isPrintable(document.container.name)) {
    const container = [`Container: ${document.container.name}`];
    if (isPrintable(document.container.description)) {
      container.push(`  ${document.container.description}`);
    }
    container.push(`  Value: ${document.container.value}`);
    blocks.push(container.join('\n'));
  }

  return blocks.join('\n\n');
}

/** A filename stem for an exported potion, reduced to something a filesystem takes. */
export function potionFileStem(snapshot: PotionSnapshot): string {
  const stem = potionDisplayName(snapshot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem === '' || stem === 'potion' ? 'potion' : `potion-${stem}`;
}
