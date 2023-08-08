

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/drug/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/7.19994403.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/index.767550a9.js","_app/immutable/chunks/index.f8fc1700.js","_app/immutable/chunks/index.bff09739.js","_app/immutable/chunks/random.e4ec5faf.js"];
export const stylesheets = ["_app/immutable/assets/7.c919e390.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
