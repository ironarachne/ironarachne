

export const index = 9;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/dcc/character/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/9.8bbb9e33.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/index.618f0eea.js","_app/immutable/chunks/index.5a95d5f9.js","_app/immutable/chunks/human.594f293e.js","_app/immutable/chunks/generic_name_generator.a3611d1e.js","_app/immutable/chunks/invented.c3a2a930.js","_app/immutable/chunks/generator.f38009e9.js","_app/immutable/chunks/dice.7779eac6.js"];
export const stylesheets = ["_app/immutable/assets/9.3bd8e8ad.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.688e2c07.woff2","_app/immutable/assets/azonix-webfont.9240b274.woff2"];
