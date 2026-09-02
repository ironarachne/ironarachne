import { describe, expect, it } from 'vitest';

import { homePlanetOf, starNationDisplayName } from './star_nation';
import {
  starNationFileStem,
  starNationHomeSystemHeading,
  starNationHomeSystemParagraph,
  starNationTechnologyLabel,
  starNationTechnologyLevel,
  starNationTerritorySentence,
  starNationToDocument,
  starNationToMarkdown,
  starNationToText,
} from './star_nation_presentation';
import { rollStarNation } from './star_nation_roll';
import type { StarNation } from './star_nation_types';

const nation = rollStarNation('presentation-fixture', { planetCount: 3 });

function named(name: string): StarNation {
  return { ...nation, civilization: { ...nation.civilization, name } };
}

describe('starNationDisplayName', () => {
  it('is the nation’s name, or the kind when it has none', () => {
    expect(starNationDisplayName(named('Kingdom of Vesh'))).toBe('Kingdom of Vesh');
    expect(starNationDisplayName(named('  '))).toBe('Star Nation');
  });
});

describe('starNationTerritorySentence', () => {
  it('says nothing for a nation that holds only its home system', () => {
    expect(starNationTerritorySentence({ ...nation, systemsControlled: 1 })).toBe('');
  });

  it('counts the systems and the populated planets otherwise', () => {
    expect(
      starNationTerritorySentence({ ...nation, systemsControlled: 4, populatedPlanets: 9 }),
    ).toBe('The nation controls 4 star systems, with a total of 9 populated planets.');
  });
});

describe('starNationTechnologyLabel', () => {
  it('pairs the level with the table’s name for it', () => {
    const label = starNationTechnologyLabel(nation);

    expect(label).toBe(
      `${nation.civilization.technology_level} (${starNationTechnologyLevel(nation).name})`,
    );
    expect(starNationTechnologyLevel(nation).level).toBe(nation.civilization.technology_level);
  });
});

describe('starNationHomeSystemHeading', () => {
  it('names the system, or falls back when the name has been emptied', () => {
    expect(starNationHomeSystemHeading(nation)).toBe(`The ${nation.homeSystem.name} System`);
    expect(
      starNationHomeSystemHeading({ ...nation, homeSystem: { ...nation.homeSystem, name: '' } }),
    ).toBe('The home system');
  });
});

describe('starNationHomeSystemParagraph', () => {
  it('describes the populated count, the homeworld and its population', () => {
    const paragraph = starNationHomeSystemParagraph({
      ...nation,
      homeSystemPopulatedPlanets: 2,
      homePlanetIndex: 1,
    });

    expect(paragraph).toContain('There are 2 populated planets in this system.');
    expect(paragraph).toContain(`${nation.homeSystem.planets[1].name} is the 2nd planet.`);
    expect(paragraph).toMatch(/It has a population of .+\.$/);
  });

  it('uses the singular for one populated planet', () => {
    expect(starNationHomeSystemParagraph({ ...nation, homeSystemPopulatedPlanets: 1 })).toContain(
      'There is 1 populated planet in this system.',
    );
  });

  /** 6.4: a missing part drops its sentence, not the paragraph. */
  it('drops the population sentence when the planet region is missing', () => {
    const paragraph = starNationHomeSystemParagraph({ ...nation, regionsOfControl: [] });

    expect(paragraph).not.toContain('population');
    expect(paragraph).toContain(homePlanetOf(nation)?.name);
  });

  it('drops the homeworld sentence when its name has been emptied', () => {
    const planets = nation.homeSystem.planets.map((planet, index) =>
      index === nation.homePlanetIndex ? { ...planet, name: '' } : planet,
    );
    const paragraph = starNationHomeSystemParagraph({
      ...nation,
      homeSystem: { ...nation.homeSystem, planets },
    });

    expect(paragraph).not.toContain(' planet.');
    expect(paragraph).toContain('population');
  });
});

describe('starNationToDocument', () => {
  it('carries the description, the figures and the home system', () => {
    const document = starNationToDocument(nation);

    expect(document.title).toBe(nation.civilization.name);
    expect(document.paragraphs[0]).toBe(nation.civilization.description);
    expect(document.figures.map((figure) => figure.label)).toEqual([
      'Government',
      'Economy',
      'Military',
      'Technology',
      'Population',
      'Home planet',
      'Home system population',
    ]);
    expect(document.homeSystem.heading).toBe(`The ${nation.homeSystem.name} System`);
    expect(document.homeSystem.paragraphs).toHaveLength(1);
  });

  /** 6.4 by construction. */
  it('drops an emptied description and a territory of one system', () => {
    const document = starNationToDocument({
      ...nation,
      civilization: { ...nation.civilization, description: '  ' },
      systemsControlled: 1,
    });

    expect(document.paragraphs).toEqual([]);
  });

  it('drops a figure that has nothing to say', () => {
    const document = starNationToDocument({ ...nation, regionsOfControl: [] });

    expect(document.figures.map((figure) => figure.label)).not.toContain('Home system population');
  });
});

describe('starNationToMarkdown', () => {
  it('writes the title, the paragraphs, the figures and the home system', () => {
    const markdown = starNationToMarkdown(named('Kingdom of Vesh'));

    expect(markdown.startsWith('# Kingdom of Vesh\n\n')).toBe(true);
    expect(markdown).toContain('- **Government:** ');
    expect(markdown).toContain(`## The ${nation.homeSystem.name} System`);
    expect(markdown.endsWith('\n')).toBe(true);
  });
});

describe('starNationToText', () => {
  it('leaves the title to the PDF and upper-cases the home system heading', () => {
    const text = starNationToText(named('Kingdom of Vesh'));

    expect(text.startsWith('# ')).toBe(false);
    expect(text).toContain('Government: ');
    expect(text).toContain(`THE ${nation.homeSystem.name.toUpperCase()} SYSTEM`);
  });
});

describe('starNationFileStem', () => {
  it('reduces the name to something a filesystem takes', () => {
    expect(starNationFileStem(named("Holy Empire of K'tharr"))).toBe('holy-empire-of-k-tharr');
    expect(starNationFileStem(named('   '))).toBe('star-nation');
  });
});
