

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.7d885706.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.2fc1e45c.js","_app/immutable/chunks/stores.202c0320.js","_app/immutable/chunks/singletons.4e9132d9.js","_app/immutable/chunks/index.784fc232.js"];
export const stylesheets = [];
export const fonts = [];
