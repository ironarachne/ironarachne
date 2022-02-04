"use strict";

import CultureGeneratorConfig from "./generatorconfig";

import * as Music from "../music/generator";
import * as Organization from "./organization";
import * as RND from "../random";
import ReligionGeneratorConfig from "../religion/generatorconfig";
import ReligionGenerator from "../religion/generator";
import Culture from "./culture";
import random from "random";

export default class CultureGenerator {
  config: CultureGeneratorConfig;

  constructor(config: CultureGeneratorConfig) {
    this.config = config;
  }

  generate(): Culture {
    const countryNames = this.config.generatorSet.country.generate(10);
    const maleNames = this.config.generatorSet.male.generate(10);
    const femaleNames = this.config.generatorSet.female.generate(10);
    const familyNames = this.config.generatorSet.family.generate(10);
    const townNames = this.config.generatorSet.town.generate(10);

    let relGenConfig = new ReligionGeneratorConfig();
    relGenConfig.nameGenerator = this.config.generatorSet.family;
    relGenConfig.femaleNameGenerator = this.config.generatorSet.female;
    relGenConfig.maleNameGenerator = this.config.generatorSet.male;
    let relGen = new ReligionGenerator(relGenConfig);

    let cultureName = this.config.generatorSet.culture.generate(1)[0];

    let musicStyle = Music.generate();
    musicStyle.description = musicStyle.description.replace("This style of", cultureName);

    let culture = new Culture(
      cultureName,
      Organization.generate(),
      relGen.generate(),
      randomTaboos(),
      randomGreeting(),
      randomEatingTrait(),
      randomDesignTrait(),
      musicStyle,
    );
    culture.countryNames = countryNames;
    culture.familyNames = familyNames;
    culture.femaleNames = femaleNames;
    culture.maleNames = maleNames;
    culture.townNames = townNames;

    culture.generatorSet = this.config.generatorSet;

    return culture;
  }
}

function randomDesignTrait() {
  let firstPart = RND.item([
    "Bright, vibrant colors",
    "Round shapes like circles, loops, and spirals",
    "Triangles",
    "Geometric shapes",
    "Squares and right angles",
    "Intricate geometric patterns",
    "Stylized images of animals",
    "Stylized images of heroes",
    "Stylized images of heroes and religious figures",
    "Images of weather events",
    "Images of important historical events",
    "Images of food",
    "Representations of family events",
  ]);

  let secondPart = RND.item([
    "are favored in designs.",
    "are represented often in design work.",
    "are common in designs.",
    "are popular.",
    "are popular in designs.",
    "are used frequently in designs.",
    "are seen in clothing and decoration.",
  ]);

  return `${firstPart} ${secondPart}`;
}

function randomEatingTrait() {
  return RND.item([
    "Eating in large, multi-family or neighborhood groups is common. Strangers are welcome at these communal meals.",
    "Meals are served in large common vessels and each person is expected to serve themselves.",
    "Most meals are accompanied by a wide variety of small side dishes.",
    "A common custom to welcome a new person to a community is to serve them a special dish at a meal in their honor.",
    "Food is considered the great equalizer, and at communal feasts, social status is ignored.",
  ]);
}

function randomGreeting() {
  return RND.item([
    "Bowing is customary. The person of lower status bows lower, though both bow.",
    "Friends or family clasp hands in greeting. In formal situations, shaking hands is expected.",
    "Formal situations require the lesser person to kneel. If the status difference is slight, it is only kneeling on one knee. If the status difference is great, the lesser person must prostrate themselves. In informal situations, simple nodding the head is acceptable.",
    "In casual situations like with friends, waving is a common greeting. Formal situations require slight bowing and recitation of a ritual greeting.",
  ]);
}

function randomTaboos() {

  let items = [
    "Baring skin other than the face in public",
    "Eating animals",
    "Eating human flesh",
    "A gift of red fruit",
    "Dancing in public",
    "Discussing sex in public",
    "Playing music in public",
    "Ingesting mind-altering substances",
    "Drinking alcohol",
    "Joking about religion",
    "Speaking ill of authority figures",
    "Speaking during religious practices",
    "Wearing bright colors during a period of mourning",
    "Talking about death",
    "Mentioning the dead",
    "Prostitution",
    "Intermarrying with other cultures",
    "Intermarrying with other races",
    "Eating plants",
    "Socializing with the other sex",
    "Questioning figures of authority",
    "Drinking alcohol alone",
  ];

  let contexts = [
    "is forbidden.",
    "is strictly forbidden.",
    "is considered bad manners.",
    "is considered very bad luck.",
    "is highly offensive.",
    "is very impolite.",
    "is considered a sign of weakness.",
    "is considered a sign of madness.",
  ];

  let possible = [];

  for (let i=0;i<items.length;i++) {
    possible.push(items[i] + " " + RND.item(contexts));
  }

  let taboos: string[] = [];
  possible = RND.shuffle(possible);

  const numberOfTaboos = random.int(2, 5);

  for (let i = 0; i < 4; i++) {
    taboos.push(possible.pop());
  }

  return taboos;
}
