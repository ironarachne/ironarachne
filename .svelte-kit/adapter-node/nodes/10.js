

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dungeon/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.1c8f3959.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.ab0cc1c7.js","_app/immutable/chunks/index.767550a9.js","_app/immutable/chunks/index.f8fc1700.js","_app/immutable/chunks/index.bff09739.js","_app/immutable/chunks/random.e4ec5faf.js","_app/immutable/chunks/climates.ca050672.js","_app/immutable/chunks/generatorconfig.a85b5b6e.js","_app/immutable/chunks/agecategories.0d4c2ee4.js","_app/immutable/chunks/dice.a88d345c.js","_app/immutable/chunks/generic.c438f380.js","_app/immutable/chunks/invented.bc2014e8.js","_app/immutable/chunks/generator.eb398e7b.js","_app/immutable/chunks/human.473dacc8.js","_app/immutable/chunks/premadeconfigs.0dc13e07.js","_app/immutable/chunks/common.f02424f4.js","_app/immutable/chunks/patterns.3a59fffc.js"];
export const stylesheets = ["_app/immutable/assets/10.8a41af8e.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
