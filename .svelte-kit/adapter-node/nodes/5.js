

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/chopshop/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.0f6d3b89.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.40f68b98.js","_app/immutable/chunks/index.960e07c4.js"];
export const stylesheets = ["_app/immutable/assets/5.93a6f30a.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
