

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.6bc83d99.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.776ff577.js","_app/immutable/chunks/stores.5fc48046.js","_app/immutable/chunks/singletons.795eb198.js","_app/immutable/chunks/index.f70cc130.js"];
export const stylesheets = [];
export const fonts = [];
