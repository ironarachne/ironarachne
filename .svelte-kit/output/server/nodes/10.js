

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dungeon/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.aaf8ce19.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.776ff577.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.57f82600.js","_app/immutable/chunks/index.c74e36a8.js","_app/immutable/chunks/index.d820e4cb.js","_app/immutable/chunks/index.8e2b09a8.js","_app/immutable/chunks/random.5c9619ef.js","_app/immutable/chunks/climates.96c9ab4f.js","_app/immutable/chunks/lodash.bdb9e94d.js","_app/immutable/chunks/fantasy.215bf1b8.js","_app/immutable/chunks/human.427d1a4a.js","_app/immutable/chunks/generic.55332f48.js","_app/immutable/chunks/invented.eb81ccc9.js","_app/immutable/chunks/generator.a22b2b4e.js","_app/immutable/chunks/agecategories.5eb125c9.js","_app/immutable/chunks/dice.e9c7ebe7.js","_app/immutable/chunks/premadeconfigs.98ffdca2.js","_app/immutable/chunks/common.522ae1dc.js","_app/immutable/chunks/patterns.b5805ddf.js"];
export const stylesheets = ["_app/immutable/assets/10.8a41af8e.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
