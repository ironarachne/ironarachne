import * as iarnd from "./random.js";
import * as Name from "./names/cultures.js";
import * as Religion from "./religion.js";

export function generate() {
  let culture = {};

  culture.name = Name.generate();

  let namePatterns = Name.randomNameRoots();
  let maleNames = Name.generateNameList("male", namePatterns);
  let femaleNames = Name.generateNameList("female", namePatterns);
  let familyNames = Name.generateNameList("family", namePatterns);

  culture.maleNames = maleNames;
  culture.femaleNames = femaleNames;
  culture.familyNames = familyNames;
  culture.religion = Religion.generate();
  culture.taboos = [];
  culture.societyType = randomSocietyType();

  for (let i = 0; i < 2; i++) {
    culture.taboos.push(randomTaboo());
  }

  return culture;
}

function randomSocietyType() {
  return iarnd.item(["agricultural", "pastoral", "nomadic", "foraging-based"]);
}

function randomTaboo() {
  return iarnd.item([
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
    "Eating and drinking must never be done in the company of others.",
  ]);
}
