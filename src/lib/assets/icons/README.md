# Icons

455 icons from SunGraphica's **600 Minimal Icons** pack, licensed for commercial use. **The
licence requires that SunGraphica is credited**, which `src/components/layout/Footer.svelte`
does on every page. Do not remove that credit. `SUNGRAPHICA-info.txt` is the vendor's own
information file, kept as the licence record.

These are **not** vendored from `ironarachne/ironarachne_branding` and are not in
`brand-assets.json`. The pack was bought for this app, so it is not a brand asset and there is
no upstream to sync from — unlike the fonts and the palette, editing a file here is allowed.

## Layout

One directory per sheet in the original pack, because the sheets are the pack's own grouping
and a flat directory of 455 files is not navigable:

```
set1/       87  interface: media controls, arrows, files, sound, social marks
set2/       99  fantasy/RPG: shields, potions, weapons, scrolls, armour, camping
set3/       85  modern: sports, vehicles, weapons, money, animals, people
keyboard/   89  keycaps: letters, digits, modifiers, arrows
controller/ 49  gamepad buttons: face buttons, D-pads, shoulders, sticks
emoji/      25  faces
food/       21  food and drink
```

`icons.json` indexes every file: its sheet, its name, the sheet cell it came from, and how it
was named. Nothing in the app reads it — it is there so the next person can tell a name that
was verified from one that was eyeballed.

## Using one

```svelte
<script lang="ts">
  import shield from '$lib/assets/icons/set2/shield.svg?raw';
</script>

<span class="icon">{@html shield}</span>
```

Import with `?raw` and inline it rather than using `<img src>`. An icon is drawn through a mask
and painted with `currentColor`, so inlined it takes the colour of whatever it sits in and the
surface shows through its holes; as an `<img>` it cannot do either.

Each file carries `width="24" height="24"` and a `viewBox` cropped to the artwork. Override the
size in CSS (`width: 1em`), not by editing the file.

## How they were made

The pack ships seven SVG sprite sheets, not individual files — every icon in one sheet, laid on
a grid over a dark background plate. Splitting them needed three things that are worth writing
down, because all three were wrong on the first attempt:

1. **Segmentation.** Sets 1-3 and keyboard sit on a regular lattice, so elements are assigned to
   grid cells; that survives two icons whose ink boxes touch, which proximity clustering does
   not. The three presentation sheets (controller, emoji, food) have irregular layouts and are
   clustered by proximity instead.

2. **Polarity.** Most sheets draw an icon as a white tile with the glyph knocked _out_ of it. The
   glyph is the icon and the tile is presentation — so the tile is dropped and the remaining
   shapes read inside-out. The controller sheet's icons really are solid white, so it is left
   alone; the decision is made per sheet by vote, because a single solid glyph with a speck of
   detail on it is indistinguishable from a tile when you only look at one cell.

3. **Knockouts.** The dark shapes are holes, not dark ink — the pack's own PNG exports are
   transparent there. So an icon is emitted as a `<mask>` with one `currentColor` rect painted
   through it, rather than as a dark fill that would only look right on one background.

Names come from the pack's per-icon PNG exports, matched to each extract by comparing the
rendered images. 447 of 455 were matched that way, the worst at a distance of 0.05, which is
close enough to be certain. The other 8 are named in `icons.json` as `by-eye` or
`split-by-eye`: the PNG exports simply do not include them.
