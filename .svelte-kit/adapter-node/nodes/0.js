

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.l9_yElg7.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/index.EoApDFme.js","_app/immutable/chunks/index.BUy5jdpj.js"];
export const stylesheets = ["_app/immutable/assets/0.5jD2ITHM.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.UkEzIPvB.woff2","_app/immutable/assets/azonix-webfont.snBqetzM.woff2"];
