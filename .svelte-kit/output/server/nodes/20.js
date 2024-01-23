

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/planet/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/20.kyndaqmm.js","_app/immutable/chunks/scheduler.5o8iMP-j.js","_app/immutable/chunks/index.5Vy_trRi.js","_app/immutable/chunks/each.-oqiv04n.js","_app/immutable/chunks/index.mSNu4kGi.js","_app/immutable/chunks/planet_generator_config.jkbcucVW.js","_app/immutable/chunks/index.t_3Oaqcp.js","_app/immutable/chunks/lodash.8uzXjwZ5.js","_app/immutable/chunks/generator.yfGCgLHF.js"];
export const stylesheets = ["_app/immutable/assets/20.E6TcN-dZ.css"];
export const fonts = ["_app/immutable/assets/alienleagueregular-9d3z-webfont.UkEzIPvB.woff2","_app/immutable/assets/azonix-webfont.snBqetzM.woff2"];
