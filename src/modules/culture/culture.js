"use strict";

import * as RND from "../random.js";
import * as Name from "../names/cultures.js";
import * as Religion from "../religion.js";
import * as Music from "../music/style.js";
import * as Organization from "./organization.js";

export class Culture {
  constructor(name, organization, maleNames, femaleNames, familyNames, religion, taboos, greeting, eatingTrait, designTrait, musicStyle) {
    this.name = name;
    this.organization = organization;
    this.maleNames = maleNames;
    this.femaleNames = femaleNames;
    this.familyNames = familyNames;
    this.religion = religion;
    this.taboos = taboos;
    this.greeting = greeting;
    this.eatingTrait = eatingTrait;
    this.designTrait = designTrait;
    this.musicStyle = musicStyle;
  }
}

export function generate() {
  let namePatterns = Name.randomNameRoots();
  let maleNames = Name.generateNameList("male", namePatterns);
  let femaleNames = Name.generateNameList("female", namePatterns);
  let familyNames = Name.generateNameList("family", namePatterns);

  return new Culture(
    Name.generate(),
    Organization.generate(),
    maleNames,
    femaleNames,
    familyNames,
    Religion.generate(),
    randomTaboos(),
    randomGreeting(),
    randomEatingTrait(),
    randomDesignTrait(),
    Music.generate(),
  );
}

function randomDesignTrait() {
  return RND.item([
    "Bright, vibrant colors are favored in designs.",
    "Circles, loops, and other round shapes are represented often in design work.",
    "Triangles are common in design patterns.",
    "Colors are usually muted, with black being seen as respectful.",
    "Squares and right angles are seen as symbols of strength and are heavily represented.",
    "Intricate geometric designs are everywhere.",
    "Stylized images of animals are common in design.",
    "Stylized images of heroes and religious figures feature prominently.",
  ]);
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
  let possible = [
    "The baring of skin other than the face is forbidden in public.",
    "The eating of animals is strictly forbidden.",
    "A gift of red fruit is considered a death threat, as red fruit is commonly seen as poisonous.",
    "Wearing bright colors during a period of mourning is considered an insult.",
    "Speaking during religious practices is forbidden.",
    "Dancing is forbidden in public.",
    "Speaking of sex in public is forbidden.",
    "Refusing a gift is considered a grave insult.",
    "White flowers are associated with death and are never given as gifts.",
    "Eating plants is considered a sign of weakness.",
    "Not belching after a meal is very impolite.",
    "Talking about death is considered very bad luck.",
    "Men and women must be separate at all times, except when married.",
    "Asking someone about their income is extremely bad manners.",
    "Drinking alcohol alone is considered a sign of madness.",
    "Pointing at the moon is considered extremely bad luck.",
    "Men and women are forbidden from touching each other unless they're married.",
    "Joking about religion is a capital offence.",
    "If you strike your parents, you will die within seven days.",
    "Sitting under a tree is considered very bad luck.",
    "Prostitution is forbidden.",
    "Ingesting hallucinagenic substances is forbidden.",
    "Intermarrying with other cultures is forbidden.",
    "Intermarrying with other races is forbidden.",
    "Giving sharp objects as gifts is taboo, as they symbolize ending a relationship.",
    "Uttering the name given at birth will result in death.",
    "Saying the names of the dead is forbidden.",
  ];

  let taboos = [];

  for (let i = 0; i < 2; i++) {
    let taboo = RND.item(possible);
    if (!taboos.includes(taboo)) {
      taboos.push(taboo);
    } else {
      i--;
    }
  }

  return taboos;
}
