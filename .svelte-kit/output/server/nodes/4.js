

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/changelog/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.fb826007.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/entries.68bf0499.js","_app/immutable/chunks/index.bff09739.js"];
export const stylesheets = [];
export const fonts = [];
