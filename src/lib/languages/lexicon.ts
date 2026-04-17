import type { Lexicon, Word } from './language_types.js';
import { englishPluralNounSurfaceToSingularLemma } from './english_noun_irregular_plural.js';
import {
  englishVerbSurfaceToPresentLemma,
  shouldOmitEnglishNounFrequencySurface,
} from './english_verb_surface_to_lemma.js';
import { dedupeMeaningsPreservingOrder } from './lexicon_dedupe.js';
import {
  POWERLANGUAGE_ADJECTIVES,
  POWERLANGUAGE_ADVERBS,
  POWERLANGUAGE_ALPHABETIC,
  POWERLANGUAGE_ARTICLES,
  POWERLANGUAGE_INTERJECTIONS,
  POWERLANGUAGE_NOUNS,
  POWERLANGUAGE_NUMBERS,
  POWERLANGUAGE_PREPOSITIONS,
  POWERLANGUAGE_PRONOUNS,
  POWERLANGUAGE_QUESTIONS,
  POWERLANGUAGE_VERBS,
} from './lexicon_powerlanguage_bucket_lists.js';
import { createWord } from './word.js';

export function createLexicon(): Lexicon {
  const words: Word[] = [];

  for (const meaning of adjectives()) {
    words.push(createWord('adjective', meaning));
  }
  for (const meaning of adverbs()) {
    words.push(createWord('adverb', meaning));
  }
  for (const meaning of articles()) {
    words.push(createWord('article', meaning));
  }
  for (const meaning of interjections()) {
    words.push(createWord('interjection', meaning));
  }
  for (const meaning of prepositions()) {
    words.push(createWord('preposition', meaning));
  }
  for (const meaning of questions()) {
    words.push(createWord('question', meaning));
  }
  for (const meaning of verbs()) {
    words.push(createWord('verb', meaning));
  }
  for (const meaning of nouns()) {
    words.push(createWord('noun', meaning));
  }
  for (const meaning of numbers()) {
    words.push(createWord('number', meaning));
  }
  for (const meaning of pronouns()) {
    words.push(createWord('pronoun', meaning));
  }

  return { words };
}

export function getLexiconWordsBySpeechPart(lexicon: Lexicon, speechPart: string): Word[] {
  return lexicon.words.filter((word) => word.speechPart === speechPart);
}

function frequencyVerbLemmas(): string[] {
  const lemmas = new Set<string>();
  for (const w of POWERLANGUAGE_ALPHABETIC) {
    const lem = englishVerbSurfaceToPresentLemma(w);
    if (lem) {
      lemmas.add(lem);
    }
  }
  for (const w of POWERLANGUAGE_VERBS) {
    lemmas.add(englishVerbSurfaceToPresentLemma(w) ?? w);
  }
  return dedupeMeaningsPreservingOrder([...lemmas]);
}

function frequencyNounLemmas(): string[] {
  const cleaned = POWERLANGUAGE_NOUNS.filter((w) => !shouldOmitEnglishNounFrequencySurface(w)).map(
    (w) => englishPluralNounSurfaceToSingularLemma(w),
  );
  return dedupeMeaningsPreservingOrder(cleaned);
}

function mergedNounMeanings(): string[] {
  return dedupeMeaningsPreservingOrder([...themedNouns(), ...frequencyNounLemmas()]);
}

function adjectives(): string[] {
  return dedupeMeaningsPreservingOrder([...themedAdjectives(), ...POWERLANGUAGE_ADJECTIVES]);
}

function adverbs(): string[] {
  return dedupeMeaningsPreservingOrder([...themedAdverbs(), ...POWERLANGUAGE_ADVERBS]);
}

function articles(): string[] {
  return dedupeMeaningsPreservingOrder([...themedArticles(), ...POWERLANGUAGE_ARTICLES]);
}

function interjections(): string[] {
  return dedupeMeaningsPreservingOrder([...themedInterjections(), ...POWERLANGUAGE_INTERJECTIONS]);
}

