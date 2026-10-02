/** Manual audit, not a timing gate. Run against a disposable Vite dev server (see the report). */
import { chromium } from '@playwright/test';
import { cpus } from 'node:os';
import { REGION_SEED_BANK } from '../test_fixtures/region_seeds';

const url = process.env.REGION_BENCH_URL ?? 'http://127.0.0.1:5173';
const uiUrl = process.env.REGION_BENCH_UI_URL ?? url;
const samples = 5;
const seeds = [
  ...new Set([...REGION_SEED_BANK.map(({ seed }) => seed), 'audit-0', 'audit-4', 'audit-6']),
];
const browser = await chromium.launch();
try {
  // This isolated context cannot touch the user's browser or vault.
  const context = await browser.newContext();
  const page = await context.newPage();
  // tsx preserves function names with this helper; serialized evaluate callbacks need it too.
  await page.addInitScript('globalThis.__name = (fn) => fn');
  // A static document provides the origin without mounting the app or its reload handlers.
  await page.goto(`${url}/manifest.json`);
  const measurements = await page.evaluate(
    async ({ seeds, samples }) => {
      // Vite serves these modules with their normal aliases. Module loading is outside timings.
      const regionPath = '/src/lib/regions/index.ts';
      const kindPath = '/src/lib/artifact_kinds/index.ts';
      const artifactPath = '/src/lib/artifacts/index.ts';
      const projectPath = '/src/lib/projects/index.ts';
      const filePath = '/src/lib/vault_file/index.ts';
      const regions = (await import(regionPath)) as typeof import('../src/lib/regions');
      const kinds = (await import(kindPath)) as typeof import('../src/lib/artifact_kinds');
      const artifacts = (await import(artifactPath)) as typeof import('../src/lib/artifacts');
      const projects = (await import(projectPath)) as typeof import('../src/lib/projects');
      const files = (await import(filePath)) as typeof import('../src/lib/vault_file');
      const registry = kinds.createArtifactKindRegistry();
      kinds.registerArtifactKind(registry, regions.regionArtifactKind);
      const source = await projects.createProject({ name: 'Benchmark source' });
      const target = await projects.createProject({ name: 'Benchmark import' });
      if (!source.ok || !target.ok) throw new Error('Cannot create benchmark projects');
      const bytes = (text: string) => new TextEncoder().encode(text).length;
      const summarize = (values: number[]) => {
        const sorted = [...values].sort((a, b) => a - b);
        return {
          median: sorted[Math.floor(sorted.length / 2)],
          max: sorted.at(-1),
          samples: values,
        };
      };
      // Warm generation, snapshot conversion, SVG and validation before measured runs.
      const warm = regions.rollRegionSnapshot('benchmark-warmup');
      regions.regionToMapSvg(warm);
      regions.validateRegionSnapshot(warm);
      const results = [];
      for (const seed of seeds) {
        const durations: Record<string, number[]> = {};
        async function timed<T>(name: string, operation: () => T | Promise<T>): Promise<T> {
          const start = performance.now();
          const result = await operation();
          (durations[name] ??= []).push(performance.now() - start);
          return result;
        }
        let sizes = {};
        let counts = {};
        let expected = '';
        let expectedSvg = '';
        for (let sample = 0; sample < samples; sample++) {
          const snapshot = await timed('generateSnapshot', () => regions.rollRegionSnapshot(seed));
          const json = await timed('stringify', () => JSON.stringify(snapshot));
          const svg = await timed('svg', () => regions.regionToMapSvg(snapshot));
          const markdown = await timed('markdown', () => regions.regionToMarkdown(snapshot));
          if (sample > 0 && (json !== expected || svg !== expectedSvg)) {
            throw new Error(`Non-deterministic output for ${seed}`);
          }
          expected = json;
          expectedSvg = svg;
          const checked = await timed('parseValidate', () =>
            regions.validateRegionSnapshot(JSON.parse(json)),
          );
          if (!checked.ok) throw new Error(checked.message);
          const saved = await timed('save', () =>
            artifacts.createArtifact(registry, {
              projectId: source.value.id,
              kind: 'region',
              payload: snapshot,
              provenance: { seed, toolPath: '/region', config: {} },
            }),
          );
          if (!saved.ok) throw new Error(saved.message);
          const exported = await timed('export', () =>
            files.buildArtifactExportFile(source.value.id, saved.value.id),
          );
          if (!exported.ok) throw new Error(exported.message);
          const imported = await timed('import', () =>
            files.importExportFile(registry, exported.value.text, {
              targetProjectId: target.value.id,
            }),
          );
          if (!imported.ok) throw new Error(imported.message);
          if (imported.summary.quarantined.length || imported.summary.artifactsAdded !== 1) {
            throw new Error('Import quarantined or lost the benchmark region');
          }
          const [summary] = artifacts.listArtifacts(target.value.id);
          const reopened = await timed('read', () =>
            artifacts.readArtifact(registry, target.value.id, summary.id),
          );
          if (
            !reopened?.ok ||
            files.canonicalJson(reopened.artifact.payload) !== files.canonicalJson(snapshot)
          ) {
            throw new Error('Imported payload changed');
          }
          sizes = {
            payload: bytes(json),
            map: bytes(JSON.stringify(snapshot.map)),
            facts: bytes(JSON.stringify(snapshot.facts ?? {})),
            svg: bytes(svg),
            markdown: bytes(markdown),
            exportFile: bytes(exported.value.text),
          };
          counts = {
            nodes: snapshot.map.nodes.length,
            edges: snapshot.map.edges.length,
            corners: snapshot.map.corners.length,
            settlements: snapshot.settlements.length,
            svgElements: new DOMParser().parseFromString(svg, 'image/svg+xml').querySelectorAll('*')
              .length,
            facts: Object.fromEntries(
              Object.entries(snapshot.facts ?? {})
                .filter(([, value]) => Array.isArray(value))
                .map(([key, value]) => [key, (value as unknown[]).length]),
            ),
          };
          await artifacts.deleteArtifact(source.value.id, saved.value.id);
          await artifacts.deleteArtifact(target.value.id, summary.id);
        }
        results.push({
          seed,
          bytes: sizes,
          counts,
          ms: Object.fromEntries(
            Object.entries(durations).map(([name, values]) => [name, summarize(values)]),
          ),
        });
      }
      return results;
    },
    { seeds, samples },
  );

  const ui = [];
  const cdp = await context.newCDPSession(page);
  for (const width of process.env.REGION_BENCH_SKIP_UI ? [] : [1280, 390, 320]) {
    const cpuThrottle = width < 768 ? 4 : 1;
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottle });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${uiUrl}/region`);
    await page.locator('img.region-map').waitFor();
    await page.getByLabel('Lock Seed').check();
    for (const seed of REGION_SEED_BANK.map(({ seed }) => seed)) {
      await page.getByLabel('Seed', { exact: true }).fill(seed);
      // Start in the browser before dispatching the real Generate button click. Include Svelte's
      // flush and image decoding; Playwright transport time is excluded.
      const generation = await page.evaluate(async () => {
        const button = [...document.querySelectorAll('button')].find(
          (node) => node.textContent?.trim() === 'Generate',
        );
        if (!button) throw new Error('Generate button missing');
        const start = performance.now();
        button.click();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const image = document.querySelector<HTMLImageElement>('img.region-map');
        if (!image) throw new Error('Region map missing');
        await image.decode();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        return performance.now() - start;
      });
      const zoom = await page.evaluate(async () => {
        const start = performance.now();
        const button = [...document.querySelectorAll('button')].find(
          (node) => node.textContent?.trim() === 'Zoom in',
        );
        if (!button) throw new Error('Zoom button missing');
        button.click();
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        return performance.now() - start;
      });
      const save = page.locator('.save-artifact');
      await save.getByRole('button', { name: 'Save to project' }).click();
      await save.getByLabel('Name', { exact: true }).fill(`Benchmark ${width} ${seed}`);
      const newProject = save.getByLabel('New project name', { exact: true });
      if (await newProject.isVisible()) await newProject.fill('UI benchmark');
      const saveMs = await page.evaluate(async () => {
        const root = document.querySelector('.save-artifact');
        if (!root) throw new Error('Save controls missing');
        const button = [...root.querySelectorAll('button')].find(
          (node) => node.textContent?.trim() === 'Save',
        );
        if (!button) throw new Error('Save button missing');
        const start = performance.now();
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            observer.disconnect();
            reject(new Error('Save timed out'));
          }, 30_000);
          const observer = new MutationObserver(() => {
            if (root.querySelector('[role="alert"]')) {
              clearTimeout(timeout);
              observer.disconnect();
              reject(new Error('Save failed'));
            } else if (root.querySelector('[role="status"]')?.textContent?.includes('Saved')) {
              clearTimeout(timeout);
              observer.disconnect();
              resolve();
            }
          });
          observer.observe(root, { subtree: true, childList: true, characterData: true });
          button.click();
        });
        return performance.now() - start;
      });
      const layout = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        localStorage: Object.keys(localStorage).map((key) => ({
          key,
          characters: localStorage.getItem(key)?.length ?? 0,
        })),
      }));
      if (layout.document > layout.viewport + 1)
        throw new Error(`Horizontal overflow at ${width}px`);
      ui.push({
        width,
        cpuThrottle,
        seed,
        generatePaintMs: generation,
        zoomPaintMs: zoom,
        saveMs,
        ...layout,
      });
      await page.getByRole('button', { name: 'Fit map', exact: true }).click();
    }
  }
  const storage = await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    const stores: Record<string, { records: number; blobBytes: number; jsonBytes: number }> = {};
    if (databases.some(({ name }) => name === 'ironarachne.vault')) {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('ironarachne.vault');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      for (const name of db.objectStoreNames) {
        const records = await new Promise<unknown[]>((resolve, reject) => {
          const request = db.transaction(name).objectStore(name).getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        stores[name] = {
          records: records.length,
          jsonBytes: new TextEncoder().encode(JSON.stringify(records)).length,
          blobBytes: records.reduce<number>(
            (total, record) =>
              total +
              Object.values(record as Record<string, unknown>).reduce<number>(
                (sum, value) => sum + (value instanceof Blob ? value.size : 0),
                0,
              ),
            0,
          ),
        };
      }
      db.close();
    }
    return { stores, estimate: await navigator.storage.estimate() };
  });
  console.log(
    JSON.stringify(
      {
        cpu: cpus()[0].model,
        node: process.version,
        browser: browser.version(),
        url,
        uiUrl,
        samples,
        measurements,
        ui,
        storage,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
