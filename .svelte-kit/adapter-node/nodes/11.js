

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/equipment/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/11.24c5653a.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.00caca3d.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.daad04d2.js"];
export const stylesheets = ["_app/immutable/assets/11.3b8b1d73.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
