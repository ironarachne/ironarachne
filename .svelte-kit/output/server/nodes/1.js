

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.3954432b.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.78ffd87c.js","_app/immutable/chunks/singletons.36e6797f.js","_app/immutable/chunks/index.f70cc130.js"];
export const stylesheets = [];
export const fonts = [];
