

export const index = 11;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/fantasy/equipment/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/11.9Jb7tuRN.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/index.roUWO4sU.js","_app/immutable/chunks/each.6w4Ej4nR.js","_app/immutable/chunks/currency.u8azzyhR.js"];
export const stylesheets = ["_app/immutable/assets/11.lDISteXD.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.UkEzIPvB.woff2","_app/immutable/assets/azonix-webfont.snBqetzM.woff2"];
