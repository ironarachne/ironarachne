

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.355b3a4f.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/entries.68bf0499.js","_app/immutable/chunks/index.bff09739.js"];
export const stylesheets = [];
export const fonts = [];
