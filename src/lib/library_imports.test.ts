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
  // `renderers/index.ts` says the same about these two in its own header: the preview renderers
  // pull `three` and the shader graph, and the decision module reaches the DOM probe. Routing them
  // through the entry point added 700 KB to /planet, /star-system, and /star-nation.
  '$lib/renderers/astronomical_preview',
  '$lib/renderers/renderer_decision',
  // `/swn/starship` is a list-and-read page. Its library's entry point reaches a generator and
  // from there the species table — 19 MB, measured.
  //
  // The three `*_saved_state` modules were here for the same reason, for `/saved-data`. That page
  // is gone (#44) and nothing reaches past those entry points any more, so the exceptions went
  // with it: an allowlist that keeps entries after their reason has gone is how the rule rots
  // from the other end.
  '$lib/swn/starship',
  // The artifact kind registry, which everything in the workshop touches. Assembled through the
  // four libraries' entry points it costs 296 KB in the importing chunk; through these modules,
  // 4 KB. Each kind module holds metadata and validation only — its codec is a dynamic import,
  // which is what keeps 18 MB of charge art out of the chunk that merely lists a project.
  // `$lib/settlements` is the sharpest of the four: its entry point reaches `$lib/organizations`
  // and from there the heraldry generator and the charge library.
  '$lib/culture/culture_artifact_kind',
  '$lib/heraldry/heraldry_artifact_kind',
  '$lib/religion/religion_artifact_kind',
  '$lib/settlements/settlement_artifact_kind',
  // The fifth kind, measured the same way. `$lib/adnd`'s entry point re-exports the PDF renderer,
  // and from there jsPDF, along with the spell, class, race and equipment tables. Routed through
  // it the registry chunk goes from 25.4 KB to 50.2 KB — it very nearly doubles, and every page
  // that lists what a project contains pays the difference.
  '$lib/adnd/adnd_character_artifact_kind',
  // The sixth, and the same reason again: `$lib/characters`'s entry point reaches
  // `character_generation`, and from there the sentient species tables, the fantasy archetypes and
  // the heraldry generator. The kind module holds metadata and validation only.
  '$lib/characters/character_artifact_kind',
  // The seventh. `$lib/dcc`'s entry point re-exports the PDF renderer, and from there jsPDF, along
  // with four occupation tables and the lucky-sign table.
  '$lib/dcc/dcc_character_artifact_kind',
  // The eighth. `$lib/swn`'s entry point re-exports the PDF renderer, and jsPDF with it, along with
  // the focus, psychic, and starship tables. The kind module holds metadata and validation only.
  '$lib/swn/swn_character_artifact_kind',
  // The ninth. `$lib/unchartedworlds`'s entry point re-exports the PDF renderer, and jsPDF with it,
  // along with the career, origin and asset tables. The kind module holds metadata and validation
  // only.
  '$lib/unchartedworlds/uw_character_artifact_kind',
  // The tenth. `$lib/velgarth_gifts`'s entry point re-exports the gift table, which is four hundred
  // lines of setting prose. The kind module holds metadata and validation only.
  '$lib/velgarth_gifts/velgarth_gifts_artifact_kind',
  // The eleventh. `$lib/arms_manufacturer`'s entry point reaches the generator, and from there
  // `$lib/weapons` and the made-up-names package. The kind module holds metadata and validation
  // only.
  '$lib/arms_manufacturer/arms_manufacturer_artifact_kind',
  // The twelfth, and the vocabulary validator it composes. `$lib/encounters`'s entry point
  // reaches the generator, and from there the archetype and species tables and, through a
  // character's arms, the charge art; `$lib/creatures`'s reaches the species tables. Measured on
  // the build: the encounter kind module and everything it statically imports is 195 KB across
  // 16 chunks through these two paths, and 19.6 MB across 35 chunks through the entry points.
  '$lib/encounters/encounter_artifact_kind',
  '$lib/creatures/creature_snapshot',
  // The thirteenth. `$lib/families`'s entry point reaches the generator and the tree renderer,
  // and from there the character generator, the species tables and xmlbuilder2. Measured on the
  // build: the family kind module and everything it statically imports is 198 KB across 16 chunks through
  // this path and 19.6 MB across 35 chunks through the entry point.
  '$lib/families/family_artifact_kind',
  // The fourteenth. `$lib/organizations`'s entry point reaches the generator and the emblem
  // renderers, and from there the character generator, every kind's heraldry config and the
  // charge art. Measured on the build: the organization kind module and everything it statically
  // imports is 204 KB across 16 chunks through this path and 19.7 MB across 35 chunks through the entry point.
  '$lib/organizations/organization_artifact_kind',
  // The fifteenth. `$lib/civilizations`'s entry point reaches the civilization generator and the
  // made-up-names package, and through the star nation roll module the whole of
  // `$lib/astronomical_bodies`. The kind module holds metadata and validation only.
  '$lib/civilizations/star_nation_artifact_kind',
  // The seventeenth. `$lib/astronomical_bodies`'s entry point reaches the planet, star, moon and
  // star-system generators and, through the planet roll module, `$lib/civilizations`. Measured on
  // the build: through the kind module the registry chunk and everything it statically imports is
  // 140.7 KB across 16 chunks, and through the entry point it is 214.8 KB across 24.
  '$lib/astronomical_bodies/planet_artifact_kind',
  // The eighteenth, the same library and the same reason: the star-system kind module holds
  // metadata and validation only, and its codec is a dynamic import.
  '$lib/astronomical_bodies/star_system_artifact_kind',
  // There is deliberately no entry for `$lib/environment`. Its kind module was written to sit here
  // beside the other sixteen and the measurement said not to: through `$lib/environment`'s entry
  // point the registry chunk is 136.1 KB across 17 chunks, and through the kind module it is
  // 136.1 KB across 17 — the same, because the environment library is tables of numbers and five
  // small sub-generators, with no generator reaching a species list or an image. It is the first
  // kind in the readiness pass that did not need an exception, which is what this list is for.
  // The sixteenth. `$lib/dungeon`'s entry point reaches the dungeon generator, and from there the
  // encounter generator, the treasure hoard tables and the species tables. The kind module holds
  // metadata and validation only; its codec is a dynamic import, which is what keeps the
  // rehydrator's reach into the archetype tables and the charge art out of the registry's chunk.
  // Measured on the build, the way the entries above were: through this path the registry chunk
  // and everything it statically imports is 130 KB across 16 chunks, and through the entry point
  // it is 19.2 MB across 39 — the dungeon alone is the difference between those two figures.
  '$lib/dungeon/dungeon_artifact_kind',
]);

/**
 * A specifier ending in something other than a TS/JS extension is an asset, not a module.
 *
 * The Vite query is stripped first: an icon is imported as `…/cross.svg?raw`, which is the same
 * asset with an instruction about how to load it, and without this the rule reads the specifier as
 * ending in `raw` and asks for an entry point that an SVG does not have.
 */
function isAsset(specifier: string): boolean {
  const last = (specifier.split('?')[0] ?? '').split('/').pop() ?? '';
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
