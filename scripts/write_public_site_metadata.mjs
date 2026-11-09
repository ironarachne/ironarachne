import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const build = 'build';
const origin = 'https://vastways.app';
const excluded = new Set(['recover/index.html', 'saved-data/index.html']);
const files = (await readdir(build, { recursive: true })).filter(
  (name) => (name === 'index.html' || name.endsWith('/index.html')) && !excluded.has(name),
);

const urls = await Promise.all(
  files.sort().map(async (name) => {
    const url = new URL(name.slice(0, -'index.html'.length), origin).href;
    const file = join(build, name);
    const html = await readFile(file, 'utf8');
    await writeFile(file, html.replace('</head>', `<link rel="canonical" href="${url}" /></head>`));
    return url;
  }),
);

const sitemap = `${origin}/sitemap.xml`;
await writeFile(
  join(build, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
await writeFile(join(build, 'robots.txt'), `User-agent: *\nSitemap: ${sitemap}\n`);
