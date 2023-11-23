

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/planet/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.cf77c0d6.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.00caca3d.js","_app/immutable/chunks/globals.7f7f1b26.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.ca3c12b8.js","_app/immutable/chunks/generator.0f7cf2f5.js","_app/immutable/chunks/lodash.46f0247c.js","_app/immutable/chunks/index.a9e36f3b.js","_app/immutable/chunks/generator.fa10e5c4.js"];
export const stylesheets = ["_app/immutable/assets/20.5481a865.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
