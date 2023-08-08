

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.ddc16231.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.5e3063a0.js","_app/immutable/chunks/stores.9dc89c50.js","_app/immutable/chunks/singletons.10f7045c.js","_app/immutable/chunks/index.f70cc130.js"];
export const stylesheets = [];
export const fonts = [];
