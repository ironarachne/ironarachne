import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults, defineConfig } from 'vitest/config';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [sveltekit(), glsl()],
  test: {
    // e2e/ holds Playwright specs, which throw if collected by Vitest.
    // Run them with `npm run test:e2e` instead.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary'],
      // Without an explicit include, v8 reports only files a test happened to load, so a
      // library nothing imports is absent from the report rather than counted as zero —
      // which is exactly the case the gate needs to see.
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts'],
      // No project-wide threshold: a few thousand uncovered lines vanish into a large
      // enough denominator, so one number cannot tell "a library has no tests" from
      // "the codebase grew". scripts/check_library_coverage.ts enforces per library
      // instead, and `npm run coverage:check` is what runs it.
    },
  },
});
