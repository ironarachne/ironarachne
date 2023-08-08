

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dcc/character/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/9.b8ebfca7.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.767550a9.js","_app/immutable/chunks/index.f8fc1700.js","_app/immutable/chunks/random.e4ec5faf.js","_app/immutable/chunks/index.bff09739.js","_app/immutable/chunks/human.473dacc8.js","_app/immutable/chunks/generic.c438f380.js","_app/immutable/chunks/invented.bc2014e8.js","_app/immutable/chunks/generator.eb398e7b.js","_app/immutable/chunks/dice.a88d345c.js"];
export const stylesheets = ["_app/immutable/assets/9.3bd8e8ad.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
