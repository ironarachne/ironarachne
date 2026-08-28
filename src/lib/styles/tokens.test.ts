/**
 * Guards the seam between the vendored brand palette and the site's names for it, and the shape
 * of the token system those names sit in.
 *
 * `brand/colors.css` is copied from the brand repo, which declares itself the source of truth
 * for colour values; `tokens.css` aliases those values under the names the site uses. The
 * failure that mechanism invites is a one-way rename: the brand repo renames or drops a token,
 * a sync brings it in, and every alias pointing at the old name resolves to nothing. CSS says
 * nothing about an undefined custom property — the declaration is simply dropped at computed
 * value time — so the symptom is an unstyled element noticed by whoever happens to look.
 *
 * The ramps and roles added by the visual system (docs/visual-design.md) fail the same silent
 * way, and one layer deeper: a role is built from an alias and a ramp step is built from its own
 * parts, so a token can dangle without a rename ever crossing the brand seam. The suites below
 * therefore check that *every* `var()` inside `tokens.css` resolves, and that each ramp still
 * holds the steps and the values the approved taxonomy names — a ramp that quietly grows a ninth
 * step or loses a corner treatment is the system coming apart at the place it was meant to hold.
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
 * Custom property values by name, with comments stripped first so a token named in a comment is
 * not mistaken for a declaration. A declaration runs to its semicolon and a value never contains
 * one, which is what makes this safe for the multi-line `polygon()` and `linear-gradient()`
 * values.
 */
function declarations(css: string): Map<string, string> {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const pairs = [...source.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)];

  return new Map(pairs.map(([, name, value]) => [name, value.replace(/\s+/g, ' ').trim()]));
}

const tokens = declarations(tokensSource);

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

  it('resolves every alias to a declared brand token', () => {
    const brandTokens = new Set(declaredProperties(brandSource));

    for (const [, alias, target] of aliases) {
      expect(
        brandTokens,
        `${alias} aliases ${target}, which brand/colors.css does not declare`,
      ).toContain(target);
    }
  });

  it('resolves every token this file builds on another', () => {
    // The count assertion this replaces — "at least sixteen aliases" — was a proxy for "nobody
    // pasted a hex back in", which the no-hex test above says directly. What matters now is
    // that the layers hold: a role resolves to an alias, a ramp step resolves to its own parts,
    // and nothing in the file points at a name the file (or the brand palette) does not declare.
    const brandTokens = new Set(declaredProperties(brandSource));
    const dangling = referencedProperties(tokensSource).filter(
      (property) => !tokens.has(property) && !brandTokens.has(property),
    );

    expect(dangling, 'tokens.css reads custom properties nothing declares').toEqual([]);
  });

  it('declares every colour role the taxonomy names', () => {
    // The vocabulary components are given. Dropping one does not break a build; it leaves a
    // component with a declaration the browser discards, which is the failure this file exists
    // to make loud.
    const roles = [
      '--surface-page',
      '--surface-raised',
      '--surface-inset',
      '--surface-sunken',
      '--border',
      '--border-strong',
      '--ink',
      '--ink-muted',
      '--ink-faint',
      '--accent',
      '--accent-quiet',
      '--danger',
      '--focus',
      '--modal-backdrop',
      '--modal-border-message',
      '--modal-border-error',
      '--modal-border-success',
    ];

    const missing = roles.filter((role) => !tokens.has(role));

    expect(missing, 'components build from these roles by name').toEqual([]);
  });

  it('declares no token twice', () => {
    const declared = declaredProperties(tokensSource);
    const duplicates = declared.filter((name, index) => declared.indexOf(name) !== index);

    expect(duplicates, 'a redeclared token silently wins over the one above it').toEqual([]);
  });
});

