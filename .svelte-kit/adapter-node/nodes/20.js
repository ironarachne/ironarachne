

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/planet/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.9107ab06.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.2fc1e45c.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.a1591b4f.js","_app/immutable/chunks/generator.bc8d0f99.js","_app/immutable/chunks/lodash.469a5080.js","_app/immutable/chunks/index.bd2dd152.js","_app/immutable/chunks/generator.93fe7449.js"];
export const stylesheets = ["_app/immutable/assets/20.13941caa.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
