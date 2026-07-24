import type { SkillDescriptionBlock } from './skill_description_types';

const OPTION_MARKER = '•';

/**
 * Splits a skill description into renderable blocks.
 *
 * Descriptions are newline-separated plain text where lines beginning with a
 * bullet marker are choices. Consecutive choices are grouped into one block so
 * a consumer can render them as a single list.
 */
export function parseSkillDescription(description: string): SkillDescriptionBlock[] {
  return toSignificantLines(description).reduce(appendLine, []);
}

function toSignificantLines(description: string): string[] {
  return description
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function isOptionLine(line: string): boolean {
  return line.startsWith(OPTION_MARKER);
}

function toOptionText(line: string): string {
  return line.slice(OPTION_MARKER.length).trim();
}

function appendLine(blocks: SkillDescriptionBlock[], line: string): SkillDescriptionBlock[] {
  if (!isOptionLine(line)) {
    return [...blocks, { kind: 'text', text: line }];
  }

  return appendOption(blocks, toOptionText(line));
}

function appendOption(blocks: SkillDescriptionBlock[], item: string): SkillDescriptionBlock[] {
  const previous = blocks[blocks.length - 1];

  if (previous?.kind === 'options') {
    return [...blocks.slice(0, -1), { kind: 'options', items: [...previous.items, item] }];
  }

  return [...blocks, { kind: 'options', items: [item] }];
}
