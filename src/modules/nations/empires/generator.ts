'use strict';

import CharacterGenerator from '../../characters/generator';
import NameGenerator from '../../names/generator';
import Empire from './empire';
import HeraldryGenerator from '../../heraldry/generator';
import * as Words from '../../words';
import * as RND from '../../random';
import * as PremadeConfigs from '../../characters/premadeconfigs';
import NationGenerator from '../generator';
import Subdivision from '../subdivision';
import Barony from '../kingdoms/subdivisions/barony';
import Principality from '../kingdoms/subdivisions/principality';
import County from '../kingdoms/subdivisions/county';
import Duchy from '../kingdoms/subdivisions/duchy';
import GrandDuchy from './subdivisions/grandduchy';

import random from 'random';
import Title from '../../characters/title';
import Earldom from '../kingdoms/subdivisions/earldom';

export default class EmpireGenerator implements NationGenerator {
  generate(nameGenerator: NameGenerator): Empire {
    let qualifier = RND.item(['', RND.item(['Holy ', 'Divine ']), 'Grand ']);
    let name = `the ${qualifier}Empire of ` + nameGenerator.generate(1);

    let charGenConfig = PremadeConfigs.getFantasy();

    const charGen = new CharacterGenerator(charGenConfig);

    let emperor = charGen.generate();
    emperor.titles.push(new Title('Empress', 'Emperor', 'Empress', 'Emperor', true, name, 8));

    let empire = new Empire(name, emperor);
    empire.description = this.describe(empire);
    empire.subdivisions = this.generateSubdivisions(nameGenerator, nameGenerator);
    let herGen = new HeraldryGenerator();
    empire.heraldry = herGen.generate(600, 660);

    return empire;
  }

  describe(Empire: Empire): string {
    let description =
      Words.capitalize(Empire.name) +
      ` is ruled by ${Empire.emperor.getPrimaryTitle()} ${Empire.emperor.firstName} ${
        Empire.emperor.lastName
      }`;

    return description;
  }

  generateSubdivisions(
    territoryNameGenerator: NameGenerator,
    characterNameGenerator: NameGenerator,
  ): Subdivision[] {
    let subdivisions = [];
    const numberOfSubdivisions = 3;

    for (let i = 0; i < numberOfSubdivisions; i++) {
      let name = territoryNameGenerator.generate(1)[0];
      let subdivision = RND.item([
        new Barony(name),
        new County(name),
        new Duchy(name),
        new Earldom(name),
        new GrandDuchy(name),
        new Principality(name),
      ]);

      let charGenConfig = PremadeConfigs.getFantasy();
      charGenConfig.ageCategories = ['adult'];

      const charGen = new CharacterGenerator(charGenConfig);

      let authority = charGen.generate();
      authority.titles.push(subdivision.title);
      let herGen = new HeraldryGenerator();
      authority.heraldry = herGen.generate(600, 660);

      let adoptNameChance = random.int(0, 100);

      if (adoptNameChance > 70) {
        authority.lastName = name;
      }

      subdivision.authority = authority;

      subdivisions.push(subdivision);
    }

    return subdivisions;
  }
}
