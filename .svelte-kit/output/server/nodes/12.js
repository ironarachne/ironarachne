

export const index = 12;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/family/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/12.0a8133b5.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.fb862136.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/characters.9721947f.js","_app/immutable/chunks/size_matrix.c83ff48a.js","_app/immutable/chunks/index.bc35c0e5.js","_app/immutable/chunks/dice.1d6e7e69.js","_app/immutable/chunks/index.f3af019b.js","_app/immutable/chunks/human.b0573b7b.js","_app/immutable/chunks/generic_name_generator.ad22754c.js","_app/immutable/chunks/invented.cdb7d2ec.js","_app/immutable/chunks/generator.b0badc40.js"];
export const stylesheets = ["_app/immutable/assets/12.07aad50d.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
