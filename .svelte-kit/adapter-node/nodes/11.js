

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/equipment/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/11.9f1fa541.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.40f68b98.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.70b8941c.js"];
export const stylesheets = ["_app/immutable/assets/11.1f2249e2.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
