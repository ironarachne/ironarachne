"use strict";

import * as Words from "../words";
import * as RND from "../random";

export class PersonalityTrait {
  name: string;
  opposingTags: string[];
  tags: string[];

  constructor(name: string, opposingTags: string[], tags: string[]) {
    this.name = name;
    this.opposingTags = opposingTags;
    this.tags = tags;
  }
}

export function getTraitsWithOpposingTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].opposingTags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutOpposingTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (!traits[i].opposingTags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutOpposingTags(traits: PersonalityTrait[], tags: string[]) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    let opposed = false;
    for (let j = 0; j < tags.length; j++) {
      if (traits[i].opposingTags.includes(tags[j])) {
        opposed = true;
      }
    }
    if (!opposed) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (traits[i].tags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutTag(traits: PersonalityTrait[], tag: string) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    if (!traits[i].tags.includes(tag)) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getTraitsWithoutTags(traits: PersonalityTrait[], tags: string[]) {
  const result = [];

  for (let i = 0; i < traits.length; i++) {
    let opposed = false;
    for (let j = 0; j < tags.length; j++) {
      if (traits[i].tags.includes(tags[j])) {
        opposed = true;
      }
    }
    if (!opposed) {
      result.push(traits[i]);
    }
  }

  return result;
}

export function getRandomTraits(gender: string, numberOfNegativeTraits: number, numberOfPositiveTraits: number) {
  const positiveTraits = [];
  const negativeTraits = [];

  let allPositiveTraits = getAllPositiveTraits();
  let allNegativeTraits = getAllNegativeTraits();

  let opposingTags: string[] = [];
  let uniqueOpposingTags = new Set([...opposingTags]);

  allPositiveTraits = RND.shuffle(allPositiveTraits);

  for (let i = 0; i < numberOfPositiveTraits; i++) {
    allPositiveTraits = getTraitsWithoutOpposingTags(allPositiveTraits, opposingTags);
    const positiveTrait = allPositiveTraits.pop();

    if (typeof positiveTrait == 'object') {
      positiveTraits.push(positiveTrait);
      opposingTags = [...opposingTags, ...positiveTrait.opposingTags];
      uniqueOpposingTags = new Set([...opposingTags]);
    }
  }

  opposingTags = [];

  for (let i = 0; i < positiveTraits.length; i++) {
    opposingTags = [...opposingTags, ...positiveTraits[i].tags];
  }

  uniqueOpposingTags = new Set([...opposingTags]);

  allNegativeTraits = RND.shuffle(allNegativeTraits);
  for (let i = 0; i < numberOfNegativeTraits; i++) {
    allNegativeTraits = getTraitsWithoutOpposingTags(allNegativeTraits, opposingTags);
    const negativeTrait = allNegativeTraits.pop();
    if (typeof negativeTrait == 'object') {
      negativeTraits.push(negativeTrait);
      opposingTags = [...opposingTags, ...negativeTrait.opposingTags];
      uniqueOpposingTags = new Set([...opposingTags]);
    }
  }

  console.log(uniqueOpposingTags); // TODO: Figure out why I was calculating unique opposing tags

  const positive = [];

  for (let i = 0; i < positiveTraits.length; i++) {
    positive.push(positiveTraits[i].name);
  }

  const negative = [];

  for (let i = 0; i < negativeTraits.length; i++) {
    negative.push(negativeTraits[i].name);
  }

  let description = Words.capitalize(Words.pronoun(gender, "subjective")) + " is " + Words.arrayToPhrase(positive);

  if (negative.length > 0) {
    description += ", but also " + Words.arrayToPhrase(negative);
  }

  return description;
}

export function getAllPositiveTraits() {
  // Some of these are tagged with words related to the six D&D attributes.
  // They are as follows:
  // Strength = physical
  // Constitution = stable
  // Dexterity = flexible
  // Wisdom = wise
  // Charisma = caring
  // Intelligent = clever
  const traits = [
    new PersonalityTrait("active", [], ["physical"]),
    new PersonalityTrait("adaptable", [], ["flexible"]),
    new PersonalityTrait("admirable", [], []),
    new PersonalityTrait("adventurous", ["cowardly"], ["brave"]),
    new PersonalityTrait("agreeable", [], []),
    new PersonalityTrait("alert", [], []),
    new PersonalityTrait("amiable", [], ["caring"]),
    new PersonalityTrait("anticipative", [], ["wise"]),
    new PersonalityTrait("appreciative", [], ["caring"]),
    new PersonalityTrait("articulate", [], ["clever"]),
    new PersonalityTrait("aspiring", [], []),
    new PersonalityTrait("athletic", [], ["physical"]),
    new PersonalityTrait("attractive", [], ["physical"]),
    new PersonalityTrait("balanced", [], ["stable"]),
    new PersonalityTrait("benevolent", [], ["caring"]),
    new PersonalityTrait("brave", ["cowardly"], []),
    new PersonalityTrait("brilliant", [], ["clever"]),
    new PersonalityTrait("calm", [], ["stable"]),
    new PersonalityTrait("capable", [], []),
    new PersonalityTrait("captivating", [], ["caring"]),
    new PersonalityTrait("caring", [], []),
    new PersonalityTrait("charismatic", [], ["caring"]),
    new PersonalityTrait("charming", [], ["caring"]),
    new PersonalityTrait("cheerful", [], []),
    new PersonalityTrait("clean", [], ["physical"]),
    new PersonalityTrait("clear-headed", [], ["clever"]),
    new PersonalityTrait("clever", [], []),
    new PersonalityTrait("colorful", [], []),
    new PersonalityTrait("companionable", [], ["caring"]),
    new PersonalityTrait("compassionate", [], ["caring"]),
    new PersonalityTrait("conciliatory", [], ["peaceful"]),
    new PersonalityTrait("confident", [], ["stable"]),
    new PersonalityTrait("conscientious", [], ["caring"]),
    new PersonalityTrait("considerate", [], ["caring"]),
    new PersonalityTrait("constant", [], ["stable"]),
    new PersonalityTrait("contemplative", [], ["wise"]),
    new PersonalityTrait("cooperative", [], ["caring"]),
    new PersonalityTrait("courageous", ["cowardly"], ["brave"]),
    new PersonalityTrait("courteous", [], ["caring"]),
    new PersonalityTrait("creative", [], ["clever"]),
    new PersonalityTrait("cultured", [], ["wise"]),
    new PersonalityTrait("curious", [], ["flexible"]),
    new PersonalityTrait("daring", [], ["flexible"]),
    new PersonalityTrait("debonair", [], []),
    new PersonalityTrait("decent", [], []),
    new PersonalityTrait("decisive", [], []),
    new PersonalityTrait("dedicated", [], []),
    new PersonalityTrait("deep", [], ["wise"]),
    new PersonalityTrait("dignified", [], ["stable"]),
    new PersonalityTrait("directed", [], []),
    new PersonalityTrait("disciplined", [], ["stable"]),
    new PersonalityTrait("discreet", [], ["flexible"]),
    new PersonalityTrait("dramatic", [], []),
    new PersonalityTrait("dutiful", [], ["stable"]),
    new PersonalityTrait("dynamic", [], ["flexible"]),
    new PersonalityTrait("earnest", ["deceptive"], ["stable"]),
    new PersonalityTrait("ebullient", [], []),
    new PersonalityTrait("educated", [], ["wise"]),
    new PersonalityTrait("efficient", [], ["stable"]),
    new PersonalityTrait("elegant", [], []),
    new PersonalityTrait("eloquent", [], ["clever"]),
    new PersonalityTrait("empathetic", [], ["caring"]),
    new PersonalityTrait("energetic", [], []),
    new PersonalityTrait("enthusiastic", [], []),
    new PersonalityTrait("exciting", [], []),
    new PersonalityTrait("extraordinary", ["dull"], []),
    new PersonalityTrait("fair", [], ["wise"]),
    new PersonalityTrait("faithful", [], ["stable"]),
    new PersonalityTrait("farsighted", [], ["wise"]),
    new PersonalityTrait("firm", [], ["stable"]),
    new PersonalityTrait("flexible", ["dogmatic"], ["mercurial"]),
    new PersonalityTrait("focused", ["confused"], ["stable"]),
    new PersonalityTrait("forceful", [], []),
    new PersonalityTrait("forgiving", [], ["caring"]),
    new PersonalityTrait("forthright", [], ["stable"]),
    new PersonalityTrait("freethinking", [], ["clever"]),
    new PersonalityTrait("friendly", [], ["caring"]),
    new PersonalityTrait("fun-loving", [], ["flexible"]),
    new PersonalityTrait("gallant", [], ["caring"]),
    new PersonalityTrait("generous", [], ["caring"]),
    new PersonalityTrait("gentle", [], ["caring"]),
    new PersonalityTrait("genuine", [], ["stable"]),
    new PersonalityTrait("good-natured", [], ["caring"]),
    new PersonalityTrait("gracious", [], ["caring"]),
    new PersonalityTrait("hardworking", ["lazy"], ["stable"]),
    new PersonalityTrait("healthy", ["sickly", "weak"], ["physical"]),
    new PersonalityTrait("hearty", [], []),
    new PersonalityTrait("helpful", [], ["caring"]),
    new PersonalityTrait("heroic", [], ["caring"]),
    new PersonalityTrait("high-minded", [], ["clever"]),
    new PersonalityTrait("honest", ["dishonest"], ["stable"]),
    new PersonalityTrait("honorable", ["dishonorable"], ["stable"]),
    new PersonalityTrait("humble", ["arrogant"], ["wise"]),
    new PersonalityTrait("humorous", [], []),
    new PersonalityTrait("idealistic", [], []),
    new PersonalityTrait("imaginative", [], ["clever"]),
    new PersonalityTrait("impressive", [], []),
    new PersonalityTrait("incisive", [], []),
    new PersonalityTrait("incorruptible", [], ["stable"]),
    new PersonalityTrait("independent", [], ["flexible"]),
    new PersonalityTrait("individualistic", ["needy"], ["flexible"]),
    new PersonalityTrait("innovative", [], ["clever"]),
    new PersonalityTrait("inoffensive", [], ["stable"]),
    new PersonalityTrait("insightful", [], ["wise"]),
    new PersonalityTrait("insouciant", [], []),
    new PersonalityTrait("intelligent", [], ["clever"]),
    new PersonalityTrait("intuitive", [], ["clever"]),
    new PersonalityTrait("invulnerable", ["cowardly"], ["stable"]),
    new PersonalityTrait("kind", ["mean", "cruel"], ["caring"]),
    new PersonalityTrait("knowledgeable", ["ignorant"], ["clever"]),
    new PersonalityTrait("a leader", ["meek"], ["caring"]),
    new PersonalityTrait("leisurely", [], []),
    new PersonalityTrait("liberal", ["conservative"], []),
    new PersonalityTrait("logical", ["irrational"], ["clever"]),
    new PersonalityTrait("lovable", [], ["caring"]),
    new PersonalityTrait("loyal", [], ["stable"]),
    new PersonalityTrait("lyrical", [], []),
    new PersonalityTrait("magnanimous", [], ["caring"]),
    new PersonalityTrait("many-sided", [], ["flexible"]),
    new PersonalityTrait("masculine", ["feminine"], []),
    new PersonalityTrait("mature", ["immature"], ["wise"]),
    new PersonalityTrait("methodical", [], ["wise"]),
    new PersonalityTrait("meticulous", [], ["stable"]),
    new PersonalityTrait("moderate", [], ["stable"]),
    new PersonalityTrait("modest", [], ["wise"]),
    new PersonalityTrait("multi-leveled", [], ["flexible"]),
    new PersonalityTrait("neat", ["messy"], ["tidy", "stable"]),
    new PersonalityTrait("objective", [], ["wise"]),
    new PersonalityTrait("observant", [], ["wise"]),
    new PersonalityTrait("open", ["alien"], ["caring"]),
    new PersonalityTrait("optimistic", ["pessimistic"], []),
    new PersonalityTrait("orderly", ["chaotic"], ["stable"]),
    new PersonalityTrait("organized", [], ["stable"]),
    new PersonalityTrait("original", [], ["flexible"]),
    new PersonalityTrait("painstaking", [], ["stable"]),
    new PersonalityTrait("passionate", [], ["caring"]),
    new PersonalityTrait("patient", [], ["stable"]),
    new PersonalityTrait("patriotic", [], []),
    new PersonalityTrait("peaceful", ["aggressive", "angry"], []),
    new PersonalityTrait("perceptive", [], ["wise"]),
    new PersonalityTrait("perfectionist", [], []),
    new PersonalityTrait("personable", [], ["caring"]),
    new PersonalityTrait("persuasive", [], ["caring"]),
    new PersonalityTrait("playful", [], ["caring"]),
    new PersonalityTrait("polished", [], ["stable"]),
    new PersonalityTrait("popular", [], ["caring"]),
    new PersonalityTrait("practical", [], ["stable"]),
    new PersonalityTrait("precise", [], []),
    new PersonalityTrait("principled", [], ["stable"]),
    new PersonalityTrait("profound", [], ["wise"]),
    new PersonalityTrait("protean", [], []),
    new PersonalityTrait("protective", [], ["caring"]),
    new PersonalityTrait("providential", [], []),
    new PersonalityTrait("prudent", [], ["wise"]),
    new PersonalityTrait("punctual", [], []),
    new PersonalityTrait("purposeful", [], ["stable"]),
    new PersonalityTrait("rational", ["irrational"], ["wise"]),
    new PersonalityTrait("realistic", [], ["stable"]),
    new PersonalityTrait("reflective", [], ["wise"]),
    new PersonalityTrait("relaxed", [], ["peaceful"]),
    new PersonalityTrait("reliable", [], ["stable"]),
    new PersonalityTrait("resourceful", [], ["clever"]),
    new PersonalityTrait("respectful", [], ["caring"]),
    new PersonalityTrait("responsible", [], ["stable"]),
    new PersonalityTrait("responsive", [], []),
    new PersonalityTrait("reverential", [], []),
    new PersonalityTrait("romantic", [], ["caring"]),
    new PersonalityTrait("rustic", [], []),
    new PersonalityTrait("sage", [], ["wise"]),
    new PersonalityTrait("sane", ["insane", "alien"], ["wise"]),
    new PersonalityTrait("scholarly", [], ["clever"]),
    new PersonalityTrait("scrupulous", [], ["stable"]),
    new PersonalityTrait("secure", [], ["stable"]),
    new PersonalityTrait("selfless", [], ["caring"]),
    new PersonalityTrait("self-critical", [], []),
    new PersonalityTrait("self-defacing", ["arrogant"], ["humble"]),
    new PersonalityTrait("self-denying", [], []),
    new PersonalityTrait("self-reliant", ["needy"], ["stable"]),
    new PersonalityTrait("self-sufficent", ["needy"], ["stable"]),
    new PersonalityTrait("sensitive", ["callous"], ["caring"]),
    new PersonalityTrait("sentimental", [], ["caring"]),
    new PersonalityTrait("seraphic", [], ["aloof"]),
    new PersonalityTrait("serious", [], ["stable"]),
    new PersonalityTrait("sexy", [], ["physical"]),
    new PersonalityTrait("sharing", [], ["caring"]),
    new PersonalityTrait("shrewd", [], ["clever"]),
    new PersonalityTrait("simple", [], []),
    new PersonalityTrait("skillful", [], ["clever"]),
    new PersonalityTrait("sober", [], []),
    new PersonalityTrait("sociable", [], ["caring"]),
    new PersonalityTrait("solid", [], ["stable"]),
    new PersonalityTrait("sophisticated", [], ["clever"]),
    new PersonalityTrait("spontaneous", [], ["flexible"]),
    new PersonalityTrait("sporting", [], ["flexible"]),
    new PersonalityTrait("stable", [], []),
    new PersonalityTrait("steadfast", [], ["stable"]),
    new PersonalityTrait("steady", [], ["stable"]),
    new PersonalityTrait("stoic", [], ["stable"]),
    new PersonalityTrait("strong", [], ["physical"]),
    new PersonalityTrait("studious", [], ["clever"]),
    new PersonalityTrait("suave", [], ["caring"]),
    new PersonalityTrait("subtle", [], ["flexible"]),
    new PersonalityTrait("sweet", [], ["caring"]),
    new PersonalityTrait("sympathetic", [], ["caring"]),
    new PersonalityTrait("systematic", [], ["clever"]),
    new PersonalityTrait("tasteful", [], ["caring"]),
    new PersonalityTrait("teacherly", [], ["clever"]),
    new PersonalityTrait("thorough", [], ["stable"]),
    new PersonalityTrait("tidy", ["messy"], ["stable"]),
    new PersonalityTrait("tolerant", ["intolerant"], ["caring"]),
    new PersonalityTrait("tractable", [], []),
    new PersonalityTrait("trusting", ["paranoid"], ["caring"]),
    new PersonalityTrait("uncomplaining", ["whiny"], ["stable"]),
    new PersonalityTrait("understanding", [], ["wise"]),
    new PersonalityTrait("undogmatic", ["dogmatic"], ["flexible"]),
    new PersonalityTrait("upright", [], ["stable"]),
    new PersonalityTrait("urbane", [], []),
    new PersonalityTrait("venturesome", [], ["flexible"]),
    new PersonalityTrait("vivacious", [], ["flexible"]),
    new PersonalityTrait("warm", ["cold"], ["caring"]),
    new PersonalityTrait("well-bred", ["lowborn"], []),
    new PersonalityTrait("well-read", ["ignorant"], ["wise"]),
    new PersonalityTrait("well-rounded", [], ["flexible"]),
    new PersonalityTrait("winning", [], []),
    new PersonalityTrait("wise", ["ignorant"], []),
    new PersonalityTrait("witty", [], ["clever"]),
    new PersonalityTrait("youthful", [], []),
  ];

  for (let i = 0; i < traits.length; i++) {
    traits[i].tags.push(traits[i].name);
  }

  return traits;
}

export function getAllNegativeTraits() {
  const traits = [
    new PersonalityTrait("abrasive", [], ["angry"]),
    new PersonalityTrait("abrupt", [], ["angry"]),
    new PersonalityTrait("absentminded", [], ["clever"]),
    new PersonalityTrait("aggressive", ["peaceful"], ["angry"]),
    new PersonalityTrait("agonizing", [], []),
    new PersonalityTrait("aimless", [], ["alien"]),
    new PersonalityTrait("aloof", [], []),
    new PersonalityTrait("ambitious", [], ["clever"]),
    new PersonalityTrait("amoral", [], ["alien"]),
    new PersonalityTrait("angry", ["peaceful"], []),
    new PersonalityTrait("anxious", [], []),
    new PersonalityTrait("apathetic", [], ["aloof"]),
    new PersonalityTrait("arbitrary", [], []),
    new PersonalityTrait("argumentative", [], ["angry"]),
    new PersonalityTrait("arrogant", ["humble"], ["stable"]),
    new PersonalityTrait("artful", [], []),
    new PersonalityTrait("artificial", [], []),
    new PersonalityTrait("ascetic", [], ["alien"]),
    new PersonalityTrait("asocial", [], ["alien"]),
    new PersonalityTrait("authoritarian", [], ["controlling", "stable"]),
    new PersonalityTrait("bewildered", [], []),
    new PersonalityTrait("big-thinking", [], ["clever"]),
    new PersonalityTrait("bizarre", [], ["alien"]),
    new PersonalityTrait("bland", [], []),
    new PersonalityTrait("blunt", ["diplomatic"], ["angry"]),
    new PersonalityTrait("boisterous", [], ["flexible"]),
    new PersonalityTrait("boyish", [], []),
    new PersonalityTrait("breezy", [], ["aloof"]),
    new PersonalityTrait("brittle", ["strong"], []),
    new PersonalityTrait("brooding", [], ["wise"]),
    new PersonalityTrait("brutal", [], ["cruel"]),
    new PersonalityTrait("businesslike", [], ["stable"]),
    new PersonalityTrait("busy", [], []),
    new PersonalityTrait("calculating", [], ["clever"]),
    new PersonalityTrait("callous", ["kind"], ["aloof"]),
    new PersonalityTrait("cantankerous", [], ["angry"]),
    new PersonalityTrait("careless", [], ["flexible"]),
    new PersonalityTrait("casual", [], ["flexible"]),
    new PersonalityTrait("cerebral", [], ["clever"]),
    new PersonalityTrait("charmless", ["charming"], ["angry"]),
    new PersonalityTrait("childish", ["mature"], []),
    new PersonalityTrait("chummy", [], ["caring"]),
    new PersonalityTrait("circumspect", [], ["clever"]),
    new PersonalityTrait("clumsy", [], []),
    new PersonalityTrait("coarse", [], []),
    new PersonalityTrait("cold", ["warm"], ["aloof", "alien"]),
    new PersonalityTrait("colorless", [], ["alien"]),
    new PersonalityTrait("competitive", [], []),
    new PersonalityTrait("complacent", ["a leader"], []),
    new PersonalityTrait("complaining", [], []),
    new PersonalityTrait("complex", [], ["alien"]),
    new PersonalityTrait("compulsive", [], ["stable"]),
    new PersonalityTrait("conceited", [], ["stable"]),
    new PersonalityTrait("condemnatory", [], []),
    new PersonalityTrait("confidential", [], ["clever"]),
    new PersonalityTrait("conformist", ["a leader"], ["stable"]),
    new PersonalityTrait("confused", ["confident"], ["flexible"]),
    new PersonalityTrait("conservative", ["liberal"], ["stable"]),
    new PersonalityTrait("contemptible", [], []),
    new PersonalityTrait("contradictory", [], ["flexible"]),
    new PersonalityTrait("conventional", [], ["stable"]),
    new PersonalityTrait("cowardly", ["brave"], []),
    new PersonalityTrait("crass", [], []),
    new PersonalityTrait("crazy", [], ["alien"]),
    new PersonalityTrait("criminal", [], ["flexible"]),
    new PersonalityTrait("crisp", [], []),
    new PersonalityTrait("critical", [], ["wise"]),
    new PersonalityTrait("crude", [], []),
    new PersonalityTrait("cruel", ["kind"], []),
    new PersonalityTrait("cute", [], []),
    new PersonalityTrait("cynical", [], ["wise"]),
    new PersonalityTrait("decadent", [], ["physical"]),
    new PersonalityTrait("deceitful", [], ["flexible"]),
    new PersonalityTrait("deceptive", [], ["clever"]),
    new PersonalityTrait("delicate", [], []),
    new PersonalityTrait("demanding", [], ["stable"]),
    new PersonalityTrait("dependent", [], ["needy"]),
    new PersonalityTrait("desperate", [], []),
    new PersonalityTrait("destructive", [], ["angry", "physical"]),
    new PersonalityTrait("determined", [], ["stable"]),
    new PersonalityTrait("devious", [], ["clever"]),
    new PersonalityTrait("difficult", [], []),
    new PersonalityTrait("disconcerting", [], ["alien"]),
    new PersonalityTrait("discontented", [], []),
    new PersonalityTrait("discouraging", [], []),
    new PersonalityTrait("discourteous", [], []),
    new PersonalityTrait("dishonest", ["honest"], ["flexible"]),
    new PersonalityTrait("disloyal", ["loyal"], ["flexible"]),
    new PersonalityTrait("disobedient", ["obedient"], []),
    new PersonalityTrait("disorderly", ["tidy"], []),
    new PersonalityTrait("disorganized", ["tidy"], []),
    new PersonalityTrait("disputatious", [], []),
    new PersonalityTrait("disrespectful", ["respectful"], []),
    new PersonalityTrait("disruptive", [], ["flexible"]),
    new PersonalityTrait("dissonant", [], []),
    new PersonalityTrait("distractible", [], []),
    new PersonalityTrait("disturbing", [], ["alien"]),
    new PersonalityTrait("dogmatic", ["undogmatic"], ["stable"]),
    new PersonalityTrait("dominating", [], ["stable"]),
    new PersonalityTrait("domineering", [], ["stable"]),
    new PersonalityTrait("dreamy", [], ["alien", "aloof"]),
    new PersonalityTrait("driving", [], ["stable"]),
    new PersonalityTrait("droll", [], []),
    new PersonalityTrait("dry", [], ["stable"]),
    new PersonalityTrait("dull", [], ["stable"]),
    new PersonalityTrait("earthy", [], ["stable"]),
    new PersonalityTrait("easily discouraged", ["persistent", "stubborn"], []),
    new PersonalityTrait("effeminate", ["masculine"], []),
    new PersonalityTrait("egocentric", ["self-defacing"], ["wise"]),
    new PersonalityTrait("emotional", [], ["flexible"]),
    new PersonalityTrait("enigmatic", [], ["alien"]),
    new PersonalityTrait("envious", [], []),
    new PersonalityTrait("erratic", [], ["flexible"]),
    new PersonalityTrait("escapist", [], ["flexible"]),
    new PersonalityTrait("experimental", [], ["clever"]),
    new PersonalityTrait("extravagant", [], ["caring"]),
    new PersonalityTrait("extreme", [], ["angry"]),
    new PersonalityTrait("faithless", [], []),
    new PersonalityTrait("false", [], ["flexible"]),
    new PersonalityTrait("familial", [], ["caring"]),
    new PersonalityTrait("fanatical", [], ["stable"]),
    new PersonalityTrait("fanciful", [], ["caring"]),
    new PersonalityTrait("fatalistic", [], []),
    new PersonalityTrait("fawning", [], ["caring"]),
    new PersonalityTrait("fearful", [], ["cowardly"]),
    new PersonalityTrait("fickle", [], ["flexible"]),
    new PersonalityTrait("fiery", [], ["caring", "angry"]),
    new PersonalityTrait("fixed", [], ["stable"]),
    new PersonalityTrait("flamboyant", [], ["caring"]),
    new PersonalityTrait("folksy", [], ["caring"]),
    new PersonalityTrait("foolish", [], []),
    new PersonalityTrait("forgetful", [], []),
    new PersonalityTrait("formal", [], ["stable"]),
    new PersonalityTrait("fraudulent", [], ["flexible"]),
    new PersonalityTrait("freewheeling", [], ["flexible"]),
    new PersonalityTrait("frightening", [], ["alien"]),
    new PersonalityTrait("frivolous", [], ["flexible"]),
    new PersonalityTrait("frugal", [], ["stable"]),
    new PersonalityTrait("glamorous", [], ["caring"]),
    new PersonalityTrait("gloomy", [], ["brooding"]),
    new PersonalityTrait("graceless", [], []),
    new PersonalityTrait("greedy", [], []),
    new PersonalityTrait("grim", [], ["brooding"]),
    new PersonalityTrait("guileless", [], []),
    new PersonalityTrait("gullible", ["paranoid"], ["caring"]),
    new PersonalityTrait("hateful", [], ["angry"]),
    new PersonalityTrait("haughty", [], ["caring"]),
    new PersonalityTrait("hedonistic", [], ["physical"]),
    new PersonalityTrait("hesitant", [], ["stable"]),
    new PersonalityTrait("hidebound", [], []),
    new PersonalityTrait("high-handed", [], ["stable"]),
    new PersonalityTrait("high-spirited", [], ["flexible"]),
    new PersonalityTrait("hostile", [], ["angry"]),
    new PersonalityTrait("hurried", ["careful"], []),
    new PersonalityTrait("hypnotic", [], []),
    new PersonalityTrait("iconoclastic", [], []),
    new PersonalityTrait("idiosyncratic", [], []),
    new PersonalityTrait("ignorant", ["wise"], []),
    new PersonalityTrait("imitative", [], []),
    new PersonalityTrait("impassive", [], ["aloof"]),
    new PersonalityTrait("impatient", ["patient"], []),
    new PersonalityTrait("impersonal", [], ["aloof", "alien"]),
    new PersonalityTrait("impractical", [], ["flexible"]),
    new PersonalityTrait("impressionable", [], ["caring"]),
    new PersonalityTrait("imprudent", [], []),
    new PersonalityTrait("impulsive", [], ["flexible"]),
    new PersonalityTrait("inconsiderate", [], []),
    new PersonalityTrait("incurious", [], []),
    new PersonalityTrait("indecisive", ["decisive"], []),
    new PersonalityTrait("indulgent", [], ["caring"]),
    new PersonalityTrait("inert", [], ["stable"]),
    new PersonalityTrait("inhibited", [], ["stable"]),
    new PersonalityTrait("insecure", [], []),
    new PersonalityTrait("insensitive", [], ["callous"]),
    new PersonalityTrait("insincere", [], ["deceptive", "flexible"]),
    new PersonalityTrait("insulting", [], ["angry"]),
    new PersonalityTrait("intense", [], ["caring"]),
    new PersonalityTrait("intolerant", [], ["angry"]),
    new PersonalityTrait("invisible", [], ["stable"]),
    new PersonalityTrait("irascible", [], []),
    new PersonalityTrait("irrational", [], ["mercurial"]),
    new PersonalityTrait("irreligious", [], ["stable"]),
    new PersonalityTrait("irresponsible", [], ["flexible"]),
    new PersonalityTrait("irreverent", [], ["flexible"]),
    new PersonalityTrait("irritable", [], ["angry"]),
    new PersonalityTrait("lazy", [], []),
    new PersonalityTrait("malicious", [], ["cruel"]),
    new PersonalityTrait("mannerless", [], []),
    new PersonalityTrait("maternal", [], ["caring"]),
    new PersonalityTrait("mechanical", [], []),
    new PersonalityTrait("meddlesome", [], ["clever"]),
    new PersonalityTrait("melancholic", [], ["brooding"]),
    new PersonalityTrait("mellow", [], ["stable"]),
    new PersonalityTrait("mercurial", ["stable"], []),
    new PersonalityTrait("messy", ["tidy"], []),
    new PersonalityTrait("miserable", [], ["brooding"]),
    new PersonalityTrait("miserly", [], ["stable"]),
    new PersonalityTrait("misguided", [], []),
    new PersonalityTrait("mistaken", [], []),
    new PersonalityTrait("money-minded", [], ["stable"]),
    new PersonalityTrait("moody", [], ["mercurial", "brooding"]),
    new PersonalityTrait("moralistic", [], []),
    new PersonalityTrait("morbid", [], ["brooding"]),
    new PersonalityTrait("muddle-headed", [], []),
    new PersonalityTrait("naive", ["wise"], []),
    new PersonalityTrait("narcissistic", [], ["stable"]),
    new PersonalityTrait("narrow", [], []),
    new PersonalityTrait("narrow-minded", [], []),
    new PersonalityTrait("negative", [], []),
    new PersonalityTrait("neglectful", [], []),
    new PersonalityTrait("neurotic", [], []),
    new PersonalityTrait("neutral", [], []),
    new PersonalityTrait("nihilistic", [], ["alien"]),
    new PersonalityTrait("noncommittal", [], []),
    new PersonalityTrait("noncompetitive", [], []),
    new PersonalityTrait("obedient", ["disobedient", "a leader"], ["stable"]),
    new PersonalityTrait("obnoxious", [], []),
    new PersonalityTrait("obsessive", [], ["stable"]),
    new PersonalityTrait("obvious", [], ["stable"]),
    new PersonalityTrait("odd", [], ["alien"]),
    new PersonalityTrait("offhand", [], []),
    new PersonalityTrait("old-fashioned", [], ["stable"]),
    new PersonalityTrait("one-dimensional", [], ["stable"]),
    new PersonalityTrait("one-sided", [], ["stable"]),
    new PersonalityTrait("opinionated", [], ["stable"]),
    new PersonalityTrait("opportunistic", [], ["flexible"]),
    new PersonalityTrait("oppressive", [], ["stable"]),
    new PersonalityTrait("ordinary", [], ["stable"]),
    new PersonalityTrait("outrageous", [], ["flexible"]),
    new PersonalityTrait("outspoken", [], ["caring"]),
    new PersonalityTrait("paranoid", ["trusting"], []),
    new PersonalityTrait("passive", ["aggressive"], ["stable"]),
    new PersonalityTrait("paternalistic", [], []),
    new PersonalityTrait("pedantic", [], ["clever"]),
    new PersonalityTrait("perverse", [], []),
    new PersonalityTrait("petty", [], []),
    new PersonalityTrait("placid", [], []),
    new PersonalityTrait("plodding", [], []),
    new PersonalityTrait("political", [], ["clever"]),
    new PersonalityTrait("pompous", [], []),
    new PersonalityTrait("possessive", [], []),
    new PersonalityTrait("power-hungry", [], []),
    new PersonalityTrait("predatory", [], []),
    new PersonalityTrait("predictable", [], ["stable"]),
    new PersonalityTrait("prejudiced", [], ["angry"]),
    new PersonalityTrait("preoccupied", [], ["aloof"]),
    new PersonalityTrait("presumptuous", [], []),
    new PersonalityTrait("pretentious", [], []),
    new PersonalityTrait("prim", [], []),
    new PersonalityTrait("private", [], ["aloof"]),
    new PersonalityTrait("procrastinating", [], []),
    new PersonalityTrait("progressive", [], ["liberal", "clever"]),
    new PersonalityTrait("proud", [], ["stable"]),
    new PersonalityTrait("provocative", [], ["clever"]),
    new PersonalityTrait("puritanical", [], ["stable"]),
    new PersonalityTrait("questioning", [], ["wise"]),
    new PersonalityTrait("quiet", [], ["aloof"]),
    new PersonalityTrait("quirky", [], ["flexible"]),
    new PersonalityTrait("reactionary", [], ["angry"]),
    new PersonalityTrait("reactive", [], ["angry"]),
    new PersonalityTrait("regimental", [], ["stable"]),
    new PersonalityTrait("regretful", [], []),
    new PersonalityTrait("religious", [], ["stable"]),
    new PersonalityTrait("repentant", [], []),
    new PersonalityTrait("repressed", [], ["aloof"]),
    new PersonalityTrait("resentful", [], ["angry"]),
    new PersonalityTrait("reserved", [], ["aloof"]),
    new PersonalityTrait("restrained", [], ["aloof"]),
    new PersonalityTrait("ridiculous", [], []),
    new PersonalityTrait("rigid", [], ["stable"]),
    new PersonalityTrait("ritualistic", [], ["stable"]),
    new PersonalityTrait("ruined", [], ["angry"]),
    new PersonalityTrait("sadistic", [], []),
    new PersonalityTrait("sanctimonious", [], ["stable"]),
    new PersonalityTrait("sarcastic", [], ["clever"]),
    new PersonalityTrait("scheming", [], ["clever"]),
    new PersonalityTrait("scornful", [], []),
    new PersonalityTrait("secretive", [], ["flexible"]),
    new PersonalityTrait("sedentary", [], ["stable"]),
    new PersonalityTrait("self-conscious", ["confident"], []),
    new PersonalityTrait("self-indulgent", [], []),
    new PersonalityTrait("selfish", ["selfless"], []),
    new PersonalityTrait("sensual", [], ["caring", "physical"]),
    new PersonalityTrait("shallow", [], []),
    new PersonalityTrait("short-sighted", [], []),
    new PersonalityTrait("skeptical", ["gullible"], ["wise"]),
    new PersonalityTrait("sloppy", [], ["flexible"]),
    new PersonalityTrait("slow", [], ["stable"]),
    new PersonalityTrait("sly", [], ["clever"]),
    new PersonalityTrait("small-thinking", [], []),
    new PersonalityTrait("smooth", [], ["caring"]),
    new PersonalityTrait("soft", [], ["caring"]),
    new PersonalityTrait("soft-headed", [], ["caring"]),
    new PersonalityTrait("solemn", [], ["brooding"]),
    new PersonalityTrait("solitary", [], ["aloof"]),
    new PersonalityTrait("sordid", [], []),
    new PersonalityTrait("steely", [], ["stable"]),
    new PersonalityTrait("stern", [], ["stable"]),
    new PersonalityTrait("stiff", [], ["stable"]),
    new PersonalityTrait("strict", [], ["stable"]),
    new PersonalityTrait("stubborn", [], ["stable"]),
    new PersonalityTrait("stupid", [], []),
    new PersonalityTrait("stylish", [], ["physical"]),
    new PersonalityTrait("subjective", [], ["flexible"]),
    new PersonalityTrait("submissive", ["a leader"], []),
    new PersonalityTrait("superficial", ["deep"], ["mercurial"]),
    new PersonalityTrait("superstitious", [], []),
    new PersonalityTrait("surprising", [], ["clever"]),
    new PersonalityTrait("suspicious", [], ["clever"]),
    new PersonalityTrait("tactless", [], []),
    new PersonalityTrait("tasteless", [], []),
    new PersonalityTrait("tense", [], []),
    new PersonalityTrait("thievish", [], ["flexible"]),
    new PersonalityTrait("thoughtless", [], []),
    new PersonalityTrait("timid", ["brave"], []),
    new PersonalityTrait("tough", [], ["stable"]),
    new PersonalityTrait("transparent", [], []),
    new PersonalityTrait("treacherous", [], ["flexible"]),
    new PersonalityTrait("trendy", [], ["physical"]),
    new PersonalityTrait("troublesome", [], []),
    new PersonalityTrait("unambitious", [], ["stable"]),
    new PersonalityTrait("unappreciative", [], []),
    new PersonalityTrait("uncaring", [], ["stable"]),
    new PersonalityTrait("unceremonious", [], []),
    new PersonalityTrait("unchanging", [], ["stable"]),
    new PersonalityTrait("uncharitable", [], []),
    new PersonalityTrait("unconvincing", [], []),
    new PersonalityTrait("uncooperative", [], []),
    new PersonalityTrait("uncreative", [], []),
    new PersonalityTrait("uncritical", [], []),
    new PersonalityTrait("unctuous", [], []),
    new PersonalityTrait("undemanding", [], ["stable"]),
    new PersonalityTrait("undisciplined", [], ["flexible"]),
    new PersonalityTrait("unfathomable", [], ["alien"]),
    new PersonalityTrait("unfriendly", [], ["angry"]),
    new PersonalityTrait("ungrateful", [], []),
    new PersonalityTrait("unhealthy", [], []),
    new PersonalityTrait("unhurried", [], ["stable"]),
    new PersonalityTrait("unimaginative", [], ["stable"]),
    new PersonalityTrait("unimpressive", [], []),
    new PersonalityTrait("uninhibited", [], ["flexible"]),
    new PersonalityTrait("unlovable", [], []),
    new PersonalityTrait("unpatriotic", [], []),
    new PersonalityTrait("unpolished", [], []),
    new PersonalityTrait("unpredictable", [], ["flexible"]),
    new PersonalityTrait("unprincipled", [], ["flexible"]),
    new PersonalityTrait("unrealistic", [], []),
    new PersonalityTrait("unreflective", [], []),
    new PersonalityTrait("unreliable", [], ["flexible"]),
    new PersonalityTrait("unrestrained", [], ["flexible"]),
    new PersonalityTrait("unsentimental", [], []),
    new PersonalityTrait("unstable", [], ["flexible"]),
    new PersonalityTrait("vacuous", [], []),
    new PersonalityTrait("vague", [], ["aloof"]),
    new PersonalityTrait("venomous", [], ["angry"]),
    new PersonalityTrait("vindictive", [], ["angry"]),
    new PersonalityTrait("vulnerable", [], []),
    new PersonalityTrait("weak", ["strong"], []),
    new PersonalityTrait("whimsical", [], ["mercurial"]),
    new PersonalityTrait("willful", [], []),
  ];

  for (let i = 0; i < traits.length; i++) {
    traits[i].tags.push(traits[i].name);
  }

  return traits;
}