function prepositions(): string[] {
  return dedupeMeaningsPreservingOrder([...themedPrepositions(), ...POWERLANGUAGE_PREPOSITIONS]);
}

function questions(): string[] {
  return dedupeMeaningsPreservingOrder([...themedQuestions(), ...POWERLANGUAGE_QUESTIONS]);
}

function verbs(): string[] {
  return dedupeMeaningsPreservingOrder([...themedVerbs(), ...frequencyVerbLemmas()]);
}

function nouns(): string[] {
  return mergedNounMeanings();
}

function numbers(): string[] {
  return dedupeMeaningsPreservingOrder([...themedNumbers(), ...POWERLANGUAGE_NUMBERS]);
}

function pronouns(): string[] {
  const nounKeys = new Set(mergedNounMeanings().map((n) => n.toLowerCase()));
  const freq = POWERLANGUAGE_PRONOUNS.filter((p) => !nounKeys.has(p.toLowerCase()));
  return dedupeMeaningsPreservingOrder([...themedPronouns(), ...freq]);
}

function themedAdjectives(): string[] {
  return [
    'aromatic',
    'basted',
    'big',
    'bitter',
    'black',
    'blue',
    'brown',
    'chilled',
    'cold',
    'curried',
    'dark',
    'deep',
    'divine',
    'drunk',
    'empty',
    'evil',
    'familiar',
    'fat',
    'flat',
    'frail',
    'fried',
    'full',
    'good',
    'green',
    'grey',
    'honest',
    'hot',
    'light',
    'long',
    'loud',
    'mortal',
    'mysterious',
    'narrow',
    'old',
    'orange',
    'pungent',
    'purple',
    'quiet',
    'raw',
    'rectangular',
    'red',
    'roasted',
    'round',
    'salty',
    'savory',
    'shallow',
    'short',
    'smoked',
    'sober',
    'sour',
    'spicy',
    'spiral',
    'square',
    'steamed',
    'strange',
    'strong',
    'sturdy',
    'sweet',
    'tall',
    'thick',
    'thin',
    'warm',
    'weak',
    'white',
    'wide',
    'yellow',
    'young',
  ];
}

function themedAdverbs(): string[] {
  return ['again', 'now', 'soon', 'often', 'sometimes', 'always', 'never', 'seldom'];
}

function themedArticles(): string[] {
  return ['a', 'the'];
}

function themedInterjections(): string[] {
  return ['hello', 'goodbye', 'hey', 'bye', 'ouch', 'wow', 'uh', 'er', 'um'];
}

function themedPrepositions(): string[] {
  return ['and', 'as', 'from', 'in', 'of', 'or', 'to', 'will', 'with'];
}

function themedQuestions(): string[] {
  return ['what', 'who', 'how', 'why', 'when'];
}

function themedVerbs(): string[] {
  return [
    'bake',
    'be',
    'belong',
    'bite',
    'break',
    'burn',
    'come',
    'die',
    'drink',
    'eat',
    'fall',
    'fight',
    'find',
    'fish',
    'fly',
    'frown',
    'go',
    'growl',
    'hate',
    'have',
    'hear',
    'hide',
    'hold',
    'hunt',
    'jump',
    'kill',
    'know',
    'laugh',
    'lie',
    'live',
    'lose',
    'love',
    'need',
    'own',
    'roast',
    'run',
    'see',
    'sit',
    'sleep',
    'smell',
    'smile',
    'stand',
    'strike',
    'swallow',
    'swim',
    'taste',
    'throw',
    'walk',
    'want',
  ];
}

