

export const index = 25;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/starsystem/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/25.892fd676.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.fb862136.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.bc35c0e5.js","_app/immutable/chunks/star-svg.b31eba91.js","_app/immutable/chunks/index.f3af019b.js","_app/immutable/chunks/generator.775bde6b.js","_app/immutable/chunks/invented.cdb7d2ec.js","_app/immutable/chunks/generator.b0badc40.js"];
export const stylesheets = ["_app/immutable/assets/25.2d7485ad.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
