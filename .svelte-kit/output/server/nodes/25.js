

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/starsystem/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/25.22cb079d.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.ffc0792f.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.7337e42a.js","_app/immutable/chunks/star-svg.45890603.js","_app/immutable/chunks/index.f6302111.js","_app/immutable/chunks/generator.8036774f.js","_app/immutable/chunks/lodash.b6127185.js","_app/immutable/chunks/generator.58ac19cb.js"];
export const stylesheets = ["_app/immutable/assets/25.7fc11290.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