function themedNouns(): string[] {
  return [
    'afternoon',
    'ale',
    'all',
    'alligator',
    'arm',
    'ash',
    'aunt',
    'axe',
    'bark',
    'bay',
    'beer',
    'beet',
    'bird',
    'blood',
    'boar',
    'bone',
    'breakfast',
    'breast',
    'brother',
    'castle',
    'cat',
    'cat',
    'chest',
    'chicken',
    'claw',
    'cloud',
    'coconut',
    'crime',
    'day',
    'dinner',
    'dog',
    'drink',
    'dungeon',
    'eagle',
    'ear',
    'earth',
    'egg',
    'elder',
    'enemy',
    'evening',
    'eye',
    'family',
    'father',
    'feather',
    'fight',
    'finger',
    'fire',
    'fish',
    'flesh',
    'foot',
    'forest',
    'fox',
    'friend',
    'goose',
    'grease',
    'group',
    'gulf',
    'hair',
    'hand',
    'hat',
    'hate',
    'hawk',
    'head',
    'hill',
    'horn',
    'horse',
    'house',
    'inn',
    'island',
    'jaw',
    'lake',
    'leaf',
    'leg',
    'liver',
    'louse',
    'love',
    'lunch',
    'man',
    'many',
    'meal',
    'metal',
    'mine',
    'monster',
    'moon',
    'morning',
    'mother',
    'mountain',
    'mouth',
    'name',
    'neck',
    'night',
    'noodle',
    'nose',
    'ocean',
    'owl',
    'parent',
    'path',
    'peace',
    'pepper',
    'person',
    'pie',
    'pig',
    'rabbit',
    'rain',
    'rat',
    'river',
    'robe',
    'rock',
    'root',
    'salt',
    'sand',
    'seed',
    'sibling',
    'sister',
    'skin',
    'sky',
    'smoke',
    'snake',
    'soup',
    'star',
    'stew',
    'stomach',
    'stone',
    'stream',
    'sun',
    'sword',
    'tail',
    'tavern',
    'thumb',
    'tongue',
    'tooth',
    'tree',
    'truth',
    'uncle',
    'valley',
    'war',
    'water',
    'way',
    'wine',
    'wolf',
    'ant',
    'antelope',
    'ape',
    'badger',
    'bat',
    'bear',
    'beaver',
    'bee',
    'beetle',
    'bison',
    'buffalo',
    'butterfly',
    'camel',
    'chimpanzee',
    'chipmunk',
    'clam',
    'cow',
    'coyote',
    'crab',
    'crocodile',
    'crow',
    'deer',
    'dolphin',
    'donkey',
    'dove',
    'duck',
    'eel',
    'elephant',
    'elk',
    'falcon',
    'ferret',
    'flea',
    'flamingo',
    'fly',
    'frog',
    'giraffe',
    'goat',
    'gorilla',
    'grasshopper',
    'hamster',
    'hare',
    'hedgehog',
    'hippo',
    'hyena',
    'jellyfish',
    'kangaroo',
    'ladybug',
    'lamb',
    'leopard',
    'lion',
    'lizard',
    'llama',
    'lobster',
    'mole',
    'moose',
    'mosquito',
    'moth',
    'mouse',
    'mule',
    'newt',
    'octopus',
    'ostrich',
    'otter',
    'oyster',
    'ox',
    'panda',
    'panther',
    'parrot',
    'peacock',
    'pelican',
    'penguin',
    'pigeon',
    'porcupine',
    'puma',
    'raccoon',
    'reindeer',
    'rhinoceros',
    'robin',
    'raven',
    'salmon',
    'scallop',
    'scorpion',
    'seagull',
    'seal',
    'shark',
    'sheep',
    'shrimp',
    'skunk',
    'sloth',
    'slug',
    'snail',
    'sparrow',
    'spider',
    'squid',
    'squirrel',
    'starfish',
    'stork',
    'swan',
    'tick',
    'tiger',
    'toad',
    'tortoise',
    'trout',
    'turkey',
    'turtle',
    'vulture',
    'walrus',
    'wasp',
    'weasel',
    'whale',
    'worm',
    'yak',
    'zebra',
    'woman',
    'word',
  ];
}

function themedNumbers(): string[] {
  return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
}

function themedPronouns(): string[] {
  return ['he', 'she', 'they', 'you', 'we', 'I'];
}
