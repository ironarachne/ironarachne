# River review artifacts (#387)

- [Alpha before](alpha-before.svg) and [Alpha after](alpha-after.svg): the existing CLI's pinned
  `alpha` region, showing the transition to solid narrow streams and saved terrain-aware channels.
- [Bravo](bravo-after.svg) and [Charlie](charlie-after.svg): additional pinned terrain maps.
- [Meanders](meanders.svg): gentle terrain with smooth curves stored in the river network.
- [Delta](delta.svg): a broad ocean mouth replaced by two conserving distributaries, with no
  duplicate full-flow main mouth.
- [Island](island.svg): a small saved land polygon within a broad lake-bound channel, retaining
  water on both sides.

The controlled examples come from `river_network.test.ts`. Their fixture deliberately exposes
geometry without terrain glyph clutter. The small island is easiest to inspect by zooming the SVG.
Native SVGs remain useful at any zoom and are review evidence rather than golden-image assertions.

See [the implemented river model](../region-rivers.md) for generation rules and validation results.
