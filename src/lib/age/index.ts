// `beast_life_stages` and `dragon_life_stages` are absent because `age_categories.ts` already
// re-exports both, the same reason `size/index.ts` omits `dragon_sizes`.
export type { default as AgeCategory } from './age_category';
export * from './age_categories';
