

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.709b92eb.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.fb862136.js","_app/immutable/chunks/stores.83138d71.js","_app/immutable/chunks/singletons.f65f876f.js","_app/immutable/chunks/index.f70cc130.js"];
export const stylesheets = [];
export const fonts = [];
