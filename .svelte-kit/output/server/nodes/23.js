

export const index = 23;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/spooky-ship/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/23.1f3d1d1b.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.ffc0792f.js","_app/immutable/chunks/index.7337e42a.js","_app/immutable/chunks/index.f6302111.js"];
export const stylesheets = ["_app/immutable/assets/23.4db56798.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