describe('the type ramp', () => {
  // Six steps, and the sizes the approved taxonomy states. They are asserted literally because
  // the ramp is the one thing every surface is measured against: a step that drifts by a pixel
  // is a page that stops agreeing with the page beside it.
  const steps: [string, string, string][] = [
    ['--t-display', '26px', '1.05'],
    ['--t-title', '20px', '1.1'],
    ['--t-heading', '16px', '1.2'],
    ['--t-body', '14px', '1.45'],
    ['--t-small', '12.5px', '1.4'],
    ['--t-micro', '11px', '1.4'],
  ];

  it.each(steps)('declares %s at its stated size and line height', (step, size, line) => {
    expect(tokens.get(`${step}-size`)).toBe(size);
    expect(tokens.get(`${step}-line`)).toBe(line);
  });

  it.each(steps)('builds the %s shorthand from its own parts', (step) => {
    // The shorthand and the parts are two forms of one step, so they are declared from the same
    // numbers rather than restated — a shorthand carrying its own literal size is how the two
    // forms of a step come to disagree.
    const shorthand = tokens.get(step);

    expect(shorthand).toContain(`var(${step}-size)`);
    expect(shorthand).toContain(`var(${step}-line)`);
    expect(shorthand).toMatch(/var\(--face-(display|body)\)/);
  });

  it('carries the two faces and nothing else', () => {
    expect(tokens.get('--face-display')).toContain('cinzel');
    expect(tokens.get('--face-body')).toContain('Inclusive Sans');

    const faces = [...tokens.keys()].filter((name) => name.startsWith('--face-'));
    expect(faces).toEqual(['--face-display', '--face-body']);
  });

  it('gives --t-micro the tracking the step is defined with', () => {
    // `font` cannot carry letter-spacing, so the tracking is a separate token rather than part
    // of the shorthand. It is still part of the step, and a use of `--t-micro` without it is
    // 11px Cinzel set too tight to read.
    expect(tokens.get('--t-micro-tracking')).toBe('0.08em');
  });

  it('holds exactly the six steps', () => {
    const declared = [...tokens.keys()].filter(
      (name) => name.startsWith('--t-') && !/-(size|line|tracking)$/.test(name),
    );

    expect(declared).toEqual(steps.map(([step]) => step));
  });
});

describe('the space ramp', () => {
  it('holds its eight steps, in order, at their stated values', () => {
    const ramp = ['2px', '4px', '6px', '8px', '12px', '16px', '24px', '32px'];

    expect(ramp.map((_, index) => tokens.get(`--s${index + 1}`))).toEqual(ramp);
  });

  it('stops at --s8', () => {
    // Nothing above `--s8` exists: a gap that wants 48px is a layout that wants rethinking, and
    // the ramp making that awkward is the point of having a ramp at all.
    const steps = [...tokens.keys()].filter((name) => /^--s\d+$/.test(name));

    expect(steps).toHaveLength(8);
    expect(tokens.has('--s9')).toBe(false);
  });
});

