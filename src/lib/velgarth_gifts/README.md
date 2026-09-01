# Velgarth gifts

This library generates **Gifts** — the psychic talents of Mercedes Lackey's Velgarth setting
(Mindspeech, Farsight, Fetching, and the rest) — each at a rolled strength level, for a character in
a game set there.

A generated character gets several Gifts, and no Gift twice: each pick is removed from the pool
before the next, so a set of three is three different talents rather than the same one thrice.

## The setting, and what is not here

This is **unofficial fan content** for Mercedes Lackey's Velgarth — the world of the Heralds of
Valdemar — and is not affiliated with or endorsed by the author or her publishers.

What is represented: the ten Gifts the books name most often — Bardic, Earth-sense, Empathy,
Farsight, Fetching, Firestarting, Foresight, Healing, Mage-Gift and Mindspeech — each with five
strength bands.

**The strength levels follow the published descriptions rather than any mechanical system.** The
novels describe a Gift as weak or powerful and say what that means in practice; they do not give it
a number. The 1-to-5 scale here is this library's own, so that a rolled Gift can be sorted and
compared, and the sentence beside it is what actually says what the character can do. No game
system's statistics are implied, and none is intended.

Deliberately absent: Companions, the Heraldic Circle, lifebonds, blood-magic and the rest of the
setting's furniture. This tool answers one question — what Gifts is this character born with — and
leaves the rest of Velgarth to the person running the game.

## Features

- **`Gift`** — `name`, `description`, and numeric `strength`.
- **`GiftPossibility`** — a Gift that may be rolled, its commonality weight, and its
  `strength_levels`.
- **`GiftStrengthLevel`** — one strength band and its own commonality weight.
- **`GiftGeneratorConfig`** — the `possibilities` pool and the `min_gifts`/`max_gifts` bounds.
- **`generate`** — roll a set of Gifts from a config and an `RNG`.
- **`all`** — the Gift table, from `gift_possibilities`.

## Usage

```typescript
import { all, generate, type Gift } from '$lib/velgarth_gifts';

const gifts: Gift[] = generate({ possibilities: all(), min_gifts: 1, max_gifts: 3 }, rng);
```

Both the Gift and its strength are chosen by commonality weight, so a rare Gift at a rare strength
is doubly unlikely — which is the intent.

## Saving a set

The generator is Release-ready (issue #52), which means a rolled set can be kept:

- `velgarth_gifts_snapshot.ts` — the stored form, `{ gifts: Gift[] }`. **The description is stored
  rather than derived**, which is the opposite of what Uncharted Worlds does with a skill: a Gift's
  prose is assembled at generation time from the Gift's own sentence and the sentence for the
  strength that was rolled, so there is no table row to look it up in.
- `velgarth_gifts_artifact_kind.ts` — the `velgarth-gifts` kind. Named for the setting, because it
  is neither generic nor a game system; a saved set is named after the Gifts in it.
- `velgarth_gifts_roll.ts` — the single path from a seed to a set. `VELGARTH_MIN_GIFTS` and
  `VELGARTH_MAX_GIFTS` live here, with the reason for each beside it.
- `velgarth_gifts_editing.ts` — one function per field, each returning a new snapshot. Raising a
  strength deliberately does not rewrite the prose beside it.
- `velgarth_gifts_presentation.ts` — the set as a document, and the Markdown export written from
  it. This tool had no export of any kind before.

A set of Gifts is an artifact of its own rather than a field on a character: the character kind is
the _fantasy_ character, which knows nothing about Velgarth, and a setting's psychic talents on a
generic character payload would be a field only one setting could ever fill.
