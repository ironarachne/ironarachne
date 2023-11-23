

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.eac56511.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.ffc0792f.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.b3b07795.js","_app/immutable/chunks/index.f6302111.js"];
export const stylesheets = [];
export const fonts = [];
