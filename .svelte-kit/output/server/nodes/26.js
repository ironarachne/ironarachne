

export const index = 26;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/swn/character/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/26.45df39a2.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.618f0eea.js","_app/immutable/chunks/dice.7779eac6.js","_app/immutable/chunks/text.9d30c5a6.js"];
export const stylesheets = ["_app/immutable/assets/26.8d15af8c.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
