

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/chopshop/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.742848eb.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/index.618f0eea.js"];
export const stylesheets = ["_app/immutable/assets/5.02be2b4b.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
