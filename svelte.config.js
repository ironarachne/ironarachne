import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // `fallback` writes the app shell to build/404.html, which static hosts serve
    // as their error document — so an unknown URL renders the site's own error
    // page instead of the host's. Real routes are still prerendered per route.
    adapter: adapter({ strict: true, fallback: '404.html' }),
    alias: {
      $components: './src/components',
    },
  },
};

export default config;
