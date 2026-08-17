/// <reference types="svelte" />

/**
 * The released version, substituted at build time from `package.json` by `vite.config.js`.
 *
 * Read through `appVersion()` in `$lib/vault_file` rather than directly, so the one place that
 * copes with a bundler that did not define it stays one place.
 */
declare const __APP_VERSION__: string;
