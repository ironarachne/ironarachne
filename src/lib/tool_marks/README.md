# Tool marks

The mark each tool domain wears. One map, one guard, no state.

See [the visual design system](../../../docs/visual-design.md), "The domain marks, which answer the
question the palette could not", for the design.

## What a mark is

A **mark** is decoration, not a name. The catalog has classified every tool by `domain` since it was
written and nothing ever showed that classification; these five glyphs are the showing. They are
`aria-hidden` wherever they render — the domain is already in the heading above the group, and
announcing it once per row is noise a reader cannot skip.

That makes them the classifier exception to the one-mark-per-surface rule: a mark repeats beside
every tool in a list because repeating is what classifying is.

| Domain       | Mark            |                                                         |
| ------------ | --------------- | ------------------------------------------------------- |
| `characters` | `set2/helmet-1` | A helm — a person in a game, rather than a person       |
| `factions`   | `set2/flag`     | The thing a faction plants                              |
| `locations`  | `set2/map`      | Settlements, regions, dungeons: all read off a map      |
| `objects`    | `set2/chest`    | What the objects are generated into                     |
| `utilities`  | `set2/compass`  | Instruments rather than output — dice, names, languages |

All five come from `set2`, the pack's fantasy sheet, so the family reads as one hand rather than as
five icons that happened to be available. That is also the argument for showing them at all: this is
a suite of generators for tabletop games.

## Why the map is hand-written

A lookup that resolved `set2/${domain}.svg` would need a computed import specifier, and a computed
specifier cannot be statically analysed — so all 455 icons in the pack would land in the bundle of
any page that showed one. It is the same trap `TOOL_PANELS` documents for the tool panels, and the
same answer: write the imports out.

`toolMarksCoverDomains` and `tool_marks.test.ts` are what keep a hand-written map honest. A sixth
domain cannot be added without a mark, a mark cannot outlive the domain it classifies, and no two
domains may wear the same glyph — a classifier that classifies two things as one is not one.

## Usage

```svelte
<script lang="ts">
  import { DOMAIN_MARKS } from '$lib/tool_marks';
  import Icon from '$components/common/Icon.svelte';
</script>

<Icon icon={DOMAIN_MARKS[tool.domain]} />
```

`Icon` with no `label` is a mark: hidden from the accessibility tree, and painted `--ink-faint` so
it never outshines the label it classifies.
