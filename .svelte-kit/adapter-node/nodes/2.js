

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.75fe6d28.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.40f68b98.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.73ca7fb2.js","_app/immutable/chunks/index.a61fa5dd.js"];
export const stylesheets = [];
export const fonts = [];
