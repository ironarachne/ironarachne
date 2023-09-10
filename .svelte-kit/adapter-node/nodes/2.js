

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.3e967fb7.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.85eecaf6.js","_app/immutable/chunks/index.5a95d5f9.js"];
export const stylesheets = [];
export const fonts = [];
