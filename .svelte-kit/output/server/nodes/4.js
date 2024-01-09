

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/changelog/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.82cda37b.js","_app/immutable/chunks/scheduler.4deff733.js","_app/immutable/chunks/index.40f68b98.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.73ca7fb2.js","_app/immutable/chunks/index.a61fa5dd.js"];
export const stylesheets = [];
export const fonts = [];
