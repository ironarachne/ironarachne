// `export *`, not `export type *`: legacy_adoption_types.ts also holds the record's version
// constant, and a type-only re-export would turn it into something callers cannot read.
// See CODE_STYLE.md.
export * from './legacy_adoption';
export * from './legacy_adoption_saved_state';
export * from './legacy_adoption_types';
export * from './legacy_saves';
