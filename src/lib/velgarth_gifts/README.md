# Velgarth gifts

This library generates **Gifts** — the psychic talents of Mercedes Lackey's Velgarth setting
(Mindspeech, Farsight, Fetching, and the rest) — each at a rolled strength level, for a character in
a game set there.

A generated character gets several Gifts, and no Gift twice: each pick is removed from the pool
before the next, so a set of three is three different talents rather than the same one thrice.

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
