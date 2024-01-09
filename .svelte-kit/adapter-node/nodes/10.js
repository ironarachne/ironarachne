

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dungeon/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.83c9cda4.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.40f68b98.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.8e2112d0.js","_app/immutable/chunks/index.960e07c4.js","_app/immutable/chunks/index.a61fa5dd.js","_app/immutable/chunks/characters.38564557.js","_app/immutable/chunks/size_matrix.e52d484f.js","_app/immutable/chunks/dice.f60f190e.js","_app/immutable/chunks/lodash.50d9611c.js","_app/immutable/chunks/generator.eff4fd77.js","_app/immutable/chunks/generator_sets.83f0f629.js","_app/immutable/chunks/premade_configs.822d4812.js","_app/immutable/chunks/climates.327e0d8d.js","_app/immutable/chunks/patterns.88c2829e.js"];
export const stylesheets = ["_app/immutable/assets/10.e1d31e86.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
