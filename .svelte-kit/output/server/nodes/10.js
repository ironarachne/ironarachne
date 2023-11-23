

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dungeon/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.39043b4d.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.00caca3d.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.3b534c54.js","_app/immutable/chunks/index.ca3c12b8.js","_app/immutable/chunks/index.a9e36f3b.js","_app/immutable/chunks/characters.ca960b34.js","_app/immutable/chunks/size_matrix.4f429caf.js","_app/immutable/chunks/dice.0940f7c9.js","_app/immutable/chunks/lodash.46f0247c.js","_app/immutable/chunks/generator.fa10e5c4.js","_app/immutable/chunks/generator_sets.aadb63f7.js","_app/immutable/chunks/premade_configs.f4c12be1.js","_app/immutable/chunks/climates.8c6e9d5c.js","_app/immutable/chunks/patterns.d3a04440.js"];
export const stylesheets = ["_app/immutable/assets/10.8a41af8e.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
