import preprocess from 'svelte-preprocess';

export default {
  // svelte options
  extensions: ['.svelte'],
  preprocess: preprocess(),
  onwarn: (warning, handler) => handler(warning),
  // plugin options
  vitePlugin: {
    exclude: [],
    // experimental options
    experimental: {},
  },
};
