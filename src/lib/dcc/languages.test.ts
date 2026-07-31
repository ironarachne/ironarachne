import { expect, describe, it } from 'vitest';
import { getDwarf, getElf, getHalfling, getHuman } from './languages';

const LANGUAGE_SETS = [
  ['getDwarf', getDwarf],
  ['getElf', getElf],
  ['getHalfling', getHalfling],
  ['getHuman', getHuman],
] as const;

describe.each(LANGUAGE_SETS)('%s', (_name, getLanguages) => {
  it('returns a non-empty list', () => {
    expect(getLanguages().length).toBeGreaterThan(0);
  });

  it('gives every language a name and a positive commonality', () => {
    for (const language of getLanguages()) {
      expect(language.name).toBeTruthy();
      expect(language.commonality).toBeGreaterThan(0);
    }
  });

  it('lists each language once', () => {
    const names = getLanguages().map((language) => language.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('never offers Common, which every character already knows', () => {
    expect(getLanguages().map((language) => language.name)).not.toContain('Common');
  });

  it('returns a fresh list each call, since the generator pushes an alignment onto it', () => {
    const first = getLanguages();
    first.push({ name: 'Mutated', commonality: 99 });

    expect(getLanguages().map((language) => language.name)).not.toContain('Mutated');
  });
});

describe('the language sets', () => {
  it('gives each demihuman set its own racial flavour', () => {
    expect(getDwarf().map((language) => language.name)).toContain('Elf');
    expect(getElf().map((language) => language.name)).toContain('Dwarf');
    expect(getHalfling().map((language) => language.name)).toContain('Gnome');
  });

  it('never offers a set its own language', () => {
    expect(getDwarf().map((language) => language.name)).not.toContain('Dwarf');
    expect(getElf().map((language) => language.name)).not.toContain('Elf');
    expect(getHalfling().map((language) => language.name)).not.toContain('Halfling');
  });

  it('offers the alignment tongues only to elves, who are the ones with them', () => {
    const elfNames = getElf().map((language) => language.name);

    expect(elfNames).toEqual(expect.arrayContaining(['Chaos', 'Law', 'Neutrality']));
    for (const getLanguages of [getDwarf, getHalfling, getHuman]) {
      expect(getLanguages().map((language) => language.name)).not.toContain('Chaos');
    }
  });
});
