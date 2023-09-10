import { c as create_ssr_component, g as getContext, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import * as RND from '@ironarachne/rng';
import * as MUN from '@ironarachne/made-up-names';
import { GeneratorSet } from '@ironarachne/made-up-names';
import 'seedrandom';
import './sentry-release-injection-file-e75cc0ec.js';
import random from 'random';
import * as Words from '@ironarachne/words';
import { R as ReligionGeneratorConfig, a as ReligionGenerator } from './generatorconfig-9e54ffc1.js';
import './characters-47fbeb76.js';
import './size_matrix-13886089.js';
import './dice-001536f8.js';
import './domains-8ce72c5c.js';
import './premade_configs-4da98017.js';

class CultureGeneratorConfig {
  generatorSet;
  constructor() {
    this.generatorSet = RND.item(MUN.cultureSets());
  }
}
class MusicStyle {
  rhythm;
  beat;
  dynamic;
  harmony;
  melody;
  pitch;
  key;
  timbre;
  description;
  constructor(rhythm, beat, dynamic, harmony, melody, pitch, key, timbre) {
    this.rhythm = rhythm;
    this.beat = beat;
    this.dynamic = dynamic;
    this.harmony = harmony;
    this.melody = melody;
    this.pitch = pitch;
    this.key = key;
    this.timbre = timbre;
    this.description = "";
  }
}
function describe$1(style) {
  let description = "This style of music has ";
  description += style.rhythm + " with ";
  description += Words.article(style.beat) + " " + style.beat + " beat. It is ";
  description += style.dynamic + ", with ";
  description += style.harmony + ". It has ";
  if (style.rhythm === "a single rhythm") {
    description += Words.article(style.melody) + " ";
  }
  description += style.melody + " ";
  if (style.rhythm === "a single rhythm") {
    description += "melody";
  } else {
    description += "melodies";
  }
  description += " with ";
  description += Words.article(style.pitch) + " " + style.pitch + " pitch in a ";
  description += style.key + " key. Usually, it has ";
  description += Words.article(style.timbre) + " " + style.timbre + " timbre.";
  return description;
}
function generate$1() {
  const style = new MusicStyle(
    randomRhythm(),
    randomBeat(),
    randomDynamic(),
    randomHarmony(),
    randomMelody(),
    randomPitch(),
    randomKey(),
    randomTimbre()
  );
  style.description = describe$1(style);
  return style;
}
function randomBeat() {
  const options = [
    {
      value: "very fast",
      commonality: 5
    },
    {
      value: "fast",
      commonality: 5
    },
    {
      value: "moderate",
      commonality: 10
    },
    {
      value: "slow",
      commonality: 5
    },
    {
      value: "very slow",
      commonality: 5
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomDynamic() {
  const options = [
    {
      value: "very quiet",
      commonality: 5
    },
    {
      value: "quiet",
      commonality: 15
    },
    {
      value: "loud",
      commonality: 15
    },
    {
      value: "very loud",
      commonality: 5
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomHarmony() {
  const options = [
    {
      value: "simple harmony",
      commonality: 10
    },
    {
      value: "two harmonies",
      commonality: 1
    },
    {
      value: "no harmony",
      commonality: 5
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomKey() {
  const options = [
    {
      value: "major",
      commonality: 10
    },
    {
      value: "minor",
      commonality: 2
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomMelody() {
  const options = [
    {
      value: "simple",
      commonality: 10
    },
    {
      value: "complex",
      commonality: 2
    },
    {
      value: "wandering",
      commonality: 2
    },
    {
      value: "chaotic",
      commonality: 1
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomPitch() {
  const options = [
    {
      value: "low",
      commonality: 5
    },
    {
      value: "medium",
      commonality: 5
    },
    {
      value: "high",
      commonality: 5
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomRhythm() {
  const options = [
    {
      value: "a single rhythm",
      commonality: 100
    },
    {
      value: "a cross-rhythm",
      commonality: 10
    },
    {
      value: "complex polyrhythm",
      commonality: 1
    }
  ];
  const result = RND.weighted(options);
  return result.value;
}
function randomTimbre() {
  return RND.item([
    "booming",
    "bright",
    "brilliant",
    "dark",
    "emotional",
    "full",
    "mellow",
    "metallic",
    "nasal",
    "reedy",
    "resonant",
    "rough",
    "smooth"
  ]);
}
class Culture {
  name;
  organization;
  generatorSet;
  countryNames;
  familyNames;
  femaleNames;
  maleNames;
  townNames;
  religion;
  taboos;
  greeting;
  eatingTrait;
  designTrait;
  musicStyle;
  constructor(name, organization, religion, taboos, greeting, eatingTrait, designTrait, musicStyle) {
    this.name = name;
    this.organization = organization;
    this.generatorSet = new GeneratorSet();
    this.countryNames = [];
    this.maleNames = [];
    this.femaleNames = [];
    this.familyNames = [];
    this.townNames = [];
    this.religion = religion;
    this.taboos = taboos;
    this.greeting = greeting;
    this.eatingTrait = eatingTrait;
    this.designTrait = designTrait;
    this.musicStyle = musicStyle;
  }
}
class Organization {
  dominantGender;
  powerConcentration;
  socialMobility;
  dominantProfession;
  description;
  constructor(dominantGender, powerConcentration, socialMobility, dominantProfession) {
    this.dominantGender = dominantGender;
    this.powerConcentration = powerConcentration;
    this.socialMobility = socialMobility;
    this.dominantProfession = dominantProfession;
    this.description = "";
  }
}
function describe(organization) {
  let description = `In this culture, ${organization.powerConcentration}. `;
  description += Words.capitalize(organization.dominantProfession) + " are most highly regarded. ";
  description += Words.capitalize(organization.dominantGender) + ". ";
  description += Words.capitalize(organization.socialMobility) + ". ";
  return description;
}
function generate() {
  const organization = new Organization(
    randomDominantGender(),
    randomPowerConcentration(),
    randomSocialMobility(),
    randomDominantProfession()
  );
  organization.description = describe(organization);
  return organization;
}
function randomDominantGender() {
  return RND.item(["women are dominant", "men are dominant", "neither gender is dominant"]);
}
function randomPowerConcentration() {
  return RND.item([
    "power is shared among multiple groups",
    "power is divided between two opposing groups",
    "power is distributed evenly among all individuals",
    "power is determined by a merit-based system",
    "power is determined by birthright",
    "power is determined by religious affiliation",
    "power is determined by wealth",
    "power is determined by military might",
    "power is determined by magical ability",
    "power is determined by age",
    "power is determined by educational attainment",
    "power is determined by popularity or public opinion"
  ]);
}
function randomSocialMobility() {
  return RND.item([
    "social mobility is completely stagnant",
    "social mobility is only possible through military service",
    "social mobility is only possible through marriage",
    "social mobility is only possible through education",
    "social mobility is only possible through wealth accumulation",
    "social mobility is only possible through religious conversion",
    "social mobility is only possible through a special talent or skill",
    "social mobility is only possible through political connections",
    "social mobility is only possible through joining a particular profession or guild",
    "social mobility is possible through hard work and determination alone",
    "social mobility is possible for anyone who is willing to take risks and seize opportunities",
    "social mobility is only possible for those born into a certain social class",
    "social mobility is only possible for those who are part of a certain racial or ethnic group",
    "social mobility is only possible for those who are members of a certain secret society"
  ]);
}
function randomDominantProfession() {
  return RND.item([
    "landowners",
    "merchants",
    "religious leaders",
    "intellectuals",
    "craftsmen",
    "farmers",
    "warriors"
  ]);
}
class CultureGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    if (this.config.generatorSet.country === null) {
      throw new Error("Culture generator config must have a country name generator set.");
    }
    if (this.config.generatorSet.culture === null) {
      throw new Error("Culture generator config must have a culture name generator set.");
    }
    if (this.config.generatorSet.family === null) {
      throw new Error("Culture generator config must have a family name generator set.");
    }
    if (this.config.generatorSet.female === null) {
      throw new Error("Culture generator config must have a female name generator set.");
    }
    if (this.config.generatorSet.male === null) {
      throw new Error("Culture generator config must have a male name generator set.");
    }
    if (this.config.generatorSet.town === null) {
      throw new Error("Culture generator config must have a town name generator set.");
    }
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
    let musicStyle = generate$1();
    musicStyle.description = musicStyle.description.replace("This style of", cultureName);
    let culture = new Culture(
      cultureName,
      generate(),
      relGen.generate(),
      randomTaboos(),
      randomGreeting(),
      randomEatingTrait(),
      randomDesignTrait(),
      musicStyle
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
    "Bold, contrasting colors",
    "Muted and earthy tones",
    "Neutral colors and pastels",
    "Metallic accents",
    "Floral patterns",
    "Nature-inspired motifs",
    "Repeating patterns",
    "Abstract shapes",
    "Organic shapes",
    "Minimalist designs",
    "Maximalist designs",
    "Whimsical design elements",
    "Industrial design elements"
  ]);
  let secondPart = RND.item([
    "are incorporated into everyday objects.",
    "are a hallmark of the local design aesthetic.",
    "are used in ceremonial and festive contexts.",
    "are considered a symbol of good luck and prosperity.",
    "are believed to have mystical or spiritual significance.",
    "are popular among the young generation.",
    "are a status symbol among the wealthy.",
    "are influenced by the latest fashion trends.",
    "are created using traditional techniques.",
    "are a fusion of different cultural influences.",
    "are designed to be functional as well as beautiful.",
    "are often customized to reflect personal tastes.",
    "are celebrated for their simplicity and elegance."
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
    "Eating is seen as a spiritual practice, with prayers and offerings made before and after meals.",
    "Certain foods are only eaten during specific times of the year, such as during religious holidays or seasonal celebrations.",
    "The presentation of food is highly valued, and elaborate, intricate arrangements are created for important meals.",
    "Food is often eaten with the hands or special utensils, rather than with conventional cutlery.",
    "Eating is a highly ritualized activity, with specific rules and protocols around how to serve and consume food.",
    "Certain dishes are believed to have specific health or medicinal benefits, and are consumed for this reason.",
    "Meals are seen as an opportunity for storytelling, with different dishes associated with different tales or legends.",
    "Eating is a highly social activity, and meals often last for several hours as people linger and chat over food and drink.",
    "There are strict rules around who is allowed to eat with whom, based on social status or other factors.",
    "Food is often preserved or fermented to allow for long-term storage and to add unique flavors and textures.",
    "Certain animals or plants are considered taboo and are not eaten, either for cultural or spiritual reasons.",
    "Eating is seen as a way to connect with the natural world, with an emphasis on locally-sourced and seasonal ingredients.",
    "There are specific dishes or meals that are associated with important life events, such as weddings or funerals.",
    "Eating is a competitive activity, with challenges and contests centered around how much or how quickly one can consume.",
    "Certain dishes or ingredients are believed to enhance or suppress specific emotions, and are consumed accordingly.",
    "Meals are often accompanied by music, dance, or other forms of performance art."
  ]);
}
function randomGreeting() {
  return RND.item([
    "Bowing is customary. The person of lower status bows lower, though both bow.",
    "Friends or family clasp hands in greeting. In formal situations, shaking hands is expected.",
    "Formal situations require the lesser person to kneel. If the status difference is slight, it is only kneeling on one knee. If the status difference is great, the lesser person must prostrate themselves. In informal situations, simple nodding the head is acceptable.",
    "In casual situations like with friends, waving is a common greeting. Formal situations require slight bowing and recitation of a ritual greeting.",
    "Nose rubbing is customary. Two people rub their noses together as a sign of respect.",
    "A hug and kiss on each cheek is common among friends and family. In formal situations, a handshake is more appropriate.",
    "People touch the palms of their hands and then their foreheads when greeting. The gesture is meant to symbolize that the person is offering their thoughts and heart to the other person.",
    "A formal greeting involves a deep bow from the waist, with the head touching the floor. This greeting is used for people of much higher status, like a king or queen.",
    "The greeting involves placing a hand over one's heart and bowing slightly. This is a sign of respect and trust.",
    "People bow with their right hand placed over their heart as a greeting. This is a sign of respect and acknowledgement of the other person’s importance.",
    "People greet each other by making eye contact and nodding their heads. This is a sign of respect and acknowledgement of the other person’s presence.",
    "People show respect by kissing the hands of the person they are greeting. This is often done when greeting older people or those of higher social status."
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
    "Displaying public affection",
    "Showing disrespect to elders",
    "Not covering one's head in public",
    "Failing to perform a traditional greeting",
    "Not washing hands before eating",
    "Wearing clothing of the opposite gender",
    "Refusing a gift",
    "Wasting food",
    "Not sharing food with others",
    "Failing to offer a gift to a visitor",
    "Sitting in a higher chair than someone of higher status",
    "Failing to offer a seat to an elder or pregnant woman",
    "Touching someone's head",
    "Eating with one's left hand",
    "Failing to remove shoes before entering a home",
    "Pointing the soles of one's feet at someone",
    "Refusing to participate in a religious ritual",
    "Singing outside of a designated area",
    "Wearing a hat indoors",
    "Failing to stand for the national anthem",
    "Failing to cover one's mouth while coughing or sneezing",
    "Carrying a knife or other weapon in public",
    "Crossing one's legs in public",
    "Leaving a door open",
    "Not standing when a respected person enters the room",
    "Wearing revealing clothing",
    "Giving a gift with one hand",
    "Whistling indoors",
    "Laughing loudly in public",
    "Not addressing someone by their proper title",
    "Wearing shoes on a bed or table",
    "Refusing to take part in a feast or celebration",
    "Talking during a religious procession",
    "Wearing dirty clothing in public",
    "Not using proper utensils while eating",
    "Failing to cover one's mouth while yawning",
    "Interrupting someone while they are speaking",
    "Failing to offer a drink to a visitor",
    "Not offering condolences to someone who has experienced a loss",
    "Failing to ask for permission before taking a photo",
    "Failing to hold the door open for someone",
    "Not making eye contact during a conversation",
    'Not saying "please" or "thank you" when appropriate',
    "Sitting with one's legs apart in public",
    "Taking food from someone else's plate",
    "Not offering a seat to someone in need"
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
    "is taboo.",
    "is shunned by society.",
    "is punishable by law.",
    "is punishable by death.",
    "is a grave sin.",
    "is believed to bring misfortune.",
    "is seen as sacrilegious.",
    "is a violation of cultural norms.",
    "is against the will of the gods.",
    "is seen as unclean.",
    "is associated with evil spirits.",
    "is a violation of ancestral traditions.",
    "is considered disrespectful to elders.",
    "is seen as a threat to social order.",
    "is considered an act of treachery.",
    "is associated with witchcraft and sorcery.",
    "is seen as a form of blasphemy.",
    "is believed to bring harm to others.",
    "is a violation of sacred laws.",
    "is a sign of moral degeneracy.",
    "is an offense against the natural order."
  ];
  let possible = [];
  for (let i = 0; i < items.length; i++) {
    possible.push(items[i] + " " + RND.item(contexts));
  }
  let taboos = [];
  possible = RND.shuffle(possible);
  const numberOfTaboos = random.int(2, 5);
  for (let i = 0; i < numberOfTaboos; i++) {
    taboos.push(possible.pop());
  }
  return taboos;
}
const css = {
  code: 'div.svelte-1narlwc.svelte-1narlwc,h1.svelte-1narlwc.svelte-1narlwc,h2.svelte-1narlwc.svelte-1narlwc,h3.svelte-1narlwc.svelte-1narlwc,h5.svelte-1narlwc.svelte-1narlwc,p.svelte-1narlwc.svelte-1narlwc,ul.svelte-1narlwc.svelte-1narlwc,li.svelte-1narlwc.svelte-1narlwc,label.svelte-1narlwc.svelte-1narlwc,section.svelte-1narlwc.svelte-1narlwc{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-1narlwc.svelte-1narlwc{display:block}ul.svelte-1narlwc.svelte-1narlwc{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-1narlwc.svelte-1narlwc,h2.svelte-1narlwc.svelte-1narlwc,h3.svelte-1narlwc.svelte-1narlwc,h5.svelte-1narlwc.svelte-1narlwc{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-1narlwc.svelte-1narlwc{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-1narlwc.svelte-1narlwc{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-1narlwc.svelte-1narlwc{font-size:2rem;line-height:2rem}h5.svelte-1narlwc.svelte-1narlwc{font-size:1.25rem;border-bottom:1px solid #333}p.svelte-1narlwc.svelte-1narlwc{margin:1rem 0}label.svelte-1narlwc.svelte-1narlwc{font-weight:700;margin-right:1rem}input.svelte-1narlwc.svelte-1narlwc,select.svelte-1narlwc.svelte-1narlwc{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-1narlwc.svelte-1narlwc{margin-bottom:1rem}ul.svelte-1narlwc li.svelte-1narlwc{list-style-type:disc;margin-left:2rem}section.main.svelte-1narlwc.svelte-1narlwc{padding:0.5rem}#seed.svelte-1narlwc.svelte-1narlwc{font-family:monospace}.fantasy.svelte-1narlwc button.svelte-1narlwc{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-1narlwc button.svelte-1narlwc:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-1narlwc button.svelte-1narlwc:disabled{background:#666;color:#777;border-color:#999}.namelist.svelte-1narlwc.svelte-1narlwc{display:grid;grid-template-columns:auto auto auto;align-items:start;justify-items:center}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const user = getContext("user");
  if (user.savedCultures === void 0) {
    user.savedCultures = [];
  }
  let seed = RND.randomString(13);
  let genConfig = new CultureGeneratorConfig();
  let genSet = RND.item(MUN.cultureSets());
  genConfig.generatorSet = genSet;
  let generator = new CultureGenerator(genConfig);
  let culture = generator.generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1nhh908_START -->${$$result.title = `<title>Culture Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1nhh908_END -->`, ""}  <section class="fantasy main svelte-1narlwc"><h1 class="svelte-1narlwc" data-svelte-h="svelte-wo6cz">Culture Generator</h1> <p class="svelte-1narlwc" data-svelte-h="svelte-19qq4o9">This generator lets you create fantasy cultures.</p> <div class="input-group svelte-1narlwc"><label for="seed" class="svelte-1narlwc" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-1narlwc"${add_attribute("value", seed, 0)}></div> <button class="svelte-1narlwc" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-1narlwc" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <button class="svelte-1narlwc" data-svelte-h="svelte-k6fvnv">Save Current Culture</button> <h2 class="svelte-1narlwc" data-svelte-h="svelte-l3l9s">Saved Cultures</h2> <div class="input-group svelte-1narlwc"><label for="savedCulture" class="svelte-1narlwc" data-svelte-h="svelte-32ylm8">Select a saved culture to load</label> <select class="svelte-1narlwc">${each(user.savedCultures, (saved) => {
    return `<option${add_attribute("value", saved.name, 0)}>${escape(saved.name)}</option>`;
  })}</select></div> <div class="input-group svelte-1narlwc"><button class="svelte-1narlwc" data-svelte-h="svelte-3ddf2q">Load Selected Culture</button></div> <h2 class="svelte-1narlwc">The ${escape(culture.name)} Culture</h2> <h3 class="svelte-1narlwc" data-svelte-h="svelte-h1uwdd">Common Names</h3> <div class="namelist svelte-1narlwc"><div class="svelte-1narlwc"><h5 class="svelte-1narlwc" data-svelte-h="svelte-x3abrx">Male Names</h5> <ul class="svelte-1narlwc">${each(culture.maleNames, (name) => {
    return `<li class="svelte-1narlwc">${escape(name)}</li>`;
  })}</ul></div> <div class="svelte-1narlwc"><h5 class="svelte-1narlwc" data-svelte-h="svelte-omt9h4">Female Names</h5> <ul class="svelte-1narlwc">${each(culture.femaleNames, (name) => {
    return `<li class="svelte-1narlwc">${escape(name)}</li>`;
  })}</ul></div> <div class="svelte-1narlwc"><h5 class="svelte-1narlwc" data-svelte-h="svelte-yp4k2g">Family Names</h5> <ul class="svelte-1narlwc">${each(culture.familyNames, (name) => {
    return `<li class="svelte-1narlwc">${escape(name)}</li>`;
  })}</ul></div></div> <div class="namelist svelte-1narlwc"><div class="svelte-1narlwc"><h5 class="svelte-1narlwc" data-svelte-h="svelte-pr7xwc">Country Names</h5> <ul class="svelte-1narlwc">${each(culture.countryNames, (name) => {
    return `<li class="svelte-1narlwc">${escape(name)}</li>`;
  })}</ul></div> <div class="svelte-1narlwc"><h5 class="svelte-1narlwc" data-svelte-h="svelte-1xyze6s">Town Names</h5> <ul class="svelte-1narlwc">${each(culture.townNames, (name) => {
    return `<li class="svelte-1narlwc">${escape(name)}</li>`;
  })}</ul></div></div> <h3 class="svelte-1narlwc" data-svelte-h="svelte-iwy84n">Organization</h3> <p class="svelte-1narlwc">${escape(culture.organization.description)}</p> <h3 class="svelte-1narlwc" data-svelte-h="svelte-1nqk18b">Religion</h3> <p class="svelte-1narlwc">${escape(culture.religion.description)}</p> <h3 class="svelte-1narlwc" data-svelte-h="svelte-1jcxpnm">Taboos</h3> ${each(culture.taboos, (taboo) => {
    return `<p class="svelte-1narlwc">${escape(taboo)}</p>`;
  })} <h3 class="svelte-1narlwc" data-svelte-h="svelte-20v9fu">Greetings</h3> <p class="svelte-1narlwc">${escape(culture.greeting)}</p> <h3 class="svelte-1narlwc" data-svelte-h="svelte-1eci4pi">Meals</h3> <p class="svelte-1narlwc">${escape(culture.eatingTrait)}</p> <h3 class="svelte-1narlwc" data-svelte-h="svelte-14spzdq">Design</h3> <p class="svelte-1narlwc">${escape(culture.designTrait)}</p> <h3 class="svelte-1narlwc" data-svelte-h="svelte-6vcmrz">Music</h3> <p class="svelte-1narlwc">${escape(culture.musicStyle.description)}</p></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-5deb06fa.js.map
