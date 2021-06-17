"use strict";

function shuffled(list) {
  let newList = [];
  for (let i = 0; i < list.length; i++) {
    newList.push(list[i]);
  }
  for (let i = list.length - 1; i > 0; i--) {
    let tmp = newList[i];
    let j = randRange(i);
    newList[i] = newList[j];
    newList[j] = tmp;
  }
  return newList;
}

function choose(list, exponent) {
  exponent = exponent || 1;
  return list[Math.floor(Math.pow(Math.random(), exponent) * list.length)];
}

function randRange(lo, hi) {
  if (hi === undefined) {
    hi = lo;
    lo = 0;
  }
  return Math.floor(Math.random() * (hi - lo)) + lo;
}

function join(list, sep) {
  if (list.length === 0) return "";
  sep = sep || "";
  let s = list[0];
  for (let i = 1; i < list.length; i++) {
    s += sep;
    s += list[i];
  }
  return s;
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function spell(lang, syll) {
  if (lang.noortho) return syll;
  let s = "";
  for (let i = 0; i < syll.length; i++) {
    let c = syll[i];
    s += lang.cortho[c] || lang.vortho[c] || defaultOrtho[c] || c;
  }
  return s;
}

function makeSyllable(lang) {
  let keepGoing = true;
  while (keepGoing) {
    let syll = "";
    for (let i = 0; i < lang.structure.length; i++) {
      let ptype = lang.structure[i];
      if (lang.structure[i + 1] === "?") {
        i++;
        if (Math.random() < 0.5) {
          continue;
        }
      }
      syll += choose(lang.phonemes[ptype], lang.exponent);
    }
    let bad = false;
    for (let i = 0; i < lang.restricts.length; i++) {
      if (lang.restricts[i].test(syll)) {
        bad = true;
        break;
      }
    }
    if (bad) continue;
    return spell(lang, syll);
  }
}

function getMorpheme(lang, key) {
  if (lang.nomorph) {
    return makeSyllable(lang);
  }
  key = key || "";
  let list = lang.morphemes[key] || [];
  let extras = 10;
  if (key) extras = 1;
  let keepGoing = true;
  while (keepGoing) {
    let n = randRange(list.length + extras);
    if (list[n]) return list[n];
    let morph = makeSyllable(lang);
    let bad = false;
    for (let k in lang.morphemes) {
      if (lang.morphemes[k].includes(morph)) {
        bad = true;
        break;
      }
    }
    if (bad) continue;
    list.push(morph);
    lang.morphemes[key] = list;
    return morph;
  }
}

function makeWord(lang, key) {
  let nsylls = randRange(lang.minsyll, lang.maxsyll + 1);
  let w = "";
  let keys = [];
  keys[randRange(nsylls)] = key;
  for (let i = 0; i < nsylls; i++) {
    w += getMorpheme(lang, keys[i]);
  }
  return w;
}

function getWord(lang, key) {
  key = key || "";
  let ws = lang.words[key] || [];
  let extras = 3;
  if (key) extras = 2;
  let keepGoing = true;
  while (keepGoing) {
    let n = randRange(ws.length + extras);
    let w = ws[n];
    if (w) {
      return w;
    }
    w = makeWord(lang, key);
    let bad = false;
    for (let k in lang.words) {
      if (lang.words[k].includes(w)) {
        bad = true;
        break;
      }
    }
    if (bad) continue;
    ws.push(w);
    lang.words[key] = ws;
    return w;
  }
}

export function makeName(lang, key) {
  key = key || "";
  lang.genitive = lang.genitive || getMorpheme(lang, "of");
  lang.definite = lang.definite || getMorpheme(lang, "the");
  let keepGoing = true;
  while (keepGoing) {
    let name = null;
    if (Math.random() < 0.5) {
      name = capitalize(getWord(lang, key));
    } else {
      let w1 = capitalize(getWord(lang, Math.random() < 0.6 ? key : ""));
      let w2 = capitalize(getWord(lang, Math.random() < 0.6 ? key : ""));
      if (w1 === w2) continue;
      if (Math.random() > 0.5) {
        name = join([w1, w2], lang.joiner);
      } else {
        name = join([w1, lang.genitive, w2], lang.joiner);
      }
    }
    if (Math.random() < 0.1) {
      name = join([lang.definite, name], lang.joiner);
    }

    if (name.length < lang.minchar || name.length > lang.maxchar) continue;
    let used = false;
    for (let i = 0; i < lang.names.length; i++) {
      let name2 = lang.names[i];
      if (name.indexOf(name2) != -1 || name2.indexOf(name) != -1) {
        used = true;
        break;
      }
    }
    if (used) continue;
    lang.names.push(name);
    return name;
  }
}

function makeBasicLanguage() {
  return {
    phonemes: {
      C: "ptkmnls",
      V: "aeiou",
      S: "s",
      F: "mn",
      L: "rl",
    },
    structure: "CVC",
    exponent: 2,
    restricts: [],
    cortho: {},
    vortho: {},
    noortho: true,
    nomorph: true,
    nowordpool: true,
    minsyll: 1,
    maxsyll: 1,
    morphemes: {},
    words: {},
    names: [],
    joiner: " ",
    maxchar: 12,
    minchar: 5,
  };
}

export function makeOrthoLanguage() {
  let lang = makeBasicLanguage();
  lang.noortho = false;
  return lang;
}

export function makeRandomLanguage() {
  let lang = makeBasicLanguage();
  lang.noortho = false;
  lang.nomorph = false;
  lang.nowordpool = false;
  lang.phonemes.C = shuffled(choose(consets, 2).C);
  lang.phonemes.V = shuffled(choose(vowsets, 2).V);
  lang.phonemes.L = shuffled(choose(lsets, 2).L);
  lang.phonemes.S = shuffled(choose(ssets, 2).S);
  lang.phonemes.F = shuffled(choose(fsets, 2).F);
  lang.structure = choose(syllstructs);
  lang.restricts = ressets[2].res;
  lang.cortho = choose(corthsets, 2).orth;
  lang.vortho = choose(vorthsets, 2).orth;
  lang.minsyll = randRange(1, 3);
  if (lang.structure.length < 3) lang.minsyll++;
  lang.maxsyll = randRange(lang.minsyll + 1, 7);
  lang.joiner = choose("   -");
  return lang;
}

let defaultOrtho = {
  ʃ: "sh",
  ʒ: "zh",
  ʧ: "ch",
  ʤ: "j",
  ŋ: "ng",
  j: "y",
  x: "kh",
  ɣ: "gh",
  ʔ: "‘",
  A: "á",
  E: "é",
  I: "í",
  O: "ó",
  U: "ú",
};

let corthsets = [
  {
    name: "Default",
    orth: {},
  },
  {
    name: "Slavic",
    orth: {
      ʃ: "š",
      ʒ: "ž",
      ʧ: "č",
      ʤ: "ǧ",
      j: "j",
    },
  },
  {
    name: "German",
    orth: {
      ʃ: "sch",
      ʒ: "zh",
      ʧ: "tsch",
      ʤ: "dz",
      j: "j",
      x: "ch",
    },
  },
  {
    name: "French",
    orth: {
      ʃ: "ch",
      ʒ: "j",
      ʧ: "tch",
      ʤ: "dj",
      x: "kh",
    },
  },
  {
    name: "Chinese (pinyin)",
    orth: {
      ʃ: "x",
      ʧ: "q",
      ʤ: "j",
    },
  },
];

let vorthsets = [
  {
    name: "Ácutes",
    orth: {},
  },
  {
    name: "Ümlauts",
    orth: {
      A: "ä",
      E: "ë",
      I: "ï",
      O: "ö",
      U: "ü",
    },
  },
  {
    name: "Welsh",
    orth: {
      A: "â",
      E: "ê",
      I: "y",
      O: "ô",
      U: "w",
    },
  },
  {
    name: "Diphthongs",
    orth: {
      A: "au",
      E: "ei",
      I: "ie",
      O: "ou",
      U: "oo",
    },
  },
  {
    name: "Doubles",
    orth: {
      A: "aa",
      E: "ee",
      I: "ii",
      O: "oo",
      U: "uu",
    },
  },
];

let consets = [
  {
    name: "Minimal",
    C: "ptkmnls",
  },
  {
    name: "English-ish",
    C: "ptkbdgmnlrsʃzʒʧ",
  },
  {
    name: "Pirahã (very simple)",
    C: "ptkmnh",
  },
  {
    name: "Hawaiian-ish",
    C: "hklmnpwʔ",
  },
  {
    name: "Greenlandic-ish",
    C: "ptkqvsgrmnŋlj",
  },
  {
    name: "Arabic-ish",
    C: "tksʃdbqɣxmnlrwj",
  },
  {
    name: "Arabic-lite",
    C: "tkdgmnsʃ",
  },
  {
    name: "English-lite",
    C: "ptkbdgmnszʒʧhjw",
  },
];

let ssets = [
  {
    name: "Just s",
    S: "s",
  },
  {
    name: "s ʃ",
    S: "sʃ",
  },
  {
    name: "s ʃ f",
    S: "sʃf",
  },
];

let lsets = [
  {
    name: "r l",
    L: "rl",
  },
  {
    name: "Just r",
    L: "r",
  },
  {
    name: "Just l",
    L: "l",
  },
  {
    name: "w j",
    L: "wj",
  },
  {
    name: "r l w j",
    L: "rlwj",
  },
];

let fsets = [
  {
    name: "m n",
    F: "mn",
  },
  {
    name: "s k",
    F: "sk",
  },
  {
    name: "m n ŋ",
    F: "mnŋ",
  },
  {
    name: "s ʃ z ʒ",
    F: "sʃzʒ",
  },
];

let vowsets = [
  {
    name: "Standard 5-vowel",
    V: "aeiou",
  },
  {
    name: "3-vowel a i u",
    V: "aiu",
  },
  {
    name: "Extra A E I",
    V: "aeiouAEI",
  },
  {
    name: "Extra U",
    V: "aeiouU",
  },
  {
    name: "5-vowel a i u A I",
    V: "aiuAI",
  },
  {
    name: "3-vowel e o u",
    V: "eou",
  },
  {
    name: "Extra A O U",
    V: "aeiouAOU",
  },
];

let syllstructs = [
  "CVC",
  "CVV?C",
  "CVVC?",
  "CVC?",
  "CV",
  "VC",
  "CVF",
  "C?VC",
  "CVF?",
  "CL?VC",
  "CL?VF",
  "S?CVC",
  "S?CVF",
  "S?CVC?",
  "C?VF",
  "C?VC?",
  "C?VF?",
  "C?L?VC",
  "VC",
  "CVL?C?",
  "C?VL?C",
  "C?VLC?",
];

let ressets = [
  {
    name: "None",
    res: [],
  },
  {
    name: "Double sounds",
    res: [/(.)\1/],
  },
  {
    name: "Doubles and hard clusters",
    res: [/[sʃf][sʃ]/, /(.)\1/, /[rl][rl]/],
  },
];
