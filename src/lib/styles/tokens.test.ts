/**
 * Guards the seam between the vendored brand palette and the site's names for it.
 *
 * `brand/colors.css` is copied from the brand repo, which declares itself the source of truth
 * for colour values; `tokens.css` aliases those values under the names the site uses. The
 * failure that mechanism invites is a one-way rename: the brand repo renames or drops a token,
 * a sync brings it in, and every alias pointing at the old name resolves to nothing. CSS says
 * nothing about an undefined custom property — the declaration is simply dropped at computed
 * value time — so the symptom is an unstyled element noticed by whoever happens to look.
 *
 * These tests are cheap because nothing here parses CSS properly: the files are small, flat,
 * and vendored, so matching declarations and `var()` references by regex is enough.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const STYLES_DIR = join(process.cwd(), 'src/lib/styles');
const COMPONENTS_DIR = join(process.cwd(), 'src/components');
const BRAND_COLORS = join(STYLES_DIR, 'brand/colors.css');

const brandSource = readFileSync(BRAND_COLORS, 'utf8');
const tokensSource = readFileSync(join(STYLES_DIR, 'tokens.css'), 'utf8');

/** Every `--foo: …` in a stylesheet, in source order. */
function declaredProperties(css: string): string[] {
  return [...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((match) => match[1]);
}

/** Every `var(--foo)` a stylesheet reads, including the ones inside `color-mix()`. */
function referencedProperties(css: string): string[] {
  return [...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]);
}

/**
 * Everywhere on this side of the seam that CSS can be written: the global stylesheets, and the
 * `<style>` blocks in components. Components are meant to use the site's names rather than
 * `--ia-*` directly, but one that reaches past the alias layer is exactly what a rename in the
 * brand repo would break, so it is checked the same way.
 */
function siteStylesheets(): { name: string; css: string }[] {
  const globals = readdirSync(STYLES_DIR)
    .filter((name) => name.endsWith('.css'))
    .map((name) => join(STYLES_DIR, name));

  const components = readdirSync(COMPONENTS_DIR, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith('.svelte'))
    .map((name) => join(COMPONENTS_DIR, name));

  return [...globals, ...components].map((path) => ({
    name: relative(process.cwd(), path),
    css: readFileSync(path, 'utf8'),
  }));
}

describe('brand colour tokens', () => {
  const brandTokens = new Set(declaredProperties(brandSource));

  it('declares the palette the site aliases', () => {
    // Not a list of everything the brand file has — it may carry tokens the site has no use
    // for. These are the ones something here reads, so losing one is a visible regression.
    expect(brandTokens).toContain('--ia-green');
    expect(brandTokens).toContain('--ia-charcoal');
    expect(brandTokens).toContain('--ia-status-error');
  });

  it('is the only place a colour value is written down', () => {
    const hexes = tokensSource.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    expect(hexes).toEqual([]);
  });

  it('backs every --ia-* reference on the site', () => {
    for (const { name, css } of siteStylesheets()) {
      const dangling = referencedProperties(css)
        .filter((property) => property.startsWith('--ia-'))
        .filter((property) => !brandTokens.has(property));

      expect(dangling, `${name} reads brand tokens that brand/colors.css does not declare`).toEqual(
        [],
      );
    }
  });
});

describe('site colour tokens', () => {
  const aliases = [...tokensSource.matchAll(/^\s*(--[\w-]+)\s*:\s*var\(\s*(--ia-[\w-]+)\s*\)/gm)];

  it('aliases the brand palette rather than restating it', () => {
    // Thirteen palette entries plus the three modal roles. A new alias is welcome; an alias
    // that stopped being an alias — a hex pasted back in — is what this counts.
    expect(aliases.length).toBeGreaterThanOrEqual(16);
  });

  it('resolves every alias to a declared brand token', () => {
    const brandTokens = new Set(declaredProperties(brandSource));

    for (const [, alias, target] of aliases) {
      expect(
        brandTokens,
        `${alias} aliases ${target}, which brand/colors.css does not declare`,
      ).toContain(target);
    }
  });
});
