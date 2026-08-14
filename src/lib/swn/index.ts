// `character.ts` and `starship.ts` both export `generate`, `Weapon`, and `formatAsText`, so each
// is namespaced rather than starred. That is also how the components consume them:
// `import { characters as CharGen } from '$lib/swn'`.
export * as characters from './character';
export * as starships from './starship';
export * from './render_swn_character_pdf';

// Named for the same reason: starring the types would re-collide the names the namespaces exist to
// keep apart.
export type { SWNCharacter } from './character';
export type { SWNStarship } from './starship';
