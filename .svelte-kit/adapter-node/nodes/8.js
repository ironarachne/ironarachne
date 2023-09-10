

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/adnd/character/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.04fa9f14.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.618f0eea.js","_app/immutable/chunks/currency.8d86ca73.js","_app/immutable/chunks/dice.7779eac6.js","_app/immutable/chunks/index.5a95d5f9.js"];
export const stylesheets = ["_app/immutable/assets/8.b5b9d920.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
