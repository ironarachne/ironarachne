# Assets

This directory holds **static assets that are imported by code**, as opposed to the files in
`static/` that the site serves directly. It has no `index.ts` and exports nothing: it is a place for
files, not a library.

```
fonts/   # Webfonts loaded by the site's stylesheets (Cinzel Decorative, declared in styles/tokens.css)
images/  # The Iron Arachne logo and shared textures
```

## Usage

Import an asset through the `$lib` alias and let Vite handle it — that way the file is hashed,
bundled, and its URL stays correct in a production build:

```typescript
import logo from '$lib/assets/images/logo.png';
```

Artwork that belongs to one library (heraldic charges, archetype badges, species badges) lives with
that library instead. Put a file here only when more than one library needs it.
