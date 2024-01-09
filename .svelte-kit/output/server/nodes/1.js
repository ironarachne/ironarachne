

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.89653efa.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.40f68b98.js","_app/immutable/chunks/stores.3b46af39.js","_app/immutable/chunks/singletons.cc743308.js","_app/immutable/chunks/index.784fc232.js"];
export const stylesheets = [];
export const fonts = [];
