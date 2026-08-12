# Styles

This directory holds the site's **global CSS**. It has no `index.ts` and exports nothing: it is a
place for stylesheets, not a library. Component-scoped styles belong in the components themselves;
what lives here is what applies site-wide.

```
main.css        # The entry point — imports everything below, then the base element styles
reset.css       # Normalizes browser defaults
tokens.css      # Custom properties (colors, spacing) and the @font-face declarations
navigation.css  # Site navigation
modal.css       # The shared modal system's styles
fantasy.css     # Genre themes, applied to generated output
scifi.css
cyberpunk.css
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

Define a new colour or spacing value as a custom property in `tokens.css` rather than inline, so it
is available to components and to the genre themes alike.
