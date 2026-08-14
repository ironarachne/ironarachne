import { describe, expect, it } from 'vitest';

import { parseSkillDescription } from './skill_description';

describe('parseSkillDescription', () => {
  it('returns no blocks for an empty description', () => {
    expect(parseSkillDescription('')).toEqual([]);
  });

  it('returns a single text block for a single-line description', () => {
    expect(parseSkillDescription('You can breathe underwater.')).toEqual([
      { kind: 'text', text: 'You can breathe underwater.' },
    ]);
  });

  it('splits newline-separated prose into one text block per line', () => {
    const result = parseSkillDescription('Roll+Expertise.\nOn a 10+, you succeed.');

    expect(result).toEqual([
      { kind: 'text', text: 'Roll+Expertise.' },
      { kind: 'text', text: 'On a 10+, you succeed.' },
    ]);
  });

  it('groups consecutive bulleted lines into one options block', () => {
    const result = parseSkillDescription(
      'You can assemble the following from scrap:\n • Shoddy melee weapon\n • Makeshift explosive\n • Crude Engineering Kit',
    );

    expect(result).toEqual([
      { kind: 'text', text: 'You can assemble the following from scrap:' },
      {
        kind: 'options',
        items: ['Shoddy melee weapon', 'Makeshift explosive', 'Crude Engineering Kit'],
      },
    ]);
  });

  it('starts a new options block when prose interrupts the bullets', () => {
    const result = parseSkillDescription('Intro\n • first\nInterruption\n • second');

    expect(result).toEqual([
      { kind: 'text', text: 'Intro' },
      { kind: 'options', items: ['first'] },
      { kind: 'text', text: 'Interruption' },
      { kind: 'options', items: ['second'] },
    ]);
  });

  it('handles a description that opens with bullets', () => {
    const result = parseSkillDescription(' • only choice');

    expect(result).toEqual([{ kind: 'options', items: ['only choice'] }]);
  });

  it('strips the stray leading and trailing whitespace found in the skill data', () => {
    const result = parseSkillDescription(
      'When you tamper with machines, Roll+[Stat].\n On a 10+ it is doomed to fail. ',
    );

    expect(result).toEqual([
      { kind: 'text', text: 'When you tamper with machines, Roll+[Stat].' },
      { kind: 'text', text: 'On a 10+ it is doomed to fail.' },
    ]);
  });

  it('drops blank lines', () => {
    const result = parseSkillDescription('First\n\n   \nSecond');

    expect(result).toEqual([
      { kind: 'text', text: 'First' },
      { kind: 'text', text: 'Second' },
    ]);
  });

  it('keeps bullet characters that appear mid-line as prose', () => {
    const result = parseSkillDescription('Choose fast • safe • pleasant.');

    expect(result).toEqual([{ kind: 'text', text: 'Choose fast • safe • pleasant.' }]);
  });

  it('parses a full real-world skill description', () => {
    const result = parseSkillDescription(
      'When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.\n Who or what...\n • is most vulnerable in this situation?\n • is most dangerous in this situation?\n • caused this situation?',
    );

    expect(result).toEqual([
      {
        kind: 'text',
        text: 'When you first witness a situation, you may ask one of the following questions, the GM will answer honestly.',
      },
      { kind: 'text', text: 'Who or what...' },
      {
        kind: 'options',
        items: [
          'is most vulnerable in this situation?',
          'is most dangerous in this situation?',
          'caused this situation?',
        ],
      },
    ]);
  });
});
