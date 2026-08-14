export type * from './carcass_body_plan';
export type * from './species';
export type * from './filter';
export * from './mutators';
export * from './common';
// `all` has nothing but a default export, so `export * as allSpecies` handed callers a namespace
// object whose only useful member was `.default` — the trap `entrypoints.test.ts` describes.
export { default as allSpecies } from './all';

export * as CommonSpecies from './common';
export type { default as Species } from './species';
