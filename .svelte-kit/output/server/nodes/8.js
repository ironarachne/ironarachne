

export const index = 8;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/adnd/character/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/8.bac2609d.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.00caca3d.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.ca3c12b8.js","_app/immutable/chunks/currency.3b534c54.js","_app/immutable/chunks/dice.0940f7c9.js","_app/immutable/chunks/index.a9e36f3b.js"];
export const stylesheets = ["_app/immutable/assets/8.b5b9d920.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
