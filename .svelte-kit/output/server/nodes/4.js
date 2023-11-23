

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/changelog/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.a270e9bf.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.00caca3d.js","_app/immutable/chunks/each.e59479a4.js","_app/immutable/chunks/dates.a78ec0fc.js","_app/immutable/chunks/index.a9e36f3b.js"];
export const stylesheets = [];
export const fonts = [];
