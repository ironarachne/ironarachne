"use strict";

import CharacterGenerator from "../../characters/generator";
import NameGenerator from "../../names/generator";
import Kingdom from "./kingdom";
import HeraldryGenerator from "../../heraldry/generator";
import * as Words from "../../words";
import * as RND from "../../random";
import * as PremadeConfigs from "../../characters/premadeconfigs";
import NationGenerator from "../generator";
import Subdivision from "../subdivision";
import Barony from "./subdivisions/barony";
import Principality from "./subdivisions/principality";
import County from "./subdivisions/county";
import Duchy from "./subdivisions/duchy";

import random from "random";
import Title from "../../characters/title";
import Earldom from "./subdivisions/earldom";

export default class KingdomGenerator implements NationGenerator {
  generate(nameGenerator: NameGenerator): Kingdom {
    let name = "the Kingdom of " + nameGenerator.generate(1);

    let charGenConfig = PremadeConfigs.getFantasy();

    const charGen = new CharacterGenerator(charGenConfig);

    let monarch = charGen.generate();
    monarch.titles.push(new Title("Queen", "King", "Queen", "King", true, name, 6));

    let kingdom = new Kingdom(name, monarch);
    kingdom.description = this.describe(kingdom);
    kingdom.subdivisions = this.generateSubdivisions(nameGenerator, nameGenerator);

    let herGen = new HeraldryGenerator();
    kingdom.heraldry = herGen.generate(600, 660);

    return kingdom;
  }

  describe(kingdom: Kingdom): string {
    let description = Words.capitalize(kingdom.name) + ` is ruled by ${kingdom.monarch.getPrimaryTitle()} ${kingdom.monarch.firstName} ${kingdom.monarch.lastName}`;

    return description;
  }

  generateSubdivisions(territoryNameGenerator: NameGenerator, characterNameGenerator: NameGenerator): Subdivision[] {
    let subdivisions = [];
    const numberOfSubdivisions = 3;

    for (let i=0;i<numberOfSubdivisions; i++) {
      let name = territoryNameGenerator.generate(1)[0];
      let subdivision = RND.item([
        new Barony(name),
        new County(name),
        new Duchy(name),
        new Earldom(name),
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
