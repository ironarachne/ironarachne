

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.835a7ee9.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.fb862136.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.2c06804b.js","_app/immutable/chunks/index.f3af019b.js"];
export const stylesheets = [];
export const fonts = [];
