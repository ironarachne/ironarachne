# Languages library

Procedural **constructed language** generation and a small **translation layer** between simple English clauses and the generated conlang. The code is **functional** (plain data + standalone functions), with shared types in [`language_types.ts`](language_types.ts).

## Quick start

```typescript
import { RNG } from '@ironarachne/rng';
import {
  generateConstructedLanguage,
  getDefaultLanguageGeneratorConfig,
  translateEnglishSentenceToConstructedLanguage,
  translateConstructedLanguageSentenceToEnglish,
} from '$lib/languages';

const rng = new RNG('your-seed');
const config = getDefaultLanguageGeneratorConfig(rng);
const language = generateConstructedLanguage(config);

const toConlang = translateEnglishSentenceToConstructedLanguage('the cat sees a dog', language);
if (toConlang.ok) {
  console.log(toConlang.text);
}

const toEnglish = translateConstructedLanguageSentenceToEnglish(
  toConlang.ok ? toConlang.text : '',
  language,
);
if (toEnglish.ok) {
  console.log(toEnglish.text);
}
```

Always pass an **`RNG` instance** into `getDefaultLanguageGeneratorConfig(rng)` so generation and tests stay deterministic when you reuse the same seed.

Import from **`$lib/languages`** (or [`index.ts`](index.ts)) so you get the stable public API.

## What gets generated

`generateConstructedLanguage` returns a **`ConstructedLanguage`** value:

| Field                                 | Meaning                                                             |
| ------------------------------------- | ------------------------------------------------------------------- |
| `name`                                | Capitalized label for the language                                  |
| `phonemeSetName`                      | Source inventory label (e.g. weighted English-like set)             |
| `wordOrder`                           | One of `SVO`, `SOV`, `VSO`, `VOS`, `OVS`, `OSV`                     |
| `syllableProfile` / `syllablePattern` | Syllable template used for roots                                    |
| `morphology`                          | Plural and past **affixes** and **prefix/suffix** placement         |
| `orthographySummary`                  | Short human-readable note about spelling style                      |
| `lexicon`                             | Words keyed by **English gloss** (`meaning`) and **part of speech** |
| `articleSystem`                       | How determiners map to surface articles in the conlang (see below)  |
| `possessionStrategy`                  | How possessor + possessed are ordered or marked (see below)         |

Each **`Word`** in the lexicon has a generated `root` (spelling), `pronunciation` (broad IPA-style string), `speechPart`, and `meaning` (the English lemma used for translation).

## Translation: concepts

Translation is **not** a full parser. It targets **one simple clause**:

- **Transitive:** subject noun phrase + verb + object noun phrase
- **Intransitive:** subject noun phrase + verb

### Intermediate representation (IR)

Clauses are represented as **`SimpleClauseIr`**:

- **`subject`** / optional **`object`**: **`NounPhraseIr`** — `definiteness` (`definite` | `indefinite` | `unspecified`), `headMeaning` (lexicon noun/pronoun lemma), `number`, optional **`possessor`** (**`SimplePossessorIr`**: noun lemma, number, definiteness for English glossing).
- **`verb`**: **`VerbIr`** — English verb lemma + `present` | `past`.

English input is parsed as **SVO** regardless of the conlang’s `wordOrder`. The conlang side **linearizes** the same IR using the language’s **`wordOrder`** and typology.

### Result type

**`SimpleTranslationResult`** is either `{ ok: true, text: string }` or `{ ok: false, message: string }`. Check `ok` before reading `text`.

### High-level API

- **`translateEnglishSentenceToConstructedLanguage(sentence, language)`** — English string → conlang string.
- **`translateConstructedLanguageSentenceToEnglish(sentence, language)`** — conlang string → English SVO string.

### Lower-level pipeline

You can reuse pieces for custom tooling:

