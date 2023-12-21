

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/drug/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.be080b33.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.2fc1e45c.js","_app/immutable/chunks/index.a1591b4f.js","_app/immutable/chunks/index.bd2dd152.js"];
export const stylesheets = ["_app/immutable/assets/7.e27c03e6.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
