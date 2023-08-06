

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.c8ff9225.js","_app/immutable/chunks/scheduler.db8c6f43.js","_app/immutable/chunks/index.06c262ec.js","_app/immutable/chunks/singletons.2c4bb0b7.js","_app/immutable/chunks/index.f70cc130.js"];
export const stylesheets = [];
export const fonts = [];
