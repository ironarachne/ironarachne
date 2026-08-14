/**
 * Keeps cross-library imports on the entry points, which is the only thing that makes an entry
 * point an API boundary rather than a file to keep in sync for no benefit.
 *
 * This regressed once already, and quietly: issue #29 counted 849 deep imports across 39 libraries
 * that all had an `index.ts` sitting right there. Nothing failed, because a deep import type-checks
 * perfectly — it just pins the caller to a layout it has no business knowing, so moving a module
 * inside a library breaks files that never named it.
 *
 * The rule has three parts, and the third is why this cannot simply ban the string `$lib/x/y`:
 * a module reaching a *sibling* through its own library's entry point is how you get a circular
 * import, so within a library the relative path is the correct spelling.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

const repoRoot = resolve(__dirname, '../..');
const libRoot = join(repoRoot, 'src/lib');

/**
 * Deep imports that stay, each because routing it through the entry point would pull a heavy
 * subtree into a page that does not need it. Every one of these was measured against the build,
 * not guessed, and the call site carries the reason.
 *
 * Add to this list only with a build measurement behind it. "It felt heavy" is how the rule rots.
 */
const ALLOWED_DEEP_IMPORTS = new Set([
  // Statically imports every planet GLSL module; see the comment atop `shaders/index.ts`.
  '$lib/shaders/planets/planets',
  // `/saved-data` and `/swn/starship` are list-and-read pages. Their libraries' entry points all
  // reach a generator and from there the species table — 19 MB apiece, measured.
  '$lib/culture/culture_saved_state',
  '$lib/heraldry/heraldry_saved_state',
  '$lib/religion/religion_saved_state',
  '$lib/swn/starship',
]);

/** A specifier ending in something other than a TS/JS extension is an asset, not a module. */
function isAsset(specifier: string): boolean {
  const last = specifier.split('/').pop() ?? '';
  return /\.[a-z0-9]+$/i.test(last) && !/\.(ts|js)$/i.test(last);
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      sourceFiles(path, out);
    } else if (/\.(ts|js|svelte)$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

const libraries = new Set(
  readdirSync(libRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);

type Import = { file: string; specifier: string; ownerLib: string | null };

/**
 * Static `import`/`export ... from` specifiers only. A dynamic `import()` is deliberately out of
 * scope: those exist to split a chunk off, and routing one through a barrel would pull the whole
 * library back into the chunk it was split out of.
 */
function libImportsIn(text: string, file: string, ownerLib: string | null): Import[] {
  const parsed = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const found: Import[] = [];
  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier)) continue;
    if (specifier.text.startsWith('$lib/')) {
      found.push({ file, specifier: specifier.text, ownerLib });
    }
  }
  return found;
}

function collectImports(): Import[] {
  const files = ['src', 'scripts', 'e2e'].flatMap((dir) => sourceFiles(join(repoRoot, dir)));
  const found: Import[] = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const relativePath = relative(repoRoot, file);
    const ownerLib = relativePath.startsWith('src/lib/') ? relativePath.split('/')[2] : null;

    if (file.endsWith('.svelte')) {
      const openingTag = /<script\b[^>]*>/g;
      let match: RegExpExecArray | null;
      while ((match = openingTag.exec(text)) !== null) {
        const start = match.index + match[0].length;
        const end = text.indexOf('</script>', start);
        if (end === -1) continue;
        found.push(...libImportsIn(text.slice(start, end), relativePath, ownerLib));
      }
    } else {
      found.push(...libImportsIn(text, relativePath, ownerLib));
    }
  }
  return found;
}

const imports = collectImports();

describe('library imports', () => {
  it('finds the imports it is meant to be checking', () => {
    // Guards against the walk silently matching nothing and the suite passing on an empty set.
    expect(imports.length).toBeGreaterThan(500);
  });

  it('reaches other libraries through their entry point, not past it', () => {
    const deep = imports
      .filter(({ specifier, ownerLib }) => {
        const [, lib, ...rest] = specifier.split('/');
        if (!libraries.has(lib) || rest.length === 0) return false;
        if (lib === ownerLib) return false; // covered by the relative-path check below
        if (isAsset(specifier) || ALLOWED_DEEP_IMPORTS.has(specifier)) return false;
        return true;
      })
      .map(
        ({ file, specifier }) =>
          `${file}: '${specifier}' should import from '$lib/${specifier.split('/')[1]}'`,
      );

    expect(deep).toEqual([]);
  });

  it('spells an entry point as the bare directory', () => {
    const explicit = imports
      .filter(({ specifier }) => /^\$lib\/[^/]+\/index(\.[jt]s)?$/.test(specifier))
      .map(
        ({ file, specifier }) =>
          `${file}: '${specifier}' should be '${specifier.replace(/\/index(\.[jt]s)?$/, '')}'`,
      );

    expect(explicit).toEqual([]);
  });

  it('keeps a library talking to its own modules by relative path', () => {
    const selfReferential = imports
      .filter(({ specifier, ownerLib }) => {
        const [, lib, ...rest] = specifier.split('/');
        return ownerLib !== null && lib === ownerLib && rest.length > 0 && !isAsset(specifier);
      })
      .map(({ file, specifier }) => `${file}: '${specifier}' should be a relative path`);

    expect(selfReferential).toEqual([]);
  });
});
