# Word patterns

The **vocabulary the word generator's patterns are written in**, as data — the symbols, what each
one can stand for, and the syntax that is not simply a symbol.

The elements themselves belong to [`@ironarachne/word-generator`](https://www.npmjs.com/package/@ironarachne/word-generator)
and are read from it rather than copied, so this library cannot describe a vocabulary the generator
does not have. It matters: the package's own doc comment lists thirty-six symbols and the package
ships forty-five.

This library exists because of
[decision 8 of the readiness pass](../../../docs/tool-readiness.md) — a reference tool with no logic
still gets a library. `/word-generator-cheat-sheet` built its table as an HTML string inside the
component and injected it with `{@html}`, which meant its headers were unverifiable, its content
untestable, and the pattern syntax documented in three paragraphs of prose and nowhere else.

## Features

- **`patternElements()`** — every element the generator knows, as plain rows of
  `{ name, symbol, elements }`. A fresh array each call, so a caller sorting it cannot reorder the
  package's own list.
- **`PATTERN_SYNTAX`** — the rules beyond "a symbol": `(a,b,c)` chooses one of the alternatives, and
  `+` duplicates the previous character after processing.
- **`generateWords(pattern, count, seed)`** — words from a pattern, reproducibly. A blank pattern
  returns nothing rather than a list of empty strings, and empty results are dropped.
- **`clampWordCount`** / **`isBlankPattern`** — the guards the page's number and text fields need.
- **`wordPatternSheet`**, **`sheetToMarkdown`** and **`sheetToText`** — the sheet arranged for
  reading, and the two exports written from it. The page renders the same sheet.

## Usage

```typescript
import { generateWords, sheetToMarkdown, wordPatternSheet } from '$lib/word_patterns';

const words = generateWords('cvcv', 10, 'a-seed');
const markdown = sheetToMarkdown(wordPatternSheet({ pattern: 'cvcv', seed: 'a-seed', words }));
```

The sample section is left out of the sheet entirely when no pattern has been run, rather than
exported as an empty heading.
