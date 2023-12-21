

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dungeon/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.f5993cc4.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.2fc1e45c.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.3194128e.js","_app/immutable/chunks/index.a1591b4f.js","_app/immutable/chunks/index.bd2dd152.js","_app/immutable/chunks/characters.ad95bb70.js","_app/immutable/chunks/size_matrix.a3389459.js","_app/immutable/chunks/dice.c8d9a43a.js","_app/immutable/chunks/lodash.469a5080.js","_app/immutable/chunks/generator.93fe7449.js","_app/immutable/chunks/generator_sets.859de02c.js","_app/immutable/chunks/premade_configs.58c46439.js","_app/immutable/chunks/climates.f40958a8.js","_app/immutable/chunks/patterns.725d6c17.js"];
export const stylesheets = ["_app/immutable/assets/10.e1d31e86.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
