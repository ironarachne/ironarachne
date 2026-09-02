import { describe, expect, it } from 'vitest';

import { removeSystemBody, setStarSystemText } from './star_system_editing';
import {
  starSystemDisplayName,
  starSystemFileStem,
  starSystemLineToString,
  starSystemToDocument,
  starSystemToMarkdown,
  starSystemToText,
} from './star_system_presentation';
import { rollStarSystemSnapshot } from './star_system_roll';

const snapshot = rollStarSystemSnapshot('presentation-seed', { planetCount: 3 });

describe('arranging a star system for reading', () => {
  const document = starSystemToDocument(snapshot);

  it('is headed by the system and opens with its description', () => {
    expect(document.title).toEqual(`The ${snapshot.name} System`);
    expect(document.paragraphs).toEqual([snapshot.description]);
  });

  it('gives every star and every planet a section, stars first', () => {
    expect(document.sections).toHaveLength(snapshot.stars.length + snapshot.planets.length);
    expect(document.sections[0].heading).toEqual(snapshot.stars[0].name);
    expect(document.sections[snapshot.stars.length].heading).toEqual(snapshot.planets[0].name);
  });

  it('compares a star against the Sun and a planet against Earth', () => {
    const star = document.sections[0];
    expect(star.lines.find((line) => line.label === 'Radius')?.value).toContain('of the Sun');
    const planet = document.sections[snapshot.stars.length];
    expect(planet.lines.find((line) => line.label === 'Gravity')?.value).toContain('Earth');
  });

  it('prints a star luminosity, which a star has and a planet does not', () => {
    expect(document.sections[0].lines.some((line) => line.label === 'Luminosity')).toBe(true);
  });
});

describe('dropping what is meaningless (6.4)', () => {
  it('never prints a planet luminosity, because a planet has none', () => {
    const planet = starSystemToDocument(snapshot).sections[snapshot.stars.length];
    expect(planet.lines.some((line) => line.label === 'Luminosity')).toBe(false);
  });

  it('never prints a star surface pressure or albedo, which mean nothing for a star', () => {
    const star = starSystemToDocument(snapshot).sections[0];
    expect(star.lines.some((line) => line.label === 'Surface pressure')).toBe(false);
    expect(star.lines.some((line) => line.label === 'Albedo')).toBe(false);
  });

  it('drops the planet sections once the last planet is removed', () => {
    let stripped = snapshot;
    for (let index = snapshot.planets.length - 1; index >= 0; index--) {
      stripped = removeSystemBody(stripped, 'planets', index);
    }
    expect(starSystemToDocument(stripped).sections).toHaveLength(snapshot.stars.length);
  });

  it('prints no blank paragraph for a description that has been emptied', () => {
    expect(
      starSystemToDocument(setStarSystemText(snapshot, 'description', '  ')).paragraphs,
    ).toEqual([]);
  });

  it('names a body that has been left nameless', () => {
    const nameless = { ...snapshot, stars: [{ ...snapshot.stars[0], name: '  ' }] };
    expect(starSystemToDocument(nameless).sections[0].heading).toEqual('Star 1');
  });
});

describe('writing a line', () => {
  it('joins a label to its value, and leaves a bare sentence alone', () => {
    expect(starSystemLineToString({ label: 'Mass', value: '5' })).toEqual('Mass: 5');
    expect(starSystemLineToString({ value: 'A dim star.' })).toEqual('A dim star.');
  });
});

describe('exporting a star system (6.3)', () => {
  it('writes Markdown a referee can drop into their notes', () => {
    const markdown = starSystemToMarkdown(snapshot);
    expect(markdown).toContain(`# The ${snapshot.name} System`);
    expect(markdown).toContain(`## ${snapshot.stars[0].name}`);
    expect(markdown.endsWith('\n')).toBe(true);
  });

  it('writes the same document as plain text, without repeating the title', () => {
    const text = starSystemToText(snapshot);
    expect(text).toContain(snapshot.stars[0].name.toUpperCase());
    expect(text.startsWith('The ')).toBe(false);
  });

  it('never leaves a blank line where a part had nothing to say', () => {
    const bare = setStarSystemText(snapshot, 'description', '');
    expect(starSystemToMarkdown(bare)).not.toContain('\n\n\n');
    expect(starSystemToText(bare)).not.toContain('\n\n\n');
  });

  it('carries an edit straight into the export', () => {
    expect(starSystemToMarkdown(setStarSystemText(snapshot, 'name', 'Tannhauser'))).toContain(
      '# The Tannhauser System',
    );
  });
});

describe('naming a system for a heading and a file', () => {
  it('reads as the page heads it', () => {
    expect(starSystemDisplayName({ name: 'Kepler' })).toEqual('The Kepler System');
    expect(starSystemFileStem({ name: 'Kepler' })).toEqual('star-system-kepler');
  });

  it('falls back to the kind for a system with no name', () => {
    expect(starSystemDisplayName({ name: '  ' })).toEqual('Star System');
    expect(starSystemFileStem({ name: '' })).toEqual('star-system');
  });

  it('reduces punctuation a filesystem would not take', () => {
    expect(starSystemFileStem({ name: '!!Kepler-442!!' })).toEqual('star-system-kepler-442');
  });
});
