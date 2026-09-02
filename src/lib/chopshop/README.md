# Chop shop

Procedural blurb text for the cybernetic chop shop route: exterior, entry, product displays,
customers, and back room. A chop shop is one type, `ChopShop`, holding one paragraph — and it is
the `chop-shop` artifact kind, in the shape every Release-ready tool takes
(docs/tool-readiness.md): `rollChopShop` (the one path from a seed), `toChopShopSnapshot` and
`chopShopFromSnapshot` (the codec), `validateChopShopSnapshot` and `chopShopArtifactKind` (the
registration), `setChopShopText` (the one edit), and `chopShopToMarkdown` and `chopShopToText`
(the exports).

## Usage

```ts
import { rollChopShop, chopShopToMarkdown, generate } from '$lib/chopshop';
import { RNG } from '@ironarachne/rng';

const shop = rollChopShop('my-seed'); // { text: '...' }, the same for the same seed
chopShopToMarkdown(shop);

const text = generate(new RNG('my-seed')); // the bare paragraph, as before
```
