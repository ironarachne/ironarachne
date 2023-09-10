

export const index = 22;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/species-stats/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/22.16443628.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.fb862136.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/size_matrix.c83ff48a.js","_app/immutable/chunks/index.bc35c0e5.js","_app/immutable/chunks/dice.1d6e7e69.js"];
export const stylesheets = ["_app/immutable/assets/22.4dfa52a5.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
