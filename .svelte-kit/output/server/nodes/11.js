

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/equipment/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/11.1610ed41.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.2fc1e45c.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/currency.26fe46da.js"];
export const stylesheets = ["_app/immutable/assets/11.1f2249e2.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
