

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.6442b8e2.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.776ff577.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/entries.002d1f59.js","_app/immutable/chunks/index.8e2b09a8.js"];
export const stylesheets = [];
export const fonts = [];
