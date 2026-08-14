import { sveltekit } from '@sveltejs/kit/vite';
import { configDefaults, defineConfig } from 'vitest/config';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [sveltekit(), glsl()],
  test: {
    // e2e/ holds Playwright specs, which throw if collected by Vitest.
    // Run them with `npm run test:e2e` instead.
    //
    // .claude/worktrees/ holds nested git worktrees — whole second checkouts of this
    // repository. It is gitignored, so CI never sees it, but a local `npm run test`
    // otherwise collects every test file in every worktree and fails all of them with
    // "Tsconfig not found" (the nested checkout has no tsconfig resolvable from here).
    // That turns a green run into hundreds of failures that say nothing about the code.
    exclude: [...configDefaults.exclude, 'e2e/**', '.claude/worktrees/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary'],
      // Without an explicit include, v8 reports only files a test happened to load, so a
      // library nothing imports is absent from the report rather than counted as zero —
      // which is exactly the case the gate needs to see.
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/lib/**/*.test.ts',
        // GPU submission, and nothing else. `webgl_scene_draw.ts` is the three.js calls that put
        // an already-decided draw list on the GPU; it cannot run without a GL context, so a unit
        // test of it would only assert against a stub of three.js. What covers it instead is
        // `e2e/preview_pixels.spec.ts`, which renders these previews in a real browser and asserts
        // the pixels that came out — the one thing that catches a backend that has stopped
        // drawing. Everything this file would otherwise decide was moved into
        // `webgl_scene_build.ts`, which is pure and fully covered.
        //
        // This entry says "verified by another suite", which a baseline entry in
        // scripts/library_coverage_baseline.json deliberately does not. It is honest only while
        // that suite is real: if the preview specs are ever deleted or skipped wholesale, this
        // line has to go with them. See decision 4 in docs/renderers.md.
        //
        // File-scoped, never directory-scoped: a pattern like `src/lib/renderers/**` would
        // silently swallow every file added beside this one, which turns the single honest use of
        // `coverage.exclude` into the loophole the coverage gate exists to prevent.
        'src/lib/renderers/webgl_scene_draw.ts',
      ],
      // No project-wide threshold: a few thousand uncovered lines vanish into a large
      // enough denominator, so one number cannot tell "a library has no tests" from
      // "the codebase grew". scripts/check_library_coverage.ts enforces per library
      // instead, and `npm run coverage:check` is what runs it.
    },
  },
});
