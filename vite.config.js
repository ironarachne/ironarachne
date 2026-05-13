import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [sveltekit(), glsl()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
    },
  },
});
