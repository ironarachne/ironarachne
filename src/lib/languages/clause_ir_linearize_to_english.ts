import { englishArticleMeaningForDefiniteness } from './language_typology.js';
import type {
  NounNumber,
  NounPhraseIr,
  SimpleClauseIr,
  SimplePossessorIr,
  VerbIr,
} from './language_types.js';

const PRESENT_LEMMA_TO_PAST_SURFACE: Partial<Record<string, string>> = {
  go: 'went',
  see: 'saw',
  eat: 'ate',
  come: 'came',
  run: 'ran',
  fall: 'fell',
  break: 'broke',
  drink: 'drank',
  swim: 'swam',
  fight: 'fought',
  fly: 'flew',
  bite: 'bit',
  find: 'found',
  know: 'knew',
  sit: 'sat',
  sleep: 'slept',
  stand: 'stood',
  strike: 'struck',
  throw: 'threw',
  hide: 'hid',
  hold: 'held',
  have: 'had',
};

/** Renders a simple clause IR as an English SVO surface sentence. */
export function linearizeSimpleClauseIrToEnglish(clause: SimpleClauseIr): string {
  const parts: string[] = [];
  parts.push(linearizeNounPhraseToEnglish(clause.subject));
  parts.push(linearizeVerbToEnglish(clause.verb, clause.subject));
  if (clause.object) {
    parts.push(linearizeNounPhraseToEnglish(clause.object));
  }
  return capitalizeEnglishSentence(parts.join(' '));
}

function surfaceEnglishNounLemma(lemma: string, number: NounNumber): string {
  return number === 'plural' ? pluralizeEnglishLemma(lemma) : lemma.toLowerCase();
}

function linearizePossessorPhraseEnglish(possessor: SimplePossessorIr): string {
  const noun = surfaceEnglishNounLemma(possessor.nounLemma, possessor.number);
  const articleToken = englishArticleMeaningForDefiniteness(possessor.definiteness);
  const core =
    articleToken === null
      ? noun
      : articleToken === 'a'
        ? `${pickIndefiniteArticle(noun)} ${noun}`
        : `the ${noun}`;
  return `${core}'s`;
}

function linearizeNounPhraseToEnglish(np: NounPhraseIr): string {
  const head = surfaceEnglishNounLemma(np.headMeaning, np.number);
  if (np.possessor) {
    return `${linearizePossessorPhraseEnglish(np.possessor)} ${capitalizeIfPronounI(head)}`;
  }
  const articleToken = englishArticleMeaningForDefiniteness(np.definiteness);
  if (articleToken === null) {
    return capitalizeIfPronounI(head);
  }
  if (articleToken === 'a') {
    return `${pickIndefiniteArticle(head)} ${head}`;
  }
  return `the ${head}`;
}

function capitalizeIfPronounI(text: string): string {
  if (text === 'i') {
    return 'I';
  }
  return text;
}

function capitalizeEnglishSentence(sentence: string): string {
  if (sentence.length === 0) {
    return sentence;
  }
  return sentence[0].toUpperCase() + sentence.slice(1);
}

function pickIndefiniteArticle(headNoun: string): string {
  if (headNoun.length > 0 && isVowelSound(headNoun[0])) {
    return 'an';
  }
  return 'a';
}

function isVowelSound(char: string): boolean {
  return /^[aeiou]/i.test(char);
}

function pluralizeEnglishLemma(lemma: string): string {
  const lower = lemma.toLowerCase();
  if (['they', 'we', 'you', 'i', 'he', 'she', 'it'].includes(lower)) {
    return lemma;
  }
  if (lower.endsWith('y') && lower.length > 1 && !isVowelSound(lower[lower.length - 2])) {
    return `${lemma.slice(0, -1)}ies`;
  }
  if (
    lower.endsWith('s') ||
    lower.endsWith('x') ||
    lower.endsWith('z') ||
    lower.endsWith('ch') ||
    lower.endsWith('sh')
  ) {
    return `${lemma}es`;
  }
  return `${lemma}s`;
}

function linearizeVerbToEnglish(verb: VerbIr, subject: NounPhraseIr): string {
  if (verb.tense === 'past') {
    return pastSurfaceForLemma(verb.lemmaMeaning, subject);
  }
  return presentSurfaceForLemma(verb.lemmaMeaning, subject);
}

function presentSurfaceForLemma(lemma: string, subject: NounPhraseIr): string {
  if (lemma === 'be') {
    return bePresentForSubject(subject);
  }
  if (englishSubjectIsThirdSingular(subject)) {
    if (lemma.endsWith('y') && lemma.length > 1 && !isVowelSound(lemma[lemma.length - 2])) {
      return `${lemma.slice(0, -1)}ies`;
    }
    if (
      lemma.endsWith('s') ||
      lemma.endsWith('x') ||
      lemma.endsWith('z') ||
      lemma.endsWith('ch') ||
      lemma.endsWith('sh') ||
      lemma.endsWith('o')
    ) {
      return `${lemma}es`;
    }
    return `${lemma}s`;
  }
  return lemma;
}

function pastSurfaceForLemma(lemma: string, subject: NounPhraseIr): string {
  if (lemma === 'be') {
    return bePastForSubject(subject);
  }
  const irregular = PRESENT_LEMMA_TO_PAST_SURFACE[lemma];
  if (irregular) {
    return irregular;
  }
  if (lemma.endsWith('e')) {
    return `${lemma}d`;
  }
  return `${lemma}ed`;
}

function englishSubjectIsThirdSingular(subject: NounPhraseIr): boolean {
  if (subject.number === 'plural') {
    return false;
  }
  const h = subject.headMeaning.toLowerCase();
  if (h === 'i' || h === 'you' || h === 'we' || h === 'they') {
    return false;
  }
  if (h === 'he' || h === 'she' || h === 'it') {
    return true;
  }
  return subject.number === 'singular';
}

function bePresentForSubject(subject: NounPhraseIr): string {
  const h = subject.headMeaning.toLowerCase();
  if (h === 'i') {
    return 'am';
  }
  if (h === 'you' || h === 'we' || h === 'they' || subject.number === 'plural') {
    return 'are';
  }
  return 'is';
}

function bePastForSubject(subject: NounPhraseIr): string {
  if (subject.number === 'plural') {
    return 'were';
  }
  const h = subject.headMeaning.toLowerCase();
  if (h === 'you') {
    return 'were';
  }
  if (h === 'i' || h === 'he' || h === 'she' || h === 'it') {
    return 'was';
  }
  return 'was';
}
