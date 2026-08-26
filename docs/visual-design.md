# The visual design system

This design document settles what Iron Arachne _looks like_: the tokens every component builds
from, the rules those tokens are held to, and the decisions that would otherwise be made one
component at a time.

It is the third of the three documents that describe the application. [The workshop](workshop.md)
settled what a user's work **is** — projects, artifacts, tools. [The application
shell](app-shell.md) settled where a user **stands** while they do it — a top bar, six
destinations, a measure-capped page region. Neither settled how any of it **looks**, and that
omission is the whole of [#77](https://github.com/ironarachne/ironarachne/issues/77): the site
works and does not look finished, because spacing, type and colour are decided per component and
so nothing lines up between two pages.

**Status:** accepted. The [token taxonomy](#token-taxonomy) was reviewed and approved on
2026-08-26, which is the gate CLAUDE.md puts in front of implementation: the tokens issue can be
built from it without further design work. Nothing here is built yet — see [What this
changes](#what-this-changes) for what the implementation covers.

**Amended 2026-08-26 by [#114](https://github.com/ironarachne/ironarachne/issues/114)**, which
adds [The shell](#the-shell). That section settles the top bar, sidebar and drawer at all three
widths — detail the [control vocabulary](#control-vocabulary) left to one paragraph — and it
changes the taxonomy in one place: it names a third corner treatment, `--corner-nav`, which
[#113](https://github.com/ironarachne/ironarachne/issues/113) delivers with the rest of the corner
vocabulary. Nothing else in the approved taxonomy moves.

Written against the rough-cut mockup published from the [design
canvas](https://claude.ai/code/artifact/c2f18fd6-1a76-46bd-9044-c8cfc888befb) — five artboards:
the workshop at 1440, the phone at 390 with its drawer, genre skins, the token taxonomy, and the
control vocabulary. Where this document and the mockup disagree, this document is right: it
corrects three of the mockup's stated contrast ratios and raises one token that failed its own
target. Those corrections are noted where they occur.

## What this is not

Not a rebrand. The palette, the two typefaces and the icons are **vendored** from
`ironarachne/ironarachne_branding`, pinned in `brand-assets.json` and copied by
`scripts/sync_brand_assets.sh`. `src/lib/styles/brand/colors.css` and everything in
`src/lib/assets/fonts/` are never edited in place — a colour change is made in the brand repo and
synced. See [brand assets](brand-assets.md).

The design here is what the app _does_ with the brand. Every colour this document names is an
existing `--ia-*` entry or a stated mix of two, and there is no third place a colour value can be
written down.

## The problem

`src/lib/styles/tokens.css` is 47 lines. It aliases thirteen palette entries, maps three modal
roles, and declares `--measure`. That is a vocabulary for colour and nothing else, so:

- **Type has no scale.** `main.css` sets `h1` through `h5` with per-element sizes and a global
  `line-height: 1.75`, and every component that wants something in between picks a number. The
  workshop, the vault and a generator page do not agree on what a heading is.
- **Spacing is invented per component.** There is no ramp to be off, so nothing is off, so
  nothing lines up.
- **Controls are copied, not shared.** The literal `rgb(92, 86, 73)` button gradient is written
  out three times — in `main.css`, in `fantasy.css` and again in `modal.css` for the danger
  variant. Changing what a button looks like means finding all three.
- **There is no elevation or density language**, which is why panelled surfaces read as boxes on
  a page rather than as plates on a bench.
- **The genre skins' relationship to the base is undeclared.** `fantasy.css`, `scifi.css` and
  `cyberpunk.css` each restyle headings and re-declare the whole button. Are they a skin over one
  system or three separate looks? Today it is somewhere between, which is the answer that costs
  the most to maintain.

## Token taxonomy

A visual system persists no types, so the domain-model step lands here instead: **every token the
system defines, its role, and which tokens a component is allowed to reach for.**

Three layers, and the direction is strictly one-way:

```mermaid
classDiagram
    class Palette {
        <<vendored in brand/colors.css>>
        +ia-green
        +ia-green-acid
        +ia-charcoal
        +ia-slate
        +ia-granite
        +ia-gold
        +ia-tan
        +ia-crimson
        +eight domain accents
    }
    class Role {
        <<declared in tokens.css>>
        +surface-page, raised, inset, sunken
        +ink, ink-muted, ink-faint
        +border, border-strong
        +accent, accent-quiet
        +danger
        +focus
    }
    class Ramp {
        <<declared in tokens.css>>
        +type, six steps
        +space, eight steps
        +elevation plate, edge, lift
        +corner notch
        +motion swift
    }
    class Skin {
        <<fantasy, scifi, cyberpunk>>
        +surface tint
        +keyline colour
        +corner choice
        +accent hue
        +one ambient effect
    }
    class Component {
        <<svelte>>
    }

    Role --> Palette : resolves to, via var or color-mix
    Skin --> Role : overrides a permitted subset
    Component --> Role : references
    Component --> Ramp : references
    Component ..> Palette : forbidden
    Skin ..> Ramp : forbidden
```

This is the one place a diagram earns its keep, because the forbidden edges are the whole point
and prose states them less clearly than a crossed arrow does. The ramps below are tables rather
than diagrams; a class diagram of a list of sizes would be drawing for form's sake.

Read the diagram as four rules:

1. A **role** resolves to a palette entry, or to a `color-mix()` of two. It never holds a hex.
2. A **component** references a role or a ramp step. It never references `--ia-*` and never a hex.
3. A **skin** overrides a permitted subset of roles. It never touches a ramp.
4. Nothing reaches past a layer. `tokens.test.ts` already enforces rule 1 and half of rule 2; see
   [Enforcement](#enforcement).

### Type ramp

Six steps. Cinzel Decorative carries headings, controls and labels; Inclusive Sans carries
anything read as a sentence.

| Token         |   Size | Line height | Face                                  | Used for                         |
| ------------- | -----: | ----------: | ------------------------------------- | -------------------------------- |
| `--t-display` |   26px |        1.05 | Cinzel Decorative 700                 | Page title, one per page         |
| `--t-title`   |   20px |        1.10 | Cinzel Decorative 700                 | Generated name, bench heading    |
| `--t-heading` |   16px |        1.20 | Cinzel Decorative 700                 | Panel heading                    |
| `--t-body`    |   14px |        1.45 | Inclusive Sans                        | Prose and generated output       |
| `--t-small`   | 12.5px |        1.40 | Inclusive Sans                        | Lists, sublines, field values    |
| `--t-micro`   |   11px |        1.40 | Cinzel Decorative, +0.08em, uppercase | Labels, kickers, badges, buttons |

Two numbers do most of the work. Line height falls from today's global 1.75 to **1.45**, and the
largest step falls from 40px to **26px**. The ramp is what makes the site read tighter — not
per-component trimming, which is what produced the current state.

The ramp has to look right inside `--measure` (70ch), which is what caps prose on `section.main`.
At `--t-body` that measure is roughly 640px, which is a comfortable column; the ramp is designed
at that width, not at the full bench width.

`h1`–`h6` map onto the ramp rather than carrying sizes of their own: `h1` → `--t-display`, `h2` →
`--t-title`, `h3`/`h4` → `--t-heading`, `h5`/`h6` → `--t-micro`. Today's decorative `h3::after`
rule and `h5` bottom border go; a heading that needs separating from what follows gets a `.rule`,
which is a token-driven 1px `--border` line, not a pseudo-element that only some headings have.

### Space ramp

Eight steps, and a component may not invent a value outside them.

| Token  | Value | Typical use                         |
| ------ | ----: | ----------------------------------- |
| `--s1` |   2px | Hairline gaps, label-to-field       |
| `--s2` |   4px | Badge padding                       |
| `--s3` |   6px | Icon-to-text, chip gaps             |
| `--s4` |   8px | Gap inside a control group          |
| `--s5` |  12px | Panel padding, gap between panels   |
| `--s6` |  16px | Section spacing inside a panel body |
| `--s7` |  24px | Page padding, gap between sections  |
| `--s8` |  32px | Page-level separation, hero spacing |

Nothing above `--s8` exists. A gap that wants 48px is a layout that wants rethinking, and making
that awkward is the point.

The ramp is deliberately dense at the bottom: the difference between 2px and 8px is where a
control either reads as one object or as three, and that is exactly the range the current site has
no vocabulary for.

### Colour roles

Twelve roles. The middle column is the expression that goes in `tokens.css` — never a hex, so
`tokens.test.ts` keeps holding. The ratio is measured against `--surface-page`.

| Role               | Resolves to                                      | Contrast | Used for                                  |
| ------------------ | ------------------------------------------------ | -------: | ----------------------------------------- |
| `--surface-page`   | `var(--charcoal)`                                |        — | The page behind everything                |
| `--surface-raised` | `var(--slate)`                                   |        — | Panels, top bar, sidebar                  |
| `--surface-inset`  | `color-mix(in srgb, var(--charcoal) 80%, black)` |        — | Inputs, seed fields, wells, log rows      |
| `--surface-sunken` | `color-mix(in srgb, var(--charcoal) 60%, black)` |        — | Scroll wells behind an inset run          |
| `--border`         | `var(--granite)`                                 |        — | Every neutral keyline                     |
| `--border-strong`  | `var(--tan)`                                     |        — | Control edges, base skin keyline          |
| `--ink`            | `color-mix(in srgb, white 95%, var(--charcoal))` |   15.2:1 | Body text, headings, control labels       |
| `--ink-muted`      | `color-mix(in srgb, white 60%, var(--charcoal))` |    6.8:1 | Sublines, list detail, secondary values   |
| `--ink-faint`      | `color-mix(in srgb, white 48%, var(--charcoal))` |    4.8:1 | Labels and kickers only, never a sentence |
| `--accent`         | `var(--iron-arachne-green)`                      |   10.6:1 | Links, the active nav marker              |
| `--accent-quiet`   | `var(--gold)`                                    |    7.1:1 | Kickers, primary control edge             |
| `--danger`         | `var(--crimson)`                                 |    2.2:1 | Fills and edges — **never text**          |
| `--focus`          | `var(--acid-green)`                              |   13.4:1 | The focus ring, and nothing else          |

Three corrections to the mockup, all of them in this table:

- **`--ink-faint` was `#7b7f88`, which measures 4.16:1** — below the 4.5:1 it is held to, despite
  the mockup labelling it 4.6. It is raised to a 48% mix, measuring **4.8:1**. This is the one
  token where the mockup would have shipped a failure.
- `--ink-muted` measures **6.8:1**, not 7.1.
- `--accent-quiet` measures **7.1:1**, not 8.0.

`--danger` is listed with its ratio precisely so nobody uses it as a text colour later: crimson on
charcoal is 2.2:1 and is not readable. Destructive intent is carried by a crimson **edge and
fill** under `--ink`-coloured text.

The eight remaining palette entries — emerald, amethyst, cyan, plasma blue, magenta, and tan
outside `--border-strong` — are reached only through a genre skin or a domain marker. A component
never names one directly. `--modal-border-message` / `-error` / `-success` stay as they are; they
already follow this pattern, mapping a role onto a palette entry in one place.

### Elevation

Three levels, and depth is carried by a keyline plus a one-pixel top highlight rather than by
blur. The result reads as pressed metal at 100% zoom instead of as a floating card, which is the
difference between a bench and a web page.

| Level      | Recipe                                                                | Used for                                        |
| ---------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| **Page**   | Flat `--surface-page`, no border, no shadow                           | The page region; the bench; the main tool panel |
| **Raised** | `--surface-raised` + 1px `--border` + `--edge` + `--lift` + `--notch` | Every panel: rail, log, vault card, modal       |
| **Inset**  | `--surface-inset` + 1px `--border` + inward shadow                    | Inputs, seed fields, scroll wells, log rows     |

Supporting tokens:

- `--plate` — the control gradient, `linear-gradient(180deg, …)` from a 4%-white mix of slate to a
  6%-black mix. This replaces the three copies of `rgb(92, 86, 73)`.
- `--edge` — `inset 0 1px 0 rgb(255 255 255 / 7%)`, the top highlight that makes a plate a plate.
- `--lift` — `0 1px 0 rgb(0 0 0 / 60%), 0 6px 14px rgb(0 0 0 / 35%)`, the one shadow in the system.
- `--notch` — the corner vocabulary: a 9px cut on the top-right and bottom-left, as a `clip-path`
  polygon. Controls use a 7px cut of the same shape (`--corner-control`), and a nav item a 7px cut
  of both corners on one edge (`--corner-nav`, added by [the shell](#the-nav-corner-is-a-third-treatment)).
  **These are the only three corner treatments**; a skin picks between cut, bevelled and square
  from this vocabulary rather than inventing one.

**Density.** A panel differs from the page by surface, keyline and notch — not by padding, which
is `--s5` everywhere. The bench differs from a panel by having no surface at all: it is the page,
and the panels sit on it. The main tool panel likewise has no surface of its own, which is why a
genre skin reaches it only through the output it holds.

**Border or shadow?** The **border carries it.** `--lift` exists so a raised plate does not float
against the page, but a panel is identified by its keyline and its notch. This matters for the
skins: a border colour is something a skin can change safely, where a shadow that changed per
genre would make panels sit at different heights beside each other.

### Motion

- `--motion-swift` — 120ms. Every hover and press transition uses it; nothing in the interface
  animates for longer.
- Ambient genre motion is capped at **one effect per skin** and is disabled entirely under
  `prefers-reduced-motion: reduce`.

Today's shimmer, pulse and glitch live on headings, which means the type moves while it is being
read. They move to the panel surface instead. See [decision 2](#2-genre-skins-are-a-permitted-subset-not-a-second-look).

## Decisions taken here

These are the items [#77](https://github.com/ironarachne/ironarachne/issues/77) and
[#112](https://github.com/ironarachne/ironarachne/issues/112) ask to be settled rather than left
open. Each is stated either way, with the reason, because an undecided item is how a second system
gets built later.

### 1. Dark mode is the only mode

**The app is dark-only.** There is no light theme and no toggle.

The brand green is a dark-surface colour: `brand/colors.css` measures it at 1.57:1 on white and
records "never set green text on white". `--ia-green-acid` is worse at 1.24:1. The palette carries
no light-surface pair for either, so a light mode could not use the brand's own accent — it would
need a second accent, a second focus colour and a second set of role mappings, which is a second
design system wearing the same logo.

Note that `brand/colors.css` does contain a `prefers-color-scheme: dark` block that flips
`--ia-surface` and `--ia-ink`. That block is the **brand file's** business and is vendored; the app
does not read `--ia-surface`, and the roles above pin `--surface-page` to charcoal unconditionally.
The app is dark on a light-preference device, which is correct and deliberate.

### 2. Genre skins are a permitted subset, not a second look

`fantasy.css`, `scifi.css` and `cyberpunk.css` **remain skins over the base system**, and the
subset they may touch is now explicit. A skin follows the open project's genre and reaches every
panel; the shell — top bar and sidebar — is genre-neutral by rule, so the frame never changes
shape underneath the user.

**A skin may set:**

|                |                                                              |
| -------------- | ------------------------------------------------------------ |
| **Surface**    | Panel background fill, tint and texture                      |
| **Keyline**    | Border colour, weight, and which edges carry it              |
| **Corner**     | Cut, bevelled or square, from the one shared clip vocabulary |
| **Accent hue** | The panel's chip, kicker and figure colour                   |
| **Motion**     | At most one ambient effect, off under reduced motion         |

**A skin may never touch:**

|                            |                                                           |
| -------------------------- | --------------------------------------------------------- |
| **Typeface**               | Cinzel Decorative and Inclusive Sans, in every genre      |
| **Type scale and spacing** | One ramp, so two panels stay the same height side by side |
| **Control geometry**       | Button and input size, hit target, focus ring             |
| **The shell**              | Top bar and sidebar are genre-neutral                     |
| **Contrast floor**         | A skin that cannot hit its target ratio does not ship     |

This settles the three concrete things wrong with the skins today. Each re-declares the whole
button — that goes; a skin sets an accent and a keyline and inherits the rest. Each restyles
`h1`–`h6` — that goes; the type scale is not a skin's to change. And each puts its ambient effect
on heading text — the shimmer, the pulse, the glitch — where it animates words while they are
being read; the effect moves to the panel surface.

### 3. Focus and contrast are targets, not assumptions

- **Focus:** a 2px `--focus` outline at 2px offset on every interactive element. Never removed,
  never colour-only, and never replaced by a border change alone — a border change is invisible to
  someone who cannot distinguish the two colours.
- **Contrast:** every text role clears **4.5:1** against the surface it sits on. `--ink` is
  15.2:1, `--ink-muted` 6.8:1, `--ink-faint` 4.8:1 at its 11px uppercase size. `--danger` is a
  fill and an edge, not a text colour.
- **Hit target:** 28px is the visual height of a control; the tap area is padded to **44px** under
  `(pointer: coarse)`. This is what keeps `e2e/pages.mobile.spec.ts` honest at 320px rather than
  merely passing.

### 4. Sound on press does not ship

The mockup draws a per-device sound toggle beside the ambient-motion one, defaulted off. **It does
not ship**, and the toggle comes out of the control sheet.

A UI sound bed defaulted to off is a feature nobody encounters, carried by an audio asset that has
to be vendored, a preference that has to be stored per device, and a mute state that has to be
respected everywhere a button exists. Defaulted to on, it is a generator site that makes noise when
you click Generate. Neither is worth the surface area in a first pass, and nothing about the token
system forecloses adding it later — a press is already a distinct state with a distinct token.

### 5. The icon set is SunGraphica's, and the credit is a licence term

**Settled.** The pack is bought: SunGraphica's _600 Minimal Icons_, licensed for commercial use,
split into 455 individual SVGs in `src/lib/assets/icons/`. The mockup's placeholder glyphs are
replaced by it.

Three consequences the token system has to absorb:

- **The credit ships.** The licence requires SunGraphica be credited, so the footer carries it on
  every page. It is a licence term, not a courtesy, and it is not a candidate for tidying away.
- **They are not brand assets.** The pack was bought for this app, so it is not vendored through
  `brand-assets.json` and there is no upstream to sync from. It is the one class of asset here
  that may be edited in place.
- **They are filled, not stroked.** The mockup drew a 1.5px stroked house style; these are solid
  glyphs with knockouts. The stroke weight in that mockup is therefore not a rule the system
  holds anything to — it described placeholders. What the system does hold is that an icon is
  painted with `currentColor` through a mask, so it takes its colour from the role around it and
  the surface shows through its holes, on any surface and in any genre skin.

## Control vocabulary

Stated here so the tokens issue knows what the tokens are for; the geometry is settled, the markup
is not.

A **button** is a stamped plate: 28px body, `--plate` fill, 1px `--border-strong` edge, a 7px
corner cut, and Cinzel Decorative at `--t-micro` uppercase. Hover lights the keyline to `--focus`
with a faint glow; press drops it 1px into its own inset shadow and turns the label `--accent`.
Variants are **primary** (gold edge, warmer plate), **secondary** (the base plate), **quiet** (no
fill, `--border` edge, `--ink-muted` label), **destructive** (crimson edge and fill) and
**disabled** (flat, no shadow, `--ink-faint`). Sizes are the 28px default and a 24px `--sm`; an
icon button is 28×28 and square, because a cut corner on a 28px square eats the glyph.

An **input** is inset: `--surface-inset`, 1px `--border`, inward shadow, `--t-small`. Focus takes
the `--focus` keyline plus the ring. A seed field is the same control in a monospace face.

**Navigation** is the one shape that breaks the button rule on purpose: flush to the left edge,
square on that side, notched on the other, with the current destination taking the plate, the
`--accent` left marker and the notch. Nothing else in the app is notched on that side, so the eye
finds the current destination without reading it. [The shell](#the-shell) states the geometry,
the four states and the three widths.

**Badges** are pill-shaped, `--t-micro`, bordered in `currentColor` over `--surface-inset`.
`ToolMaturityBadge` shows experimental in `--accent-quiet` and beta in cyan; release-ready shows
nothing, which is already how it behaves.

**Modals** keep `modal.css`'s structure and lose its literals: the dialog is a raised plate, and
the danger action becomes the destructive button variant rather than a second hand-written
gradient.

## The shell

The top bar and the sidebar are the one part of the app a genre skin may never touch
([decision 2](#2-genre-skins-are-a-permitted-subset-not-a-second-look)), so the frame never
changes shape underneath the user. That makes the shell the right place to state the system
plainly: it is the same at every width and in every genre, and everything below is a recipe in
tokens with no per-genre branch.

[The application shell](app-shell.md) settled the shell's _structure_ — six destinations, three
breakpoints, what drops and in what order. None of that is reopened here. What follows is its
_look_, and it is what [#114](https://github.com/ironarachne/ironarachne/issues/114) builds.

No class diagram. The shell persists nothing and introduces no types; the model that would be
drawn is the destination list, which `NAV_DESTINATIONS` already is. Drawing it would be
[form's sake](#token-taxonomy).

### Widths are stated in pixels

`main.css` sets `html { font-size: clamp(1em, 0.909em + 0.45vmin, 1.25em) }`, a fluid root that
scales the base from roughly 14.5px to 20px with the viewport. Every `rem` in the shell is
relative to that moving target, which is why the sidebar is a different fraction of a 1280px
screen than of a 1920px one despite `width: 12rem` being one number.

The shell's widths and heights are therefore stated in `px` and applied directly. The type ramp is
already in `px`; this makes the frame agree with it. The fluid root itself is not this issue's to
remove — it affects every page, and `--measure` is in `ch`, which the root scales too — but the
shell stops depending on it.

### Top bar

44px tall at every width. That is the [hit target](#3-focus-and-contrast-are-targets-not-assumptions)
floor, and a bar that is exactly one target tall needs no separate rule to be tappable.

| Property  | Value                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Height    | 44px, fixed                                                            |
| Surface   | `--surface-raised`                                                     |
| Keyline   | 1px `--border`, bottom edge only                                       |
| Highlight | `--edge`                                                               |
| Shadow    | None — see below                                                       |
| Corner    | None — see below                                                       |
| Padding   | `--s5` inline, block padding is whatever centres a 28px lockup in 44px |
| Gap       | `--s6` at ≥768px, `--s4` below it                                      |

**No `--lift`, and this is not an omission.** The bar is a grid row, not an overlay: scrolling
happens inside the page region, so nothing ever passes underneath the bar. A shadow exists to
say "this is above that", and here there is no that. The keyline carries the separation, which
is [what the elevation model says it should](#elevation).

**No notch.** `--notch` cuts a corner off a plate that sits _on_ a surface. The bar runs to both
viewport edges, and a cut corner on an edge that has nothing beyond it reads as damage rather
than as a cut. Same for the sidebar's outer edge.

Contents map onto the ramp, replacing four hand-mixed values:

| Element             | Type        | Colour        | Replaces                            |
| ------------------- | ----------- | ------------- | ----------------------------------- |
| Lockup              | —           | —             | 28px tall (24px below 768px)        |
| Stat label (`dt`)   | `--t-micro` | `--ink-faint` | `color-mix(… --tan 55%, white 45%)` |
| Stat value (`dd`)   | `--t-small` | `--ink`       | `color: white`                      |
| Project name (link) | `--t-small` | `--accent`    | `color: white`                      |
| Date                | `--t-micro` | `--ink-faint` | `color-mix(… --tan 55%, white 45%)` |

The stat label already sets `letter-spacing: 0.04em` and `text-transform: uppercase` by hand;
`--t-micro` carries both, at `0.08em`, so the local rules go.

The drawer button is the **icon button** from the [control vocabulary](#control-vocabulary):
28×28, square, `--plate`, 1px `--border-strong`, hover lights the keyline to `--focus`. It keeps
its `☰` glyph for now — see [icons](#icons-are-not-reopened-here).

### Sidebar

Flush to the left edge of the screen, square on that side, and cut on the inner edge. Nothing
else in the app is cut on that side, so the eye finds the current destination without reading it.

| Property | ≥1200px                  | 768–1199px               | <768px (drawer)          |
| -------- | ------------------------ | ------------------------ | ------------------------ |
| Width    | 176px                    | 128px                    | `min(272px, 80vw)`       |
| Padding  | `--s5` block, `0` inline | `--s5` block, `0` inline | `--s5` block, `0` inline |
| Item gap | `--s1`                   | `--s1`                   | `--s1`                   |

Inline padding is zero at every width, because "flush to the left edge" is the whole idea: the
items themselves run edge to edge and carry their own inset padding. The surface is
`--surface-raised` with a 1px `--border` right keyline and `--edge`; no notch on the outer edge,
for the reason the bar has none.

#### A nav item

One size, at every width. Today the 768–1199px band overrides `font-size` and `padding` to fit
narrower labels; `--t-micro` is 11px uppercase Cinzel, and `RELEASE NOTES` — the longest label —
measures about 95px with its tracking, which clears the 128px column's usable width. **The ramp
deletes the mid-band override rather than restating it**, which is the ramp doing the job it
exists for.

| Property | Value                                                     |
| -------- | --------------------------------------------------------- |
| Height   | 32px (`--s3` block padding around a `--t-micro` line)     |
| Padding  | `--s5` inline-start, `--s3` inline-end, `--s3` block      |
| Type     | `--t-micro`                                               |
| Corner   | Square on the inline-start edge; `--corner-nav` otherwise |

Four states, and only one of them draws a plate:

| State       | Recipe                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rest**    | No fill, no keyline, no clip. Label `--ink-muted`.                                                                                                                        |
| **Hover**   | `--surface-inset` fill, label `--ink`, over `--motion-swift`. No keyline — one would compete with the marker.                                                             |
| **Focus**   | 2px `--focus` outline at 2px offset, on top of whatever else the item is showing. Never traded away for a fill.                                                           |
| **Current** | `--plate` fill, `--edge`, 1px `--border-strong` on the top, right and bottom edges, `--corner-nav` clip, a 3px `--accent` marker on the inline-start edge, label `--ink`. |

Current + hover is the same as current. The destination you are already on is not a target worth
lighting, and a hover state there is how a user learns that clicking it does nothing.

This replaces `linear-gradient(0deg, var(--granite) 0%, var(--tan) 100%)` with `color: black`,
which is the single element in the shell that most reads as unfinished — black ink on a tan
gradient belongs to a different system than everything around it.

**The marker is an inset shadow, not a border or a pseudo-element.** `--corner-nav` is a
`clip-path`, and a clip cuts _everything_ the element paints, borders included — so a
`border-inline-start` would be shaved at both ends by the very corners it needs to survive. An
`inset 3px 0 0 var(--accent)` is painted inside the clip on an edge the clip does not touch, and
stays a clean 3px bar for the item's full height. A pseudo-element would work too and costs a
node per destination for the same result.

#### The nav corner is a third treatment

[Elevation](#elevation) says `--notch` and `--corner-control` are the only two corner treatments.
That was written before this section, and it is now wrong by one: the nav item is _square on one
side and cut on the other_, which is neither of them. `--notch` cuts diagonally opposite corners
(top-right, bottom-left); the nav item needs both corners of one edge.

```css
--corner-nav: polygon(
  0 0,
  calc(100% - 7px) 0,
  100% 7px,
  100% calc(100% - 7px),
  calc(100% - 7px) 100%,
  0 100%
);
```

7px, matching `--corner-control` rather than `--notch`'s 9px, because a nav item is the size of a
control and not the size of a panel.

**Three is the cap, and the same rule applies:** a component picks from `--notch`,
`--corner-control` and `--corner-nav`, and a skin picks between cut, bevelled and square from
that vocabulary. Inventing a fourth is what this rule exists to make awkward.

This is a change to what [#113](https://github.com/ironarachne/ironarachne/issues/113) delivers —
that issue lands `tokens.css` and its scope predates this token. `--corner-nav` goes in there with
the rest of the corner vocabulary, not into `Sidebar.svelte`.

### The drawer, below 768px

The same sidebar, in a different position. The item recipe does not change; four things around it
do.

- **It is the one place in the shell that gets `--lift`.** The drawer is `position: fixed` over
  the page — this is the one spot where something genuinely overlaps content, which is the
  condition [Elevation](#elevation) states for a shadow. The keyline still identifies it; the
  shadow says which of the two layers is in front.
- **The scrim is `--modal-backdrop`.** `+layout.svelte` writes `rgb(0 0 0 / 50%)` by hand today,
  and `tokens.css` already declares that exact value as a role for the modal system. The shell
  and the modals dim the page for the same reason, so they dim it by the same amount from the
  same place — and it takes a literal out of a component, which is what
  [Enforcement](#enforcement) is about.
- **The slide uses `--motion-swift`.** It runs at 200ms today, and the motion rule is that nothing
  animates for longer than 120ms. The `visibility` delay that keeps the drawer out of the tab
  order must read the same token, or the two fall out of step and the drawer disappears mid-slide:

  ```css
  transition:
    transform var(--motion-swift) ease,
    visibility 0s linear var(--motion-swift);
  ```

- **Hit targets grow to 44px**, as `min-height` under `(pointer: coarse)` rather than under
  `(max-width: 767px)`. The condition is the pointer, not the width — a touch laptop at 1280px
  wants the same target, and a phone plugged into a mouse does not.

Behaviour is untouched: the page region stays `inert` behind the open drawer, Escape and a scrim
tap still close it, and crossing the breakpoint still closes it from the media query rather than
from a resize handler. Those are `docs/app-shell.md`'s, and this section restyles them without
reopening them.

### The page region

`--s7` padding at ≥768px, `--s5` below it. It is `--surface-page` with no border and no shadow —
the **Page** level of [Elevation](#elevation) — and `--measure` on `section.main` is exactly as it
is. Nothing here changes which pages opt out of the measure.

### Icons are not reopened here

`docs/app-shell.md` [decision 6](app-shell.md#decisions-taken-here) dropped icons from the shell
because the brand repo had no icon set. It now has one — 455 SunGraphica glyphs, per
[decision 5](#5-the-icon-set-is-sungraphicas-and-the-credit-is-a-licence-term) — so the reason the
decision gave has expired, and the decision is still kept.

The 768–1199px band was the case for an icon rail, and the ramp removes it: one type size fits
every label in a 128px column, so the rail no longer has a problem an icon would solve. Six
glyphs chosen to sit beside a carefully drawn wordmark is work with a real chance of looking
improvised, and it would need an accessible-name story that a `title` attribute does not provide.
Nav labels are words.

This narrows [open question 1](#open-questions) rather than answering it: the six destinations
need no icons, and the control set and the tool catalog's domains still might.

## Enforcement

The rule is that no component declares a hex and no component declares a size outside these ramps.
That is the whole enforcement story, and it is testable — which is the reason it is stated this
way rather than as a style guide nobody reads.

`src/lib/styles/tokens.test.ts` already sweeps every global stylesheet and every `<style>` block
in `src/components/**`. It already asserts that `tokens.css` holds no hex and that every `--ia-*`
reference resolves. It grows with the system:

- No component declares a hex or an `rgb()`/`hsl()` literal, with `rgb(… / …%)` overlays on the
  shadow tokens the only exemption.
- No component declares a `font-size` outside the type ramp.
- No component declares a `padding`, `margin` or `gap` outside the space ramp.
- Every skin file touches only the permitted role subset from [decision
  2](#2-genre-skins-are-a-permitted-subset-not-a-second-look).

The current test asserts `aliases.length >= 16`; that number moves as roles are added, and the
assertion is worth rewriting as "every role resolves" rather than a count.

## What this changes

For the implementation issues that follow this one:

- `tokens.css` becomes the single source of the ramps and roles — it grows from 47 lines to the
  taxonomy above. `--measure` stays exactly as it is.
- `main.css` loses its per-element type sizes, its `line-height: 1.75`, its three literal button
  gradients and its decorative `h3::after` / `h5` border rules, and maps elements onto ramp steps
  instead.
- `modal.css` loses its literals and its duplicate danger gradient.
- The three skin files shrink to a permitted subset each, and their ambient effects move off type
  and onto the panel.
- Component styles reference roles and ramp steps. Every route in the page manifest is walked
  before and after: a redesign that improves five pages and breaks two is not an improvement.
- `npm run verify:all` stays green, mobile projects included — no horizontal overflow and no
  off-screen controls at any width in `MOBILE_VIEWPORTS`.
- `scripts/sync_brand_assets.sh --check` reports no drift, because nothing vendored is touched.

## Open questions

1. **Which icons the app actually uses.** The pack is in (see [decision
   5](#5-the-icon-set-is-sungraphicas-and-the-credit-is-a-licence-term)) and all 455 icons are
   split and named, but nothing maps them to the control set or the tool catalog's domains yet.
   That mapping is the tokens issue's business, not this document's.

   **Narrowed by [the shell](#icons-are-not-reopened-here):** the six nav destinations are out of
   it. They carry words, `docs/app-shell.md` decision 6 stands, and the question is now about the
   control set and the domains only.

2. **Whether `--surface-sunken` earns its place.** It is declared for scroll wells behind an inset
   run, and if the implementation finds one use for it, it should be dropped rather than kept for
   symmetry. Four surface levels is one more than the elevation model claims.
3. **Domain accent markers.** The eight unused palette entries are described as reachable "through
   a genre skin or a domain marker", but no domain marker is designed here. The tool catalog has a
   `domain` field and the mockup does not use it. Either a later document designs that, or the
   eight entries are simply unused by the app, which is also a fine answer.
