# Gender

This library holds the **gender** type and its pronoun set, plus the standard set of genders a
species uses by default. It is deliberately small and data-only: it decides nothing, it just gives
the rest of the codebase one place to ask "what pronoun goes here?"

Pronouns are carried as data rather than derived from a gender's name, so a species with genders
that are not male and female works without special cases anywhere else.

## Features

- **`Gender`** — a `name` and its `PronounSet`.
- **`PronounSet`** — `subjective`, `objective`, `possessive`, and `reflexive`.
- **`traditional`** — the male/female set most species use.
- **`getGenderFromSet`** — find a gender by name within a species' own set.

## Usage

```typescript
import { getGenderFromSet, traditional, type Gender } from '$lib/gender';

const genders: Gender[] = traditional();
const gender = getGenderFromSet('female', genders);

`${gender.pronouns.subjective} drew ${gender.pronouns.possessive} sword`;
```

A species carries its own `genders` list, so generators should pick from `species.genders` rather
than calling `traditional()` directly — that is what makes a species with a different set work.
