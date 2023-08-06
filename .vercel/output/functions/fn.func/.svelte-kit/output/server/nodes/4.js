

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/changelog/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.5e6abc55.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.06c262ec.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/entries.803d219b.js","_app/immutable/chunks/index.e0b9de06.js"];
export const stylesheets = [];
export const fonts = [];
