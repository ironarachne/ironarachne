// `character.ts` and `starship.ts` both export `generate`, `Weapon`, and `formatAsText`, so each
// is namespaced rather than starred. That is also how the components consume them today:
// `import * as CharGen from '$lib/swn/character'`.
export * as characters from './character';
export * as starships from './starship';
export * from './render_swn_character_pdf';
