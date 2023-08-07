

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/chopshop/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.93484a2a.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.776ff577.js","_app/immutable/chunks/index.c74e36a8.js","_app/immutable/chunks/index.d820e4cb.js","_app/immutable/chunks/random.5c9619ef.js"];
export const stylesheets = ["_app/immutable/assets/5.02be2b4b.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
