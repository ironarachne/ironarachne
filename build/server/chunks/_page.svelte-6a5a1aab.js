import { c as create_ssr_component, e as escape, f as each } from './ssr-93f4de0f.js';
import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-2a0756c4.js';
import * as Words from '@ironarachne/words';
import random from 'random';
import seedrandom from 'seedrandom';

class Phoneme {
  sound;
  transcriptions;
  classifiers;
  commonality;
  constructor(sound, transcriptions, classifiers, commonality) {
    this.sound = sound;
    this.transcriptions = transcriptions;
    this.classifiers = classifiers;
    this.commonality = commonality;
  }
}
function all$1() {
  return [
    new Phoneme("b", ["b"], ["consonant", "bilabial", "plosive", "voiced"], 1),
    new Phoneme("c", ["c", "k"], ["consonant", "palatal", "plosive", "voiceless"], 1),
    new Phoneme(
      "ch",
      ["ch"],
      ["affricate", "consonant", "palato-alveolar", "sibilant", "voiceless"],
      1
    ),
    new Phoneme("d", ["d"], ["alveolar", "consonant", "dental", "plosive", "voiced"], 1),
    new Phoneme("dʒ", ["j"], ["affricate", "consonant", "postalveolar", "voiced"], 1),
    new Phoneme("tʃ", ["ch"], ["affricate", "consonant", "postalveolar", "voiceless"], 1),
    // e.g. beach
    new Phoneme("f", ["f"], ["consonant", "voiceless", "fricative", "labiodental"], 1),
    new Phoneme("g", ["g"], ["consonant", "plosive", "velar", "voiced"], 1),
    new Phoneme("h", ["h"], ["consonant", "voiceless", "fricative", "glottal", "transition"], 1),
    new Phoneme("j", ["j"], ["affricate", "consonant", "sibilant"], 1),
    new Phoneme("k", ["k"], ["consonant", "plosive", "velar", "voiceless"], 1),
    new Phoneme(
      "l",
      ["l", "ll"],
      ["alveolar", "consonant", "dental", "lateral", "liquid", "voiced"],
      1
    ),
    new Phoneme("m", ["m"], ["bilabial", "consonant", "nasal", "occlusive", "voiced"], 1),
    new Phoneme("n", ["n"], ["alveolar", "consonant", "dental", "nasal", "occlusive", "voiced"], 1),
    new Phoneme("ŋ", ["ng"], ["consonant", "nasal", "velar", "voiced"], 1),
    new Phoneme("p", ["p"], ["bilabial", "consonant", "plosive", "voiced"], 1),
    new Phoneme("q", ["q"], ["consonant", "plosive", "uvular", "voiceless"], 1),
    new Phoneme("ɹ", ["r"], ["consonant", "liquid", "rhotic"], 1),
    new Phoneme("r", ["rr"], ["alveolar", "consonant", "trill", "voiced"], 1),
    new Phoneme("s", ["s", "c"], ["consonant", "coronal", "fricative", "voiceless"], 1),
    new Phoneme("ʃ", ["sh"], ["consonant", "fricative", "sibilant"], 1),
    new Phoneme("ʒ", ["si", "zh"], ["consonant", "fricative", "palato-alveolar", "sibilant"], 1),
    new Phoneme("ɾ", ["tt"], ["alveolar", "consonant", "voiced", "tap"], 1),
    new Phoneme("ɽ", ["dd"], ["alveolar", "consonant", "voiced", "tap"], 1),
    new Phoneme("t", ["t"], ["consonant", "dental", "plosive", "voiceless"], 1),
    new Phoneme(
      "ts",
      ["ts", "tsu"],
      ["affricate", "alveolar", "consonant", "fricative", "voiceless"],
      1
    ),
    new Phoneme("θ", ["th"], ["consonant", "fricative", "voiceless"], 1),
    new Phoneme("ð", ["th"], ["consonant", "fricative", "voiced"], 1),
    new Phoneme("v", ["v"], ["consonant", "fricative", "labiodental", "voiced"], 1),
    new Phoneme("w", ["w"], ["approximant", "consonant", "velar", "voiced"], 1),
    new Phoneme("x", ["ch", "k"], ["consonant", "fricative", "velar", "voiceless"], 1),
    new Phoneme("y", ["y"], ["approximant", "consonant", "palatal", "voiced"], 1),
    new Phoneme("z", ["z", "x"], ["aveolar", "consonant", "fricative", "voiced"], 1),
    new Phoneme("ə", ["a"], ["central", "unrounded", "vowel"], 1),
    // e.g., the a in Tina
    new Phoneme("e", ["ay", "e"], ["close-mid", "front", "unrounded", "vowel"], 1),
    // e.g. may
    new Phoneme("aɪ", ["ai", "y", "ie", "igh"], ["vowel"], 1),
    new Phoneme("aʊ", ["ou"], ["vowel"], 1),
    new Phoneme("æ", ["a"], ["front", "unrounded", "vowel"], 1),
    new Phoneme("ɔ", ["o"], ["back", "unrounded", "vowel"], 1),
    new Phoneme("a", ["a"], ["open", "front", "unrounded", "vowel"], 1),
    // e.g. hat in Texan/Californian dialect
    new Phoneme("ɒ", ["ough", "a", "o"], ["back", "open", "rounded", "vowel"], 1),
    new Phoneme("ɛ", ["e"], ["front", "unrounded", "vowel"], 1),
    new Phoneme("o", ["aw"], ["close-mid", "back", "unrounded", "vowel"], 1),
    // e.g. yawn in Australian dialect
    new Phoneme("ɪ", ["i"], ["front", "unrounded", "vowel"], 1),
    new Phoneme("ʌ", ["u", "oo"], ["back", "open-mid", "unrounded", "vowel"], 1),
    // e.g. foot
    new Phoneme("ʊ", ["u"], ["near-back", "rounded", "vowel"], 1),
    new Phoneme("i", ["i", "ee"], ["close", "front", "unrounded", "vowel"], 1),
    // e.g. free
    new Phoneme("ʊ", ["oo"], ["near-close", "near-back", "rounded", "vowel"], 1),
    // e.g. hook
    new Phoneme("ɔɪ", ["oi", "oy"], ["vowel"], 1),
    new Phoneme("u", ["u", "oo"], ["close", "back", "rounded", "vowel"], 1)
    // e.g. food
  ];
}
function byClassification(classification, phonemes) {
  return phonemes.filter((phoneme) => phoneme.classifiers.includes(classification));
}
function getConsonants(phonemes) {
  let result = byClassification("consonant", phonemes);
  return result;
}
function getVowels(phonemes) {
  let result = byClassification("vowel", phonemes);
  return result;
}
class PhonemeSet {
  name;
  phonemes;
  constructor(name) {
    this.name = name;
    this.phonemes = initializePhonemeSet();
  }
  getPhonemes() {
    let phonemes = [];
    for (const phoneme in this.phonemes) {
      phonemes.push(this.phonemes[phoneme]);
    }
    return phonemes;
  }
}
function initializePhonemeSet() {
  let all2 = all$1();
  let phonemes = {};
  for (const phoneme of all2) {
    phonemes[phoneme.sound] = phoneme;
  }
  return phonemes;
}
function all() {
  return [getEnglishSet()];
}
function getEnglishSet() {
  let set = new PhonemeSet("English");
  set.phonemes["ə"].commonality = 114;
  set.phonemes["n"].commonality = 71;
  set.phonemes["ɾ"].commonality = 69;
  set.phonemes["t"].commonality = 69;
  set.phonemes["ɪ"].commonality = 63;
  set.phonemes["s"].commonality = 47;
  set.phonemes["d"].commonality = 42;
  set.phonemes["l"].commonality = 39;
  set.phonemes["i"].commonality = 36;
  set.phonemes["k"].commonality = 31;
  set.phonemes["ð"].commonality = 29;
  set.phonemes["ɛ"].commonality = 28;
  set.phonemes["m"].commonality = 27;
  set.phonemes["z"].commonality = 27;
  set.phonemes["p"].commonality = 21;
  set.phonemes["æ"].commonality = 21;
  set.phonemes["v"].commonality = 20;
  set.phonemes["w"].commonality = 19;
  set.phonemes["u"].commonality = 19;
  set.phonemes["b"].commonality = 18;
  set.phonemes["e"].commonality = 17;
  set.phonemes["ʌ"].commonality = 17;
  set.phonemes["f"].commonality = 17;
  set.phonemes["aɪ"].commonality = 15;
  set.phonemes["a"].commonality = 14;
  set.phonemes["h"].commonality = 15;
  set.phonemes["o"].commonality = 12;
  set.phonemes["ɒ"].commonality = 11;
  set.phonemes["ŋ"].commonality = 9;
  set.phonemes["ʃ"].commonality = 8;
  set.phonemes["j"].commonality = 8;
  set.phonemes["g"].commonality = 8;
  set.phonemes["dʒ"].commonality = 5;
  set.phonemes["tʃ"].commonality = 5;
  set.phonemes["aʊ"].commonality = 5;
  set.phonemes["ʊ"].commonality = 4;
  set.phonemes["θ"].commonality = 4;
  set.phonemes["ɔɪ"].commonality = 1;
  set.phonemes["ʒ"].commonality = 1;
  return set;
}
class LanguageGeneratorConfig {
  phonemeSets;
  constructor() {
    this.phonemeSets = all();
  }
}
class Word {
  root;
  pronunciation;
  speechPart;
  meaning;
  constructor(speechPart, meaning) {
    this.root = "";
    this.pronunciation = "";
    this.speechPart = speechPart;
    this.meaning = meaning;
  }
}
class Lexicon {
  words;
  constructor() {
    this.words = [];
    const adj = adjectives();
    for (let i = 0; i < adj.length; i++) {
      const word = new Word("adjective", adj[i]);
      this.words.push(word);
    }
    const adv = adverbs();
    for (let i = 0; i < adv.length; i++) {
      const word = new Word("adverb", adv[i]);
      this.words.push(word);
    }
    const art = articles();
    for (let i = 0; i < art.length; i++) {
      const word = new Word("article", art[i]);
      this.words.push(word);
    }
    const inter = interjections();
    for (let i = 0; i < inter.length; i++) {
      const word = new Word("interjection", inter[i]);
      this.words.push(word);
    }
    const prep = prepositions();
    for (let i = 0; i < prep.length; i++) {
      const word = new Word("preposition", prep[i]);
      this.words.push(word);
    }
    const que = questions();
    for (let i = 0; i < que.length; i++) {
      const word = new Word("question", que[i]);
      this.words.push(word);
    }
    const ver = verbs();
    for (let i = 0; i < ver.length; i++) {
      const word = new Word("verb", ver[i]);
      this.words.push(word);
    }
    const nou = nouns();
    for (let i = 0; i < nou.length; i++) {
      const word = new Word("noun", nou[i]);
      this.words.push(word);
    }
    const nm = numbers();
    for (let i = 0; i < nm.length; i++) {
      const word = new Word("number", nm[i]);
      this.words.push(word);
    }
    const pro = pronouns();
    for (let i = 0; i < pro.length; i++) {
      const word = new Word("pronoun", pro[i]);
      this.words.push(word);
    }
  }
  getWordsBySpeechPart(speechPart) {
    return this.words.filter((word) => word.speechPart == speechPart);
  }
}
function adjectives() {
  return [
    "aromatic",
    "basted",
    "big",
    "bitter",
    "black",
    "blue",
    "brown",
    "chilled",
    "cold",
    "curried",
    "dark",
    "deep",
    "divine",
    "drunk",
    "empty",
    "evil",
    "familiar",
    "fat",
    "flat",
    "frail",
    "fried",
    "full",
    "good",
    "green",
    "grey",
    "honest",
    "hot",
    "light",
    "long",
    "loud",
    "mortal",
    "mysterious",
    "narrow",
    "old",
    "orange",
    "pungent",
    "purple",
    "quiet",
    "raw",
    "rectangular",
    "red",
    "roasted",
    "round",
    "salty",
    "savory",
    "shallow",
    "short",
    "smoked",
    "sober",
    "sour",
    "spicy",
    "spiral",
    "square",
    "steamed",
    "strange",
    "strong",
    "sturdy",
    "sweet",
    "tall",
    "thick",
    "thin",
    "warm",
    "weak",
    "white",
    "wide",
    "yellow",
    "young"
  ];
}
function adverbs() {
  return ["again", "now", "soon", "often", "sometimes", "always", "never", "seldom"];
}
function articles() {
  return ["a", "the"];
}
function interjections() {
  return ["hello", "goodbye", "hey", "bye", "ouch", "wow", "uh", "er", "um"];
}
function prepositions() {
  return ["and", "as", "from", "in", "of", "or", "to", "will", "with"];
}
function questions() {
  return ["what", "who", "how", "why", "when"];
}
function verbs() {
  return [
    "bake",
    "be",
    "belong",
    "bite",
    "break",
    "burn",
    "come",
    "die",
    "drink",
    "eat",
    "fall",
    "fight",
    "find",
    "fish",
    "fly",
    "frown",
    "go",
    "growl",
    "hate",
    "have",
    "hear",
    "hide",
    "hold",
    "hunt",
    "jump",
    "kill",
    "know",
    "laugh",
    "lie",
    "live",
    "lose",
    "love",
    "need",
    "own",
    "roast",
    "run",
    "see",
    "sit",
    "sleep",
    "smell",
    "smile",
    "stand",
    "strike",
    "swallow",
    "swim",
    "taste",
    "throw",
    "walk",
    "want"
  ];
}
function nouns() {
  return [
    "afternoon",
    "ale",
    "all",
    "alligator",
    "arm",
    "ash",
    "aunt",
    "axe",
    "bark",
    "bay",
    "beer",
    "beet",
    "bird",
    "blood",
    "boar",
    "bone",
    "breakfast",
    "breast",
    "brother",
    "castle",
    "cat",
    "cat",
    "chest",
    "chicken",
    "claw",
    "cloud",
    "coconut",
    "crime",
    "day",
    "dinner",
    "dog",
    "drink",
    "dungeon",
    "ear",
    "earth",
    "egg",
    "elder",
    "enemy",
    "evening",
    "eye",
    "family",
    "father",
    "feather",
    "fight",
    "finger",
    "fire",
    "fish",
    "flesh",
    "foot",
    "forest",
    "fox",
    "friend",
    "goose",
    "grease",
    "group",
    "gulf",
    "hair",
    "hand",
    "hat",
    "hate",
    "head",
    "hill",
    "horn",
    "horse",
    "house",
    "inn",
    "island",
    "jaw",
    "lake",
    "leaf",
    "leg",
    "liver",
    "louse",
    "love",
    "lunch",
    "man",
    "many",
    "meal",
    "metal",
    "mine",
    "monster",
    "moon",
    "morning",
    "mother",
    "mountain",
    "mouth",
    "name",
    "neck",
    "night",
    "noodle",
    "nose",
    "ocean",
    "parent",
    "path",
    "peace",
    "pepper",
    "person",
    "pie",
    "pig",
    "rabbit",
    "rain",
    "rat",
    "river",
    "robe",
    "rock",
    "root",
    "salt",
    "sand",
    "seed",
    "sibling",
    "sister",
    "skin",
    "sky",
    "smoke",
    "snake",
    "soup",
    "star",
    "stew",
    "stomach",
    "stone",
    "stream",
    "sun",
    "sword",
    "tail",
    "tavern",
    "thumb",
    "tongue",
    "tooth",
    "tree",
    "truth",
    "uncle",
    "valley",
    "war",
    "water",
    "way",
    "wine",
    "woman",
    "word"
  ];
}
function numbers() {
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
}
function pronouns() {
  return ["he", "she", "they", "you", "we", "I"];
}
class Language {
  name;
  lexicon;
  phonemeSet;
  conjugations;
  wordOrder;
  constructor(name, phonemeSet) {
    this.name = name;
    this.phonemeSet = phonemeSet;
    this.conjugations = [];
    this.lexicon = new Lexicon();
    this.wordOrder = "";
  }
}
class Morpheme {
  phonemes;
  constructor() {
    this.phonemes = [];
  }
  getPronunciation() {
    return this.phonemes.map((p) => p.sound).join("");
  }
  getTranscription() {
    return this.phonemes.map((p) => p.transcriptions[0]).join("");
  }
}
class LanguageGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let phonemeSet = RND.item(this.config.phonemeSets);
    let language = new Language("", phonemeSet);
    language.wordOrder = randomWordOrder();
    language.name = Words.capitalize(
      randomMorpheme(random.int(4, 7), phonemeSet).getTranscription()
    );
    for (let i = 0; i < language.lexicon.words.length; i++) {
      let morphemeLength = random.int(2, 7);
      if (["article", "pronoun"].includes(language.lexicon.words[i].speechPart)) {
        morphemeLength = random.int(2, 3);
      }
      let morpheme = randomMorpheme(morphemeLength, phonemeSet);
      language.lexicon.words[i].root = morpheme.getTranscription();
      language.lexicon.words[i].pronunciation = morpheme.getPronunciation();
    }
    return language;
  }
}
function randomWordOrder() {
  let options = [
    {
      value: "svo",
      commonality: 10
    },
    {
      value: "sov",
      commonality: 1
    }
  ];
  let order = RND.weighted(options);
  return order.value;
}
function randomMorpheme(length, phonemeSet) {
  let consonants = getConsonants(phonemeSet.getPhonemes());
  let vowels = getVowels(phonemeSet.getPhonemes());
  let pattern = "";
  for (let i = 0; i < length; i++) {
    if (i == 0 && length == 1) {
      pattern = "v";
    } else {
      let newPart = RND.item(["v", "c"]);
      if (i > 0) {
        let last = pattern[i - 1];
        if (last == "v") {
          newPart = "c";
        } else {
          newPart = "v";
        }
      }
      pattern += newPart;
    }
  }
  let morpheme = new Morpheme();
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] == "v") {
      morpheme.phonemes.push(RND.weighted(vowels));
    } else {
      morpheme.phonemes.push(RND.weighted(consonants));
    }
  }
  return morpheme;
}
const css = {
  code: 'h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-4q74qx.svelte-4q74qx{font-size:2rem;line-height:2rem}h4.svelte-4q74qx.svelte-4q74qx{font-size:1.5rem;line-height:1.5rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}section.default.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;font-size:1rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}section.default.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}section.default.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let language;
  let gen;
  let config;
  let seed = RND.randomString(13);
  function generate() {
    seed = RND.randomString(13);
    random.use(seedrandom(seed));
    config = new LanguageGeneratorConfig();
    gen = new LanguageGenerator(config);
    language = gen.generate();
  }
  generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-mq0loe_START -->${$$result.title = `<title>Language Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-mq0loe_END -->`, ""} <section class="main default svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-wy8brr">Language Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-1u4cm7r">This generates fictional languages. This is mostly useful for debugging.</p> <button class="svelte-4q74qx" data-svelte-h="svelte-41x9ys">Generate</button> <h2 class="svelte-4q74qx">${escape(language.name)}</h2> <h3 class="svelte-4q74qx">${escape(language.name)} Dictionary</h3> <h4 class="svelte-4q74qx" data-svelte-h="svelte-1bph58e">Pronouns</h4> ${each(language.lexicon.getWordsBySpeechPart("pronoun"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-1ni3061">Articles</h4> ${each(language.lexicon.getWordsBySpeechPart("article"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-nd1e35">Prepositions</h4> ${each(language.lexicon.getWordsBySpeechPart("preposition"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-fzmpg4">Numbers</h4> ${each(language.lexicon.getWordsBySpeechPart("number"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-9or4p">Questions</h4> ${each(language.lexicon.getWordsBySpeechPart("question"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-12jbw3z">Interjections</h4> ${each(language.lexicon.getWordsBySpeechPart("interjection"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-5ts5g1">Adverbs</h4> ${each(language.lexicon.getWordsBySpeechPart("adverb"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-2u4ffq">Adjectives</h4> ${each(language.lexicon.getWordsBySpeechPart("adjective"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-zg1ee0">Verbs</h4> ${each(language.lexicon.getWordsBySpeechPart("verb"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })} <h4 class="svelte-4q74qx" data-svelte-h="svelte-50u9e5">Nouns</h4> ${each(language.lexicon.getWordsBySpeechPart("noun"), (word) => {
    return `<p class="svelte-4q74qx">${escape(word.root)} (${escape(word.speechPart)}, /${escape(word.pronunciation)}/): &quot;${escape(word.meaning)}&quot;</p>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-6a5a1aab.js.map
