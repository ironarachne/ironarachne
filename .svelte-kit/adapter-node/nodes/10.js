

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dungeon/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.2c821690.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.06c262ec.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.4403ce33.js","_app/immutable/chunks/index.d6e945a3.js","_app/immutable/chunks/index.401ef785.js","_app/immutable/chunks/index.e0b9de06.js","_app/immutable/chunks/random.7fb76a35.js","_app/immutable/chunks/climates.bafebbfd.js","_app/immutable/chunks/lodash.01cbbf45.js","_app/immutable/chunks/fantasy.7019879b.js","_app/immutable/chunks/human.059a5398.js","_app/immutable/chunks/generic.b054d0c6.js","_app/immutable/chunks/invented.fe3e7ecd.js","_app/immutable/chunks/generator.bf15a5c8.js","_app/immutable/chunks/agecategories.edd7225e.js","_app/immutable/chunks/dice.9515b5e5.js","_app/immutable/chunks/premadeconfigs.5202e86f.js","_app/immutable/chunks/common.fee95659.js","_app/immutable/chunks/patterns.db16459b.js"];
export const stylesheets = ["_app/immutable/assets/10.8a41af8e.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
