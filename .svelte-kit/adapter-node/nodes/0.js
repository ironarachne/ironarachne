

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.9cc50c12.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/index.f70cc130.js"];
export const stylesheets = ["_app/immutable/assets/0.72b4acb7.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