describe('elevation and corners', () => {
  it('declares the one plate gradient and the one shadow', () => {
    // A gradient, not which kind: the plate reads as a lit surface, and whether the light comes
    // down the box or off one corner of it is a look to tune rather than a rule to hold.
    expect(tokens.get('--plate')).toMatch(/(linear|radial)-gradient/);
    expect(tokens.get('--edge')).toContain('inset');
    expect(tokens.get('--lift')).toContain('rgb(');
  });

  it('mixes the plate from a role rather than a literal', () => {
    // The gradient replaced three copies of `rgb(92, 86, 73)`. Written as a mix of `--slate` it
    // follows the palette; written as two more literals it would be a fourth copy in the one
    // file that is supposed to end them.
    expect(tokens.get('--plate')).toContain('color-mix');
    expect(tokens.get('--plate')).toContain('var(--slate)');
    expect(tokens.get('--plate')).not.toMatch(/rgb\(\s*\d/);
  });

  it('holds exactly three corner treatments', () => {
    // Three is a cap, not a count. A component picks from these and a skin picks between cut,
    // bevelled and square from the same vocabulary; a fourth is what the rule exists to prevent.
    const corners = ['--notch', '--corner-control', '--corner-nav'];

    for (const corner of corners) {
      expect(tokens.get(corner), `${corner} is a clip-path polygon`).toMatch(/^polygon\(/);
    }

    // `--corner-control-inner` is the control treatment a second time, not a fourth treatment: a
    // clipped border is shaved at the diagonals, so a button paints its edge as a box and covers
    // all but a pixel of it with a liner cut to the same shape. The cap counts treatments, and
    // there are still three; a genuinely new shape would not be named after one of these.
    const declared = [...tokens.keys()].filter(
      (name) => name === '--notch' || name.startsWith('--corner-'),
    );
    expect(declared.sort()).toEqual([...corners, '--corner-control-inner'].sort());
  });

  it('cuts the nav corner on one edge and the other two diagonally', () => {
    // The three shapes are easy to confuse and impossible to tell apart by name. The nav item is
    // square on its flush edge and cut at both corners of the inner one; the notch and the
    // control cut diagonally opposite corners, at 9px and 7px respectively.
    expect(tokens.get('--notch')).toContain('9px');
    expect(tokens.get('--corner-control')).toContain('7px');
    // The liner sits 1px inside the plate on every edge, so its cut is 1px shallower — that is
    // what keeps the two diagonals parallel instead of converging.
    expect(tokens.get('--corner-control-inner')).toContain('6px');

    expect(tokens.get('--corner-nav')).toContain('100% calc(100% - 7px)');
    expect(tokens.get('--notch')).not.toContain('100% calc(100% - 9px)');
  });
});

describe('the control system', () => {
  // docs/visual-design.md, "What is enforced". Three sweeps, and each one guards a rule that was
  // broken in the file it checks before #115: `main.css` held four hexes and three copies of a
  // gradient, `modal.css` held a fourth copy, and all three skins re-declared the button.
  const controlSheets = ['main.css', 'modal.css'];

  it.each(controlSheets)('writes no colour value of its own in %s', (name) => {
    // Comments first: these files cite issue numbers, and `#115` is a hex as far as a regex is
    // concerned.
    const css = readFileSync(join(STYLES_DIR, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    expect(css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [], `${name} declares a hex`).toEqual([]);

    // The space-separated `rgb(0 0 0 / 45%)` form is the stated exemption: it is an overlay on a
    // shadow, which has no palette entry to name. The legacy comma form is what the copied button
    // gradients were written in, and nothing on this side of the seam needs it.
    expect(
      css.match(/rgba?\(\s*\d+\s*,/g) ?? [],
      `${name} declares a literal colour in the comma form`,
    ).toEqual([]);
  });

  it.each(['fantasy.css', 'scifi.css', 'cyberpunk.css'])(
    'leaves control geometry alone in %s',
    (name) => {
      // Decision 2: a skin may set a surface, a keyline, a corner, an accent hue and one ambient
      // effect. A button is none of those, and a skin's own button rule outranks the control system
      // wherever a genre is applied — which is how a redesign comes to show only on ungenre'd pages.
      const css = readFileSync(join(STYLES_DIR, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

      expect(css).not.toMatch(/(^|[\s&>+~,])button\b/);
    },
  );

  it('never leaves a checkbox in a column group', () => {
    // `.input-group` is a flex column, so a checkbox written straight into one renders above its
    // own label rather than beside it — which is what the AD&D and DCC generators did, and it
    // looks like a rendering bug rather than a layout choice. `CheckboxField` and
    // `.input-group--inline` are the two right answers; a label wrapped around its own box
    // (`.inline-label`, as the seed lock and the dungeon's full-size toggle do) is a third.
    const groups = /<div class="input-group([^"]*)"[^>]*>([\s\S]*?)<\/div>/g;
    const offenders: string[] = [];

    for (const { name, css } of siteStylesheets()) {
      if (!name.endsWith('.svelte')) {
        continue;
      }

      for (const [, modifiers, contents] of css.matchAll(groups)) {
        const inline = modifiers.includes('--inline') || contents.includes('inline-label');
        if (!inline && contents.includes('type="checkbox"')) {
          offenders.push(name);
        }
      }
    }

    expect(offenders, 'a checkbox in a column group renders above its label').toEqual([]);
  });

  it('keeps the control components on the ramps', () => {
    // The general rule from "Enforcement", applied to the files #115 touches rather than to all of
    // `src/components` — which does not pass it yet, and making it pass everywhere is #116 and
    // #117's work. These five are the ones that define what a field looks like, so a literal
    // appearing here is the system starting to come apart at its own foundation.
    const controls = ['InputGroup', 'CheckboxField', 'NumberField', 'SelectField', 'SeedControls'];

    for (const name of controls) {
      const css = readFileSync(join(COMPONENTS_DIR, `common/${name}.svelte`), 'utf8').replace(
        /\/\*[\s\S]*?\*\//g,
        '',
      );
      const offRamp = [
        ...css.matchAll(/(?:font-size|padding|margin|gap)[^:;]*:\s*([^;{}]+);/g),
      ].filter(([, value]) => /\d/.test(value) && !value.includes('var('));

      expect(
        offRamp.map(([declaration]) => declaration),
        `${name} sizes something outside the ramps`,
      ).toEqual([]);
    }
  });
});

describe('motion', () => {
  it('declares one duration, and it is swift', () => {
    expect(tokens.get('--motion-swift')).toBe('120ms');

    const durations = [...tokens.keys()].filter((name) => name.startsWith('--motion-'));
    expect(durations).toEqual(['--motion-swift']);
  });
});

describe('the measure', () => {
  it('stays in ch, because it is a line length', () => {
    expect(tokens.get('--measure')).toBe('70ch');
  });
});
