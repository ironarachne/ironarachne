

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/starsystem/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/25.f50d6342.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.767550a9.js","_app/immutable/chunks/index.f8fc1700.js","_app/immutable/chunks/random.e4ec5faf.js","_app/immutable/chunks/star-svg.9a8a8610.js","_app/immutable/chunks/index.bff09739.js","_app/immutable/chunks/generator.fbebd77f.js","_app/immutable/chunks/invented.bc2014e8.js","_app/immutable/chunks/generator.eb398e7b.js"];
export const stylesheets = ["_app/immutable/assets/25.2d7485ad.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
