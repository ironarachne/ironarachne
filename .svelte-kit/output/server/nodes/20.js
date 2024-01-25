

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/planet/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.KYQzL3o1.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/index.roUWO4sU.js","_app/immutable/chunks/each.6w4Ej4nR.js","_app/immutable/chunks/index.Zx8RnaKC.js","_app/immutable/chunks/planet_generator_config.oDsD_dbW.js","_app/immutable/chunks/index.ag_JRNvT.js","_app/immutable/chunks/lodash.gXpCFBFr.js","_app/immutable/chunks/generator.zj200H-7.js"];
export const stylesheets = ["_app/immutable/assets/20.E6TcN-dZ.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.UkEzIPvB.woff2","_app/immutable/assets/azonix-webfont.snBqetzM.woff2"];
