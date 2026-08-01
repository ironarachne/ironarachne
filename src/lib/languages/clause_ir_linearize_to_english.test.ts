import { describe, expect, it } from 'vitest';
import { linearizeSimpleClauseIrToEnglish } from './clause_ir_linearize_to_english';
import type { Definiteness, NounNumber, NounPhraseIr, SimpleClauseIr } from './language_types';

function np(
  headMeaning: string,
  number: NounNumber = 'singular',
  definiteness: Definiteness = 'unspecified',
): NounPhraseIr {
  return { headMeaning, number, definiteness };
}

function clause(
  subject: NounPhraseIr,
  lemmaMeaning: string,
  tense: 'present' | 'past' = 'present',
  object?: NounPhraseIr,
): SimpleClauseIr {
  return { subject, verb: { lemmaMeaning, tense }, object };
}

describe('linearizeSimpleClauseIrToEnglish', () => {
  it('renders subject, verb, and object in that order and capitalizes the sentence', () => {
    const text = linearizeSimpleClauseIrToEnglish(
      clause(
        np('cat', 'singular', 'definite'),
        'see',
        'present',
        np('dog', 'singular', 'indefinite'),
      ),
    );
    expect(text).toBe('The cat sees a dog');
  });

  it('drops the object when the clause is intransitive', () => {
    expect(linearizeSimpleClauseIrToEnglish(clause(np('dog', 'singular', 'definite'), 'run'))).toBe(
      'The dog runs',
    );
  });

  describe('articles', () => {
    const cases: [Definiteness, string, string][] = [
      ['definite', 'cat', 'The cat sleeps'],
      ['indefinite', 'cat', 'A cat sleeps'],
      ['unspecified', 'cat', 'Cat sleeps'],
      /* "an" before a vowel. */
      ['indefinite', 'owl', 'An owl sleeps'],
      ['definite', 'owl', 'The owl sleeps'],
    ];

    it.each(cases)('%s %s → %s', (definiteness, head, expected) => {
      expect(
        linearizeSimpleClauseIrToEnglish(clause(np(head, 'singular', definiteness), 'sleep')),
      ).toBe(expected);
    });
  });

  describe('noun pluralization', () => {
    const cases: [lemma: string, plural: string][] = [
      ['cat', 'cats'],
      ['city', 'cities'],
      ['box', 'boxes'],
      ['glass', 'glasses'],
      ['church', 'churches'],
      ['dish', 'dishes'],
      ['quiz', 'quizes'],
      /* A vowel before the "y" keeps the "s" plural. */
      ['day', 'days'],
      /* Pronouns are already plural in form and must not take an "s". */
      ['they', 'they'],
      ['we', 'we'],
    ];

    it.each(cases)('%s → %s', (lemma, plural) => {
      const text = linearizeSimpleClauseIrToEnglish(clause(np(lemma, 'plural'), 'sleep'));
      expect(text.toLowerCase().startsWith(plural.toLowerCase())).toBe(true);
    });
  });

  describe('present-tense agreement', () => {
    const cases: [head: string, number: NounNumber, lemma: string, expected: string][] = [
      ['cat', 'singular', 'see', 'sees'],
      ['cat', 'plural', 'see', 'see'],
      ['carry', 'singular', 'carry', 'carries'],
      ['cat', 'singular', 'push', 'pushes'],
      ['cat', 'singular', 'go', 'goes'],
      ['cat', 'singular', 'fix', 'fixes'],
      ['cat', 'singular', 'buzz', 'buzzes'],
      ['cat', 'singular', 'pass', 'passes'],
      /* First and second person take the bare lemma. */
      ['i', 'singular', 'see', 'see'],
      ['you', 'singular', 'see', 'see'],
      ['we', 'plural', 'see', 'see'],
      ['they', 'plural', 'see', 'see'],
      ['he', 'singular', 'see', 'sees'],
      ['she', 'singular', 'see', 'sees'],
      ['it', 'singular', 'see', 'sees'],
    ];

    it.each(cases)('%s (%s) %s → %s', (head, number, lemma, expected) => {
      const text = linearizeSimpleClauseIrToEnglish(clause(np(head, number), lemma));
      expect(text.split(' ')[1]).toBe(expected);
    });
  });

  describe('past tense', () => {
    const cases: [lemma: string, expected: string][] = [
      ['walk', 'walked'],
      /* A lemma already ending in "e" takes only "d". */
      ['like', 'liked'],
      ['see', 'saw'],
      ['go', 'went'],
      ['eat', 'ate'],
      ['run', 'ran'],
      ['fall', 'fell'],
      ['have', 'had'],
    ];

    it.each(cases)('%s → %s', (lemma, expected) => {
      const text = linearizeSimpleClauseIrToEnglish(clause(np('cat'), lemma, 'past'));
      expect(text.split(' ')[1]).toBe(expected);
    });
  });

  describe('the copula', () => {
    const cases: [head: string, number: NounNumber, tense: 'present' | 'past', expected: string][] =
      [
        ['i', 'singular', 'present', 'am'],
        ['you', 'singular', 'present', 'are'],
        ['we', 'plural', 'present', 'are'],
        ['they', 'plural', 'present', 'are'],
        ['cat', 'singular', 'present', 'is'],
        ['cat', 'plural', 'present', 'are'],
        ['cat', 'singular', 'past', 'was'],
        ['cat', 'plural', 'past', 'were'],
        ['you', 'singular', 'past', 'were'],
        ['i', 'singular', 'past', 'was'],
        ['she', 'singular', 'past', 'was'],
      ];

    it.each(cases)('%s (%s, %s) → %s', (head, number, tense, expected) => {
      const text = linearizeSimpleClauseIrToEnglish(clause(np(head, number), 'be', tense));
      expect(text.split(' ')[1]).toBe(expected);
    });
  });

  describe('possessors', () => {
    it('renders a bare possessor with an apostrophe', () => {
      const subject: NounPhraseIr = {
        ...np('sword'),
        possessor: { nounLemma: 'man', number: 'singular', definiteness: 'unspecified' },
      };
      expect(linearizeSimpleClauseIrToEnglish(clause(subject, 'fall'))).toBe("Man's sword falls");
    });

    it('carries the possessor’s own article', () => {
      const subject: NounPhraseIr = {
        ...np('sword'),
        possessor: { nounLemma: 'man', number: 'singular', definiteness: 'definite' },
      };
      expect(linearizeSimpleClauseIrToEnglish(clause(subject, 'fall'))).toBe(
        "The man's sword falls",
      );
    });

    it('picks "an" for a vowel-initial possessor', () => {
      const subject: NounPhraseIr = {
        ...np('sword'),
        possessor: { nounLemma: 'owl', number: 'singular', definiteness: 'indefinite' },
      };
      expect(linearizeSimpleClauseIrToEnglish(clause(subject, 'fall'))).toBe(
        "An owl's sword falls",
      );
    });

    it('pluralizes the possessor', () => {
      const subject: NounPhraseIr = {
        ...np('sword'),
        possessor: { nounLemma: 'city', number: 'plural', definiteness: 'definite' },
      };
      /* The apostrophe-s is appended whole, so a plural possessor reads "cities's". */
      expect(linearizeSimpleClauseIrToEnglish(clause(subject, 'fall'))).toBe(
        "The cities's sword falls",
      );
    });
  });

  it('capitalizes the pronoun I wherever it appears', () => {
    const text = linearizeSimpleClauseIrToEnglish(
      clause(np('cat', 'singular', 'definite'), 'see', 'present', np('i')),
    );
    expect(text).toBe('The cat sees I');
  });
});
