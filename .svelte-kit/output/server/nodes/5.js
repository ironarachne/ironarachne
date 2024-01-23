

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/chopshop/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.JHfi0SJV.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/index.5Vy_trRi.js","_app/immutable/chunks/index.mSNu4kGi.js"];
export const stylesheets = ["_app/immutable/assets/5.l0aMBtgW.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.UkEzIPvB.woff2","_app/immutable/assets/azonix-webfont.snBqetzM.woff2"];
