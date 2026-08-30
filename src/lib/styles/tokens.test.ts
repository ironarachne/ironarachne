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

import { GENRES } from '$lib/tools';

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

/**
 * Source with its comments removed. A comment naming a thing is not a use of it.
 *
 * All three kinds, because a `.svelte` file carries all three. The `//` case needs the guard: a
 * bare `\/\/` would eat the rest of every line holding a URL, and these files are full of
 * `https://svelte.dev/e/...` links. Requiring the slashes not to follow a colon leaves those
 * alone.
 */
function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * A component's `<style>` block, with its comments stripped.
 *
 * `siteStylesheets` hands back the whole `.svelte` file, which is what the checkbox sweep wants —
 * it reads markup. A sweep looking for a CSS selector has to read the stylesheet alone, or the
 * word `dialog` in a doc comment counts as a rule.
 */
function styleBlock(css: string): string {
  return [...css.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map(([, block]) => block)
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '');
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
    // Comments first. This file cites issue numbers, and `#149` is a hex as far as a regex is
    // concerned — the sweep over `main.css` and `modal.css` has stripped comments since #115 for
    // exactly this reason, and this one did not, so it failed twice on prose that named an issue.
    const hexes = withoutComments(tokensSource).match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
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
      '--success',
      '--focus',
      '--modal-backdrop',
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
    // Three is a cap on what a *component* may pick from, and #120 left it there while opening the
    // panel's own corner to a skin: the shape is still one polygon, and what a genre moves is the
    // depth at each of its four corners.
    const corners = ['--corner-control', '--corner-nav'];

    for (const corner of corners) {
      expect(tokens.get(corner), `${corner} is a clip-path polygon`).toMatch(/^polygon\(/);
    }

    // The panel's is the third, and it is the one that is not here: a `var()` inside a custom
    // property resolves where the property is declared, so a `--panel-corner` on `:root` would
    // hand every panel the base depths however a skin set them. It is declared on `.panel` and
    // `.panel__header` in `main.css` instead — see the test below, and tokens.css's own comment.
    expect(tokens.get('--panel-corner'), 'the panel polygon is back on :root').toBeUndefined();

    // `--corner-control-inner` and `--panel-corner-inner` are those treatments a second time, not
    // two more treatments: a clipped border is shaved at the diagonals, so a button and a panel
    // each paint their edge as a box and cover all but a pixel of it with a liner cut to the same
    // shape. The cap counts treatments, and there are still three; a genuinely new shape would
    // not be named after one of these.
    const declared = [...tokens.keys()].filter(
      (name) => name.startsWith('--panel-corner') || name.startsWith('--corner-'),
    );
    expect(declared.sort()).toEqual(
      [
        ...corners,
        '--corner-control-inner',
        '--panel-corner-tl',
        '--panel-corner-tr',
        '--panel-corner-br',
        '--panel-corner-bl',
      ].sort(),
    );
  });

  it('writes the panel polygon once, from four depths', () => {
    // docs/visual-design.md, "A skin sets four depths, and the polygon stays in the base". The
    // whole mechanism is that a skin has numbers to move and no shape to write, which only holds
    // while the shape is built from the depths rather than beside them.
    const depths = {
      '--panel-corner-tl': '0px',
      '--panel-corner-tr': '9px',
      '--panel-corner-br': '0px',
      '--panel-corner-bl': '9px',
    };

    const panels = readFileSync(join(STYLES_DIR, 'main.css'), 'utf8');
    const polygon = /--panel-corner:\s*polygon\(([^;]+)\);/.exec(panels)?.[1] ?? '';
    const liner = /--panel-corner-inner:\s*polygon\(([^;]+)\);/.exec(panels)?.[1] ?? '';

    for (const [name, value] of Object.entries(depths)) {
      expect(tokens.get(name), `${name} is not the base cut`).toBe(value);
      expect(polygon, `${name} is not read by the polygon`).toContain(`var(${name})`);
      // The liner is the same four depths a pixel shallower, so the two outlines stay parallel at
      // whatever depth a genre picks. `max()` because 0px - 1px is -1px, and a negative coordinate
      // would pull the liner's outline outside the box it is meant to sit inside.
      expect(liner, `${name} is not read by the liner`).toContain(
        `max(0px, calc(var(${name}) - 1px))`,
      );
    }

    // Declared on the elements that clip, and only those — anywhere higher and the depths resolve
    // against that ancestor rather than against the panel, which is the bug this test exists for.
    expect(panels, 'the panel polygon moved off the clipping elements').toContain(
      '.panel,\n.panel__header {',
    );
  });

  it('cuts the nav corner on one edge and the other two diagonally', () => {
    // The three shapes are easy to confuse and impossible to tell apart by name. The nav item is
    // square on its flush edge and cut at both corners of the inner one; the notch and the
    // control cut diagonally opposite corners, at 9px and 7px respectively.
    expect(tokens.get('--panel-corner-tr')).toBe('9px');
    expect(tokens.get('--corner-control')).toContain('7px');
    // A liner sits 1px inside on every edge, so its cut is 1px shallower — that is what keeps the
    // two diagonals parallel instead of converging. The panel's is arithmetic now rather than a
    // second polygon, so only the control's is a literal.
    expect(tokens.get('--corner-control-inner')).toContain('6px');

    expect(tokens.get('--corner-nav')).toContain('100% calc(100% - 7px)');
    // The base panel is square at the two corners the notch does not take, which is what makes it
    // a diagonal pair rather than a bevel.
    expect(tokens.get('--panel-corner-tl')).toBe('0px');
    expect(tokens.get('--panel-corner-br')).toBe('0px');
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

  it.each(['fantasy.css', 'scifi.css', 'cyberpunk.css', 'horror.css'])(
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

describe('dark is the only mode', () => {
  // Decision 1 in docs/visual-design.md, stated to the browser rather than only to ourselves.
  it('declares the document colour scheme', () => {
    const css = readFileSync(join(STYLES_DIR, 'main.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    // Everything the user agent draws reads this: control chrome, scrollbars, and the `Canvas` /
    // `CanvasText` system colours behind the defaults on anything the app has not styled. Without
    // it they are all computed for a light page and drawn onto `--charcoal`, which is how every
    // dialog came to have black text between #117 and #144.
    expect(css, 'the document does not declare a colour scheme').toMatch(
      /color-scheme:\s*dark\s*;/,
    );
  });

  it('declares no light-scheme alternative', () => {
    // The palette carries no light-surface pair for the brand green — `brand/colors.css` measures
    // it at 1.57:1 on white — so a light mode could not use the brand's own accent. Decision 1
    // settles that there is one mode, and a `light dark` pair or a `prefers-color-scheme: light`
    // block would be the start of a second one.
    for (const { name, css } of siteStylesheets()) {
      const stripped = withoutComments(css);

      expect(stripped, `${name} offers a light colour scheme`).not.toMatch(
        /color-scheme:[^;]*\blight\b/,
      );
      expect(stripped, `${name} branches on a light preference`).not.toMatch(
        /prefers-color-scheme:\s*light/,
      );
    }
  });
});

describe('the message family', () => {
  // docs/visual-design.md, "What the message family enforces". Each of these guards a rule that
  // was broken before #117: three implementations of one idea, one of them painting a grey that
  // is in no palette.

  it('declares exactly one dialog element', () => {
    // #143. Every dialog is a `.panel` since #117, so `.panel` describes a look and cannot
    // identify an element — and a second `<dialog>` mounted from inside a bench panel made
    // `dialog.panel` and `.workshop-panel .panel__title` both ambiguous, which cost three red CI
    // runs before anyone traced it. One dialog, in the modal host, outside `.shell`.
    //
    // It is also what makes "a dialog is genre-neutral for free" true rather than
    // true-in-the-common-case: docs/visual-design.md, "Applying a skin", reasons from the host
    // dialog being in the top layer and outside the page region.
    const declaring = siteStylesheets()
      .filter(({ name }) => name.endsWith('.svelte'))
      .filter(({ css }) => /<dialog[\s>]/.test(withoutComments(css)))
      .map(({ name }) => name);

    expect(declaring, 'the app declares more than one dialog').toEqual([
      'src/components/layout/ModalHost.svelte',
    ]);
  });

  it('leaves the dialog frame to the stylesheets', () => {
    // A dialog is a raised panel in the top layer, and its frame is `main.css`'s panel classes
    // plus the three rules in `modal.css`. A component's own `<style>` block reaching for
    // `dialog` is the second implementation starting again — which is exactly what
    // `LoadSnapshotDialog` was, with its own border, its own radius and its own backdrop.
    const offenders = siteStylesheets()
      .filter(({ name }) => name.endsWith('.svelte'))
      .filter(({ css }) => /(^|[\s&>+~,(])dialog\b/.test(styleBlock(css)))
      .map(({ name }) => name);

    expect(offenders, 'a component declaring a dialog frame of its own').toEqual([]);
  });

  it('has no role named after a component', () => {
    // The three `--modal-border-*` aliases mapped a role onto a palette entry in one place, which
    // is the right shape — but they were named for the one component that needed them first, and
    // a banner and an inline notice want the same three meanings. All three are already roles.
    const offenders = [...siteStylesheets(), { name: 'tokens.css', css: tokensSource }]
      .filter(({ css }) => css.replace(/\/\*[\s\S]*?\*\//g, '').includes('--modal-border'))
      .map(({ name }) => name);

    expect(offenders, 'a role named after the component that wanted it first').toEqual([]);
  });

  it('never hides a literal behind a custom-property fallback', () => {
    // The sweep that would have caught `#1a1a1a`. `LoadSnapshotDialog` declared
    // `background: var(--background, #1a1a1a)`, and `--background` is declared nowhere in the app
    // — so that fallback was not a fallback, and the dialog rendered a grey that is in no palette
    // for as long as it existed. A fallback is a hex the other sweeps cannot see, and a token that
    // might not be declared is a token whose name is wrong. Every role and every `--ia-*` is in a
    // stylesheet the app always loads, so there is nothing for a fallback to protect against.
    // A *colour* fallback specifically. `var(--project-view-max-height, 20rem)` is a deliberate
    // component API — a length a parent may set, with a stated default — and it is not what this
    // is about. A hex behind a `var()` is.
    const offenders: string[] = [];

    for (const { name, css } of siteStylesheets()) {
      const stripped = name.endsWith('.svelte')
        ? styleBlock(css)
        : css.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [declaration] of stripped.matchAll(
        /var\(\s*--[\w-]+\s*,[^)]*(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()[^)]*\)?\s*\)/g,
      )) {
        offenders.push(`${name}: ${declaration}`);
      }
    }

    expect(offenders, 'a literal hidden behind a var() fallback').toEqual([]);
  });
});

describe('applying a skin', () => {
  // docs/visual-design.md, "What applying a skin enforces". Each of these guards a rule that was
  // broken before #118: the genre was written in thirty places, four of which disagreed with the
  // tool catalog that already knew the answer.

  const SKIN_FILES = ['fantasy.css', 'scifi.css', 'cyberpunk.css', 'horror.css'];

  it('writes the genre in one place', () => {
    // One genre, one writer. `+layout.svelte` puts `data-genre` on the page region and nothing
    // else touches it — which is the whole of the opt-out mechanism, since the top bar and the
    // sidebar are that element's siblings rather than its descendants.
    const offenders = siteStylesheets()
      .filter(({ name }) => name.endsWith('.svelte'))
      .filter(({ css }) => withoutComments(css).includes('data-genre'))
      .map(({ name }) => name);

    expect(offenders, 'a component writing data-genre of its own').toEqual([]);

    const layout = readFileSync(join('src', 'routes', '+layout.svelte'), 'utf8');
    expect(layout, 'the one writer stopped writing it').toContain('data-genre={genre}');
  });

  it('gives every genre a skin, now that horror has one', () => {
    // The other direction, which only became assertable with #122. `horror` sat in GENRES with no
    // file from before this document existed until then, and a project set to it got the base
    // appearance by omission rather than by decision — the resolver returns a genre rather than a
    // stylesheet precisely so that gap could exist. It does not any more, and this is what keeps a
    // fifth genre from being added without one.
    const skinned = new Set(
      SKIN_FILES.flatMap((name) =>
        [...readFileSync(join(STYLES_DIR, name), 'utf8').matchAll(/\[data-genre='([^']*)'\]/g)].map(
          ([, genre]) => genre,
        ),
      ),
    );

    expect([...skinned].sort(), 'a genre has no skin file').toEqual([...GENRES].sort());
  });

  it('keeps skins in skin files, and leaves the old class name behind', () => {
    // A `[data-genre=…]` rule outside a skin file is a skin leaking into the base system. A bare
    // `.fantasy` inside one is the old selector surviving beside the new attribute, which is how
    // both would end up half-working.
    for (const { name, css } of siteStylesheets()) {
      if (SKIN_FILES.some((skin) => name.endsWith(skin))) {
        continue;
      }
      expect(withoutComments(css), `${name} declares a genre skin rule`).not.toMatch(
        /\[data-genre/,
      );
    }

    for (const name of SKIN_FILES) {
      const css = readFileSync(join(STYLES_DIR, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const genre = name.replace('.css', '');

      expect(css, `${name} still declares the old bare class`).not.toMatch(
        new RegExp(`(^|[\\s,>+~])\\.${genre}\\b`),
      );
    }
  });

  it('keys every skin off a genre that exists', () => {
    // A stylesheet keyed to a genre the app does not have is dead CSS that looks live, and it is
    // exactly what a typo produces.
    const genres = new Set<string>(GENRES);

    for (const name of SKIN_FILES) {
      const css = readFileSync(join(STYLES_DIR, name), 'utf8');
      for (const [, keyed] of css.matchAll(/\[data-genre='([^']*)'\]/g)) {
        expect(genres, `${name} keys off a genre that is not in GENRES`).toContain(keyed);
      }
    }
  });
});

describe('the panel language', () => {
  // docs/visual-design.md, "What the panel language enforces". Each of these guards a rule that
  // was broken in the files it checks before #116: nineteen components declared the same box, and
  // three of them hand-rolled the same pill with `--gold` written into two.
  //
  // One set of files is deferred rather than exempt, and the design says which: the surfaces that
  // hold *generated output* belong to the skins in #119–#121, which is why #116 precedes them.
  // Each name here is a file the panel language has not reached yet — the list is meant to shrink,
  // and adding to it is how the sweep stops meaning anything.
  //
  // #117's four entries — the two banners, the storage failure dialog and the snapshot dialog —
  // are gone, which is the first time this list has shrunk. They are the message family now, and
  // they are swept like everything else.
  // Every component, with nothing carried. A `DEFERRED` list of nine files sat here until #124,
  // exempted on the grounds that they were "surfaces that hold generated output, which is what a
  // genre skin dresses" and belonged to #119-#121. Those three issues closed without touching any
  // of them, so the exemption had outlived its reason — which is exactly what the list's own guard
  // test was written against, and exactly what that guard could not see, because it only checked
  // that a deferred file still existed. Twelve hexes and sixty-five off-ramp values later, the
  // list is gone rather than shorter.
  const componentSheets = siteStylesheets().filter(({ name }) => name.endsWith('.svelte'));

  it('declares the two shadows, and the halo is a state rather than an elevation', () => {
    // `--lift` sits a panel off the page and is fixed across the genres so two panels beside each
    // other are at the same height. `--halo` says which panel has focus, which is not a height.
    expect(tokens.get('--halo')).toContain('color-mix');
    expect(tokens.get('--halo')).toContain('var(--accent)');

    const shadows = [...tokens.keys()].filter((name) =>
      ['--edge', '--sink', '--lift', '--halo'].includes(name),
    );
    expect(shadows.sort()).toEqual(['--edge', '--halo', '--lift', '--sink']);
  });

  it('leaves no component on the old box recipe', () => {
    // `1px solid var(--tan)` over `border-radius: 4px` over `var(--slate)` *was* the panel
    // language, written out nineteen times. A panel is now a class, and the class is the only
    // place those three lines exist.
    const offenders = componentSheets
      .filter(({ css }) => {
        const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
        return (
          /border[^:;]*:\s*1px solid var\(--tan\)/.test(source) ||
          /background[^:;]*:\s*var\(--slate\)/.test(source)
        );
      })
      .map(({ name }) => name);

    expect(offenders, 'a hand-rolled panel outlives the panel language').toEqual([]);
  });

  it('keeps every corner in the vocabulary', () => {
    // Cut, round and square, plus the pill — `border-radius: 999px` on something with no straight
    // edge long enough to cut. A `4px` anywhere is a box that has not been converted.
    const permitted = new Set(['999px', '50%', '0']);
    const offenders: string[] = [];

    for (const { name, css } of componentSheets) {
      const source = css.replace(/\/\*[\s\S]*?\*\//g, '');

      for (const [, value] of source.matchAll(/border-radius:\s*([^;{}]+);/g)) {
        const radius = value.trim();
        if (!permitted.has(radius) && !radius.includes('var(')) {
          offenders.push(`${name}: ${radius}`);
        }
      }
    }

    expect(offenders, 'a corner outside the vocabulary').toEqual([]);
  });

  it('keeps the panel components on the ramps', () => {
    // The rule the control components are held to, extended to the six #116 names plus the three
    // it adds. `Panel` and `Chip` take the same `1px` exception `BaseButton` has — it is the
    // keyline's own width, and the visually-hidden box's.
    const panels = [
      'Panel',
      'Badge',
      'Chip',
      'WorkshopPanel',
      'ToolBrowser',
      'ProjectView',
      'SessionLogPanel',
      'ArtifactPanel',
      'ToolMaturityBadge',
    ];

    for (const name of panels) {
      const css = readFileSync(join(COMPONENTS_DIR, `common/${name}.svelte`), 'utf8').replace(
        /\/\*[\s\S]*?\*\//g,
        '',
      );
      const offRamp = [
        ...css.matchAll(/(?:font-size|padding|margin|gap)[^:;]*:\s*([^;{}]+);/g),
      ].filter(([, value]) => /\d/.test(value) && !value.includes('var(') && value.trim() !== '0');

      expect(
        offRamp.map(([declaration]) => declaration),
        `${name} sizes something outside the ramps`,
      ).toEqual([]);
    }
  });

  it.each(['fantasy.css', 'scifi.css', 'cyberpunk.css', 'horror.css'])(
    'leaves panel and badge geometry alone in %s',
    (name) => {
      // Decision 2 again, for the surfaces: a skin may set `--panel-edge` and `--panel-surface`
      // and put its one ambient effect on the panel, and may not touch the notch, the liner, the
      // padding or the halo.
      //
      // Checked as *properties* rather than as selectors. This forbade a `.panel` selector outright
      // until #119, which is stricter than the design: putting the ambient effect on the panel
      // surface means selecting the liner that paints it. What a skin may not do is change the
      // shape of what it selects.
      const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

      const geometry =
        /(?:^|[;{])\s*(padding|margin|gap|clip-path|border-radius|border-width|box-shadow|width|height|inset)\s*:/g;

      expect(
        [...css.matchAll(geometry)].map(([, property]) => property),
        `${name} changes the shape of what it dresses`,
      ).toEqual([]);

      expect(css).not.toMatch(/\.(badge|chip)(--)?[\w-]*\s*\{/);
      expect(css).not.toContain('--halo');
      expect(css).not.toContain('--lift');

      // The corner is the one geometry a skin may move, and it moves it as four numbers. The
      // polygon itself, and the liner's, stay in `tokens.css` where a skin cannot reach them —
      // which is the line between setting a depth and redrawing the panel.
      expect(css, `${name} redeclares the panel polygon`).not.toMatch(
        /--panel-corner(-inner)?\s*:/,
      );
      expect(css, `${name} draws a shape of its own`).not.toContain('polygon(');
    },
  );

  // Every skin the app has, and now every genre it has: #122 adds the fourth file, so `GENRES` and
  // this directory finally hold the same four names. The list was created because the skins
  // converted one issue at a time and the ones that had not were exempt from the sweeps; nothing is
  // carried and there is nothing left to exempt.
  const CONVERTED_SKINS = ['fantasy.css', 'scifi.css', 'cyberpunk.css', 'horror.css'];

  it.each(CONVERTED_SKINS)('writes no colour value of its own in %s', (name) => {
    // The exemption granted when the controls landed — "their heading effects are full of hexes and
    // belong to #119–#121" — ends for a skin the moment its issue does.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

    expect(css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [], `${name} declares a hex`).toEqual([]);
    expect(css.match(/rgba?\(\s*\d+\s*,/g) ?? [], `${name} declares a literal colour`).toEqual([]);
  });

  it.each(CONVERTED_SKINS)('leaves the type ramp alone in %s', (name) => {
    // The genre moved off the type and onto the panel. Every skin styled `h1`-`h6` and only
    // `h1`-`h6` before its rewrite, which is a heading being animated while it is being read.
    // A heading *colour* inside a panel is permitted and is not this: what is forbidden is a rule
    // that reaches the elements the type ramp owns, and any font property at all.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

    // Every heading rule is scoped to a panel. A skin dresses panels, and a heading colour on one
    // is permitted — what is forbidden is the old form, `[data-genre='fantasy'] h1, h2, …`, which
    // reached every heading on the page including the page title the type ramp owns.
    const selectors = css.match(/[^{}]+(?=\{)/g) ?? [];
    const unscopedHeadings = selectors
      .map((selector) => selector.trim())
      .filter((selector) => /(?:^|[\s,>+~])h[1-6](?![\w-])/.test(selector))
      .filter((selector) =>
        selector
          .split(',')
          .some((part) => /(?:^|[\s,>+~])h[1-6](?![\w-])/.test(part) && !part.includes('.panel')),
      );

    expect(unscopedHeadings, `${name} restyles a heading outside a panel`).toEqual([]);
    expect(css, `${name} sets a font property`).not.toMatch(
      /(?:^|[;{])\s*(?:font|font-[\w-]+|letter-spacing|line-height|text-transform)\s*:/,
    );
  });

  it.each(CONVERTED_SKINS)('caps ambient motion at one effect in %s', (name) => {
    // "At most one ambient effect, off under reduced motion" is decision 2's, and it is the line
    // the old skins broke hardest: cyberpunk ran two animations at once on the type.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

    const keyframes = css.match(/@keyframes\s/g) ?? [];
    expect(keyframes.length, `${name} declares more than one effect`).toBeLessThanOrEqual(1);

    const animated = /(?:^|[;{])\s*animation\s*:\s*(?!none)/.test(css);
    if (animated) {
      expect(css, `${name} animates without a reduced-motion escape`).toContain(
        'prefers-reduced-motion: reduce',
      );
    }
  });

  /** The four corner depths a skin file declares, in `tl tr br bl` order, or `[]` if it sets none. */
  function cornerDepths(name: string): string[] {
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));
    const corners = ['tl', 'tr', 'br', 'bl'];

    return corners
      .map((corner) => new RegExp(`--panel-corner-${corner}\\s*:\\s*([^;]+);`).exec(css)?.[1])
      .filter((depth): depth is string => depth !== undefined)
      .map((depth) => depth.trim());
  }

  it.each(CONVERTED_SKINS)('cuts no corner deeper than the padding in %s', (name) => {
    // `--s5` is 12px and it is the panel's padding. A corner cut deeper than the padding stops
    // shaping the plate and starts taking the first character of the first line inside it, which
    // is the one way a corner can cost something the design refuses to spend.
    const depths = cornerDepths(name);
    expect(depths, `${name} sets some corners and not others`).toHaveLength(4);

    for (const depth of depths) {
      const pixels = Number.parseFloat(depth);
      expect(Number.isNaN(pixels), `${name} writes a corner depth that is not a length`).toBe(
        false,
      );
      expect(pixels, `${name} cuts deeper than --s5`).toBeLessThanOrEqual(12);
    }
  });

  it.each(CONVERTED_SKINS)('animates slowly enough to be ambient in %s', (name) => {
    // The assertion #121 exists to leave behind. The cap on the *number* of effects never said
    // anything about their rate, and `cyberpunk.css` used to run a 1.5s pulse and a 4s LED fault
    // whose hard cuts landed 40ms apart — a strobe on text, and the only thing in the app that went
    // near WCAG 2.3.1's three flashes per second. Ambient motion is measured in tens of seconds;
    // anything quicker is a state change, which is `--motion-swift`'s business and not a skin's.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));
    const durations = [...css.matchAll(/(?:^|[;{])\s*animation\s*:\s*[^;]*?([\d.]+)s/g)];

    for (const [, seconds] of durations) {
      expect(Number.parseFloat(seconds), `${name} animates faster than 20s`).toBeGreaterThanOrEqual(
        20,
      );
    }
  });

  it.each(CONVERTED_SKINS)('leaves the focus hue to the focus ring in %s', (name) => {
    // `--focus` is acid green and `--halo` is mixed from `--accent`, so a skin taking acid for its
    // accent would give a panel a focus halo, a focus ring and a set of chips in one colour — in
    // the one place in the system where telling two things apart carries meaning. A corner mark in
    // acid is not this: a mark is at the panel's corner, a ring is around the control.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

    expect(css, `${name} takes the focus ring's hue for its accent`).not.toMatch(
      /--accent\s*:\s*var\(--acid-green\)/,
    );
  });

  it.each(CONVERTED_SKINS)('paints nothing under text that lightens it in %s', (name) => {
    // docs/visual-design.md, "A skin's surface is never lighter than the base's", second half.
    // The rule held `--panel-surface` to `--surface-raised` and said nothing about the layers a skin
    // paints on top of it — and every layer that existed lightened. `--ink-faint`'s floor puts the
    // ceiling for a pixel under text at luminance 0.0303, both surfaces sit at 0.0277 and 0.0276,
    // and a 2% gold sheen measures 4.49:1. There is no headroom for a highlight, so a skin's surface
    // layers may only darken.
    //
    // The keyline is deliberately not swept here. A corner mark lives in the 1px ring where no text
    // goes, and answers to the luminance register and its area exemption instead — which is why
    // this reads the rules that paint `.panel__field` rather than every gradient in the file.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

    // `var(--x)` comes out first: a nested paren would otherwise end a match early and report a stop
    // that had been cut in half, which is a test failing on the wrong thing.
    const flattened = css.replace(/var\([^)]*\)/g, 'TOKEN');
    const surfaceRules = [...flattened.matchAll(/\.panel__field[^{]*\{([^}]*)\}/g)].map(
      ([, body]) => body,
    );

    for (const body of surfaceRules) {
      for (const [stop] of body.matchAll(/color-mix\([^)]*\)/g)) {
        expect(stop.includes('black'), `${name} paints ${stop} under text, which lightens it`).toBe(
          true,
        );
      }
    }
  });

  it.each(CONVERTED_SKINS)('leaves the tones their own colours in %s', (name) => {
    // docs/visual-design.md, "The keyline is old blood, and deliberately not `--danger`". Neat
    // crimson is luminance 0.0882 and sits inside the keyline register, so the rules as they stood
    // permitted it — and crimson *is* `--danger`. A toned panel sets `--panel-edge: var(--danger)`
    // to say a write failed, so a genre wearing that edge would make a whole project look like a
    // page of failures and hide the one panel that had really failed among them.
    //
    // A skin may mix a tone's palette entry with something else — horror's keyline is half crimson
    // — but it may not paint the role itself, because that is the value the tone sets.
    const css = withoutComments(readFileSync(join(STYLES_DIR, name), 'utf8'));

    for (const tone of ['--danger', '--success']) {
      expect(css, `${name} paints ${tone}, which is a tone's to say and not a genre's`).not.toMatch(
        new RegExp(`--panel-edge\\s*:\\s*var\\(${tone}\\)`),
      );
    }
  });

  it('gives every genre a shape of its own', () => {
    // "A shape is a genre's, or it is furniture." The cap on corner treatments used to be three;
    // #120 replaced it with one shape per genre, and this is the half of that rule no source sweep
    // of a single file could catch — it is a statement about the skins as a set. Reading the files
    // rather than a list is what covers a fifth genre on the day its file appears.
    const base = ['0px', '9px', '0px', '9px'];
    const shapes = new Map(CONVERTED_SKINS.map((name) => [name, cornerDepths(name).join(' ')]));

    for (const [name, shape] of shapes) {
      expect(shape, `${name} wears the base's own corner`).not.toBe(base.join(' '));
    }

    expect(new Set(shapes.values()).size, 'two genres wear the same shape').toBe(shapes.size);
  });
});

describe('icons', () => {
  // docs/visual-design.md, "Icons: the glyph that names, and the mark that decorates".
  const COMPONENTS_ROOT = COMPONENTS_DIR;

  function componentFiles(): string[] {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          return walk(path);
        }
        return entry.name.endsWith('.svelte') ? [path] : [];
      });

    return walk(COMPONENTS_ROOT);
  }

  it('draws no icon by hand', () => {
    // The sixth icon is the one that gets pasted in as markup, and then the seventh is copied from
    // it. An icon comes from the pack, through `Icon` or `RoundIconButton`; what is exempt is a
    // component that *generates* SVG, which is a different thing from drawing a picture in a
    // template — heraldry composes its output as SVG and that output is the tool's product.
    const generators = ['HeraldryTinctureSelect.svelte'];

    const offenders = componentFiles().filter((path) => {
      if (generators.some((name) => path.endsWith(name))) {
        return false;
      }
      return /<svg[\s>]/.test(readFileSync(path, 'utf8'));
    });

    expect(offenders, 'a component draws an icon by hand').toEqual([]);
  });

  it('hides every mark from the accessibility tree', () => {
    // A mark decorates a surface that already reads without it, so a screen reader announcing
    // "image" beside every tool in a list of thirty-four is noise it cannot skip. `Icon` decides
    // this from whether it was given a label, which is the whole of the glyph/mark boundary: the
    // component is the one place it can be enforced rather than remembered.
    const icon = readFileSync(join(COMPONENTS_ROOT, 'common/Icon.svelte'), 'utf8');

    expect(icon, 'Icon can render without deciding whether it is a mark').toContain(
      "aria-hidden={label === undefined ? 'true' : undefined}",
    );
    expect(icon, 'a labelled icon is not announced as an image').toContain(
      "role={label === undefined ? undefined : 'img'}",
    );
  });

  it('sizes a mark in em rather than in pixels', () => {
    // A mark belongs to the text it accompanies, so it takes that text's step and is on the type
    // ramp without declaring a size. A pixel size here would be a sixth ramp.
    const icon = readFileSync(join(COMPONENTS_ROOT, 'common/Icon.svelte'), 'utf8');
    const sizes = [...icon.matchAll(/(?:height|width|font-size)\s*:\s*([^;]+);/g)].map(
      ([, value]) => value.trim(),
    );

    for (const size of sizes) {
      expect(/px/.test(size), `Icon sizes something in pixels: ${size}`).toBe(false);
    }
  });
});

describe('the content language', () => {
  // docs/visual-design.md, "The content language: stats and tables".
  function componentFiles(): string[] {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? walk(path) : entry.name.endsWith('.svelte') ? [path] : [];
      });

    return walk(COMPONENTS_DIR);
  }

  it('writes no stat as a sentence', () => {
    // `<p><strong>Label:</strong> value</p>` was the house style — 229 of them across 19
    // components — and it is a sentence made to look like data: prose to a screen reader, unable to
    // align with the stat above it, with the colon doing a layout's job. `Stat` is the shape now.
    //
    // **Scoped to a constant key**, which is the line implementation drew and the design did not:
    // `<strong>{trait.name}:</strong> {trait.description}` is a term and a sentence about it, which
    // is a glossary rather than a stat block, and the document says so. A key that comes from the
    // data is the discriminator, because a stat's key is written by the app and a glossary's is
    // written by the generator.
    const offenders = componentFiles().filter((path) => {
      if (path.endsWith('Stat.svelte') || path.endsWith('StatBlock.svelte')) {
        return false;
      }
      return /<strong>[A-Z][^<{]*?:<\/strong>/.test(readFileSync(path, 'utf8'));
    });

    expect(offenders, 'a stat is still written as a sentence').toEqual([]);
  });

  it('keeps a stat pair on the ramps', () => {
    // The pair is the recipe a control's label already uses: `--t-micro` tracked and uppercase in
    // `--ink-faint` over `--t-body` in `--ink`. A stat that invented its own steps would be the
    // second answer to a question the field around a control already answered.
    const stat = readFileSync(join(COMPONENTS_DIR, 'common/Stat.svelte'), 'utf8');

    expect(stat).toContain('var(--t-micro)');
    expect(stat).toContain('var(--t-micro-tracking)');
    expect(stat).toContain('var(--ink-faint)');
    expect(stat).toContain('var(--t-body)');

    const sizes = [...stat.matchAll(/(?:font-size|padding|margin|gap)[^:;]*:\s*([^;{}]+);/g)]
      .map(([, value]) => value.trim())
      .filter((value) => /\d/.test(value) && !value.includes('var(') && value !== '0');

    expect(sizes, 'a stat sizes something outside the ramps').toEqual([]);
  });

  it('leaves the table to the table language', () => {
    // The same shape as "no skin file declares a `button` rule". Three components each wrote their
    // own table before #154 — borders, padding, a header treatment, and in one case a whole
    // phone flip — because the shared one was unusable: `main.css` drew a box around every cell in
    // literal `black`. It is rows now, and a component reaching for `table`, `th` or `td` is the
    // second implementation starting again.
    //
    // `DataTable` is the exception, because it *is* the shared one: it owns the flip, and the
    // `:global` rules that reach a caller's `<tr>` and `<td>` are why the callers no longer need
    // any of their own.
    const offenders = componentFiles().filter((path) => {
      if (path.endsWith('DataTable.svelte')) {
        return false;
      }
      const css = withoutComments(readFileSync(path, 'utf8'));
      const style = /<style>([\s\S]*)<\/style>/.exec(css)?.[1] ?? '';
      return /(?:^|[\s,{}])(?:table|thead|tbody|th|td)(?:[\s,:.[]|\s*\{)/m.test(style);
    });

    expect(offenders, 'a component writes its own table').toEqual([]);
  });

  it('draws no box around a stat', () => {
    // A block sits inside a panel, and a block that drew its own box is the nested box the panel
    // language refuses. Separation is the space ramp.
    for (const name of ['common/Stat.svelte', 'common/StatBlock.svelte']) {
      const css = withoutComments(readFileSync(join(COMPONENTS_DIR, name), 'utf8'));

      expect(css, `${name} draws a box`).not.toMatch(/(?:^|[;{])\s*(?:border|box-shadow)\s*:/);
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
