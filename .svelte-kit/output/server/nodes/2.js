

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.6ad1c363.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.2fc1e45c.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.252ac4e7.js","_app/immutable/chunks/index.bd2dd152.js"];
export const stylesheets = [];
export const fonts = [];
