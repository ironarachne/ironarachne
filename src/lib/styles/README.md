# Styles

This directory holds the site's **global CSS**. It has no `index.ts` and exports nothing: it is a
place for stylesheets, not a library. Component-scoped styles belong in the components themselves;
what lives here is what applies site-wide.

```
main.css        # The entry point — imports everything below, then the base element styles
reset.css       # Normalizes browser defaults
brand/          # Vendored from the brand repo: the colour palette, as --ia-* tokens
tokens.css      # Custom properties — colour roles, the type and space ramps, elevation, motion
fonts.css       # The @font-face declarations
modal.css       # The shared modal system's styles
fantasy.css     # Genre skins, applied to the panels of a project's genre
scifi.css
cyberpunk.css
horror.css
```

## Usage

`main.css` is imported once, by the root layout:

```typescript
// src/routes/+layout.svelte
import '$lib/styles/main.css';
```

Nothing else should import these files. Add a new stylesheet by putting it here and adding an
`@import` to the top of `main.css` — the import order matters, since later rules win at equal
specificity.

Define a new spacing value as a custom property in `tokens.css` rather than inline, so it is
available to components and to the genre themes alike.

## Tokens

`tokens.css` holds the whole vocabulary a component builds from: the colour roles, the six-step
type ramp, the eight-step space ramp, the elevation and corner tokens, and the one motion
duration. It is the middle of three layers, and the direction is one-way — `brand/colors.css`
below it, components above it. A role resolves to a palette alias or to a `color-mix()` of two
and never holds a hex; a component names a role or a ramp step and never reaches past this file
to `--ia-*`; a genre skin overrides a permitted subset of the roles and never touches a ramp.
`docs/visual-design.md` states the taxonomy and the reasoning; `tokens.test.ts` enforces the
parts of it that a regex can see.

## Colours

`brand/colors.css` is a copy of `tokens/colors.css` from `ironarachne/ironarachne_branding`, which
declares itself the source of truth for the palette. It is vendored through the pin in
`brand-assets.json` like the icons and fonts — **never edit it here**; change it in the brand repo
and run `scripts/sync_brand_assets.sh`. `brand/colors.json` comes along with it because the sync
copies directories name-for-name; nothing in the app reads it.

`tokens.css` then aliases those `--ia-*` tokens to the names the site uses:

```css
--gold: var(--ia-gold);
```

So a colour is written down once, and components keep the shorter names — `var(--gold)`, not
`var(--ia-gold)`. Use a new brand colour by adding an alias here; `tokens.test.ts` fails if an alias
points at a token the brand file no longer declares, since an undefined custom property fails
silently in CSS. See `docs/brand-assets.md`.
