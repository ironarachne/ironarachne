// `character.ts` and `starship.ts` both export `generate`, `Weapon`, and `formatAsText`, so each
// is namespaced rather than starred. That is also how the components consume them:
// `import { characters as CharGen } from '$lib/swn'`.
export * as characters from './character';
export * as starships from './starship';
export * from './render_swn_character_pdf';
export * from './swn_character_artifact_kind';
export * from './swn_character_editing';
export * from './swn_character_roll';
export * from './swn_character_snapshot';
export * from './swn_presentation';

// Named for the same reason: starring the types would re-collide the names the namespaces exist to
// keep apart.
export type { Focus, PsychicPick, SWNCharacter } from './character';
export type { SWNStarship } from './starship';