1. **`buildLexiconTranslationIndex(lexicon)`** — meaning-key lookups and POS lists.
2. **`parseEnglishSimpleClause(sentence, index)`** — English → `SimpleClauseIr` or error.
3. **`linearizeSimpleClauseIrToConlang(language, clause, index)`** — IR → conlang string.
4. **`parseConlangSimpleClauseToIr(sentence, language, index)`** — conlang → IR or error.
5. **`linearizeSimpleClauseIrToEnglish(clause)`** — IR → English (SVO, with basic agreement).

**`tokenizeSimpleSentence`** normalizes whitespace and strips light punctuation from tokens.

## Article and possession typology

The library separates **semantic definiteness** in the IR from **how the conlang spells it**.

### `articleSystem`

- **`none`** — No article morphemes are emitted in the conlang; definiteness is still tracked for English glossing when round-tripping through IR.
- **`definite_and_indefinite`** — Maps definite/indefinite to your lexicon’s **the** / **a** entries (same idea as English).
- **`definite_only`** — Only definite NPs get an article token; indefinite NPs have no article in the conlang.

Helpers: **`shouldEmitArticleForDefiniteness`**, **`conlangExpectsArticleToken`**, **`englishArticleMeaningForDefiniteness`**.

### `possessionStrategy`

- **`{ kind: 'none' }`** — Possessor is **not** serialized in the conlang (only the possessed head). English can still use possessive input; the conlang output is lossy for possession.
- **`{ kind: 'juxtapose_possessor_before' }`** — Possessor root(s), then possessed head (optional possession marker strategy below is separate).
- **`{ kind: 'juxtapose_possessor_after' }`** — Possessed head, then possessor.
- **`{ kind: 'marker_on_possessed', affix, placement }`** — Possessor before the possessed; possessed noun carries an extra affix (like an alienability marker).

English possessives on the subject/object use a **`cat's`** token (ASCII apostrophe + `s`) plus the head noun; see **`english_possessive_parse.ts`**.

## Phonology and word building

- **`phonemes.ts`** / **`phonemeset.ts`** / **`phonemesets.ts`** — Phoneme inventories and weighted sets used when generating roots.
- **`morpheme.ts`** — Morpheme lists and **weighted grapheme** choice for transcriptions (`getMorphemeTranscription` needs an `RNG`).
- **`generator.ts`** — Syllable templates, hiatus handling, plural/past/possession-marker affixes, and language **name** generation.

## Lexicon

**`createLexicon()`** builds the default lexicon (nouns, verbs, articles, pronouns, etc.) with English **`meaning`** strings. **`getLexiconWordsBySpeechPart`** filters by POS.

Translation only recognizes vocabulary that exists in that lexicon (plus a small set of English verb/noun inflection heuristics in **`english_verb_lemma.ts`** and **`english_noun_lemma.ts`**).

## Word order helpers

**`getClauseConstituentOrderForWordOrder(wordOrder)`** returns the order of **`subject`**, **`verb`**, and **`object`** slots for that typology. Used internally by the conlang linearizer and parser.

## Tests

Vitest tests live beside the code:

- **`language_generation.test.ts`** — Determinism and generator output shape.
- **`language_translation.test.ts`** — Round-trip translation, possessive parse, article/possession edge cases.
- **`language_typology.test.ts`** — Article emission rules.

Run: `npm test -- --run src/lib/languages/`

## Limitations

- **Closed vocabulary** — Only lexicon meanings can appear in translations.
- **Single clause** — No embedding, questions, negation, or complex NPs beyond optional possessive + determiner.
- **English parse** — SVO only; irregular English is only partially covered.
- **Conlang parse** — Expects tokens in an order consistent with the language’s **`wordOrder`** and **`possessionStrategy`**; ambiguous noun sequences can be mis-parsed.
- **Possession `none`** — Conlang string does not encode the possessor; round-trip English may omit the possessor when translating back from conlang.

For a small interactive demo, see the **`/language`** route in the app.
