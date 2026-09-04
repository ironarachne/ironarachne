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

## Saving a language

The language generator is Release-ready (issue [#74](https://github.com/ironarachne/ironarachne/issues/74)), which means everything it produces can be kept:

- [`language_snapshot.ts`](language_snapshot.ts) — the stored form. It is very nearly the identity function, because a `ConstructedLanguage` carries no closures; the module says so explicitly rather than leaving a reader to wonder what was stripped. The `Map`s and `Set`s this library uses live in the translation machinery, which builds them from a language rather than storing them in one.
- [`language_artifact_kind.ts`](language_artifact_kind.ts) — the `language` kind: validation, the payload version, and what to call an artifact whose language was never named.
- [`language_roll.ts`](language_roll.ts) — the single path from a seed to a language. Both the generator page and a re-roll from the vault go through it.
- [`language_editing.ts`](language_editing.ts) — one function per field, each returning a new snapshot. Nothing recomputes anything, and `filterLexicon` is what makes a 1,760-word glossary editable at all.
- [`language_presentation.ts`](language_presentation.ts) — the language as a document, and the Markdown and PDF exports written from it. Empty sections are dropped here rather than in each renderer.

**The lexicon is stored whole rather than regenerated from the seed.** A user who renames one word has edited the language, and requirement 4.2 of [the readiness spec](../../../docs/workshop.md#tool-release-readiness) says a seed may not overrule that. Regeneration is a re-roll, and a re-roll is the destructive command.

The size is measured rather than feared: a generated language is **1,760 words and about 144 KB of JSON**. That is the largest payload the site stores, and still two orders of magnitude below the point at which [`$lib/storage_status`](../storage_status/README.md) says anything — it warns at 80% of what `navigator.storage.estimate()` reports.

**This is the kind [#28](https://github.com/ironarachne/ironarachne/issues/28) declined to mint, and minting it now is not a reversal.** #28 warned that naming a kind after a language and storing only the `NameGeneratorSet` a culture consumes would be expensive to undo. This kind stores the larger thing whole, so that mismatch cannot arise. What #28 left open stays open: a culture still owns its `nameGenerators` outright, there is no `payloadVersion` step for culture, and whether a _name-generator set_ deserves a kind of its own is still the smaller question to ask if settlement, region, family and character ever justify it.

For a small interactive demo, see the **`/language`** route in the app.
