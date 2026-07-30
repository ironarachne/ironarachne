import { createServer, type Server } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUILD_DIR = fileURLToPath(new URL('../build/', import.meta.url));

/** The document a bucket website returns for a key it cannot resolve. */
const ERROR_DOCUMENT = '404.html';

/** The document a bucket website returns for a key ending in `/`. */
const INDEX_DOCUMENT = 'index.html';

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

function contentTypeFor(key: string): string {
  const dot = key.lastIndexOf('.');
  return (dot === -1 ? undefined : CONTENT_TYPES[key.slice(dot)]) ?? 'application/octet-stream';
}

/**
 * Maps a request path to an object key the way static object-storage hosting
 * does: an exact key, or `<prefix>/index.html` when the path ends in a slash.
 *
 * Deliberately no extension guessing and no add-the-missing-slash redirect.
 * `vite preview` does both, which is why it cannot prove that a build is
 * hostable on a bucket — a suite that only exercises the preview server passes
 * happily while every deep link 404s in production.
 */
function keyFor(pathname: string): string {
  const withoutLeadingSlash = pathname.replace(/^\/+/, '');
  if (withoutLeadingSlash === '') {
    return INDEX_DOCUMENT;
  }
  return withoutLeadingSlash.endsWith('/')
    ? `${withoutLeadingSlash}${INDEX_DOCUMENT}`
    : withoutLeadingSlash;
}

async function readKey(key: string): Promise<Buffer | undefined> {
  // Reject traversal outside the build directory rather than serving it.
  const resolved = join(BUILD_DIR, normalize(key));
  if (!resolved.startsWith(BUILD_DIR.endsWith(sep) ? BUILD_DIR : `${BUILD_DIR}${sep}`)) {
    return undefined;
  }

  try {
    const stats = await stat(resolved);
    if (!stats.isFile()) {
      return undefined;
    }
    return await readFile(resolved);
  } catch {
    return undefined;
  }
}

export type StaticHost = {
  origin: string;
  close: () => Promise<void>;
};

/**
 * Serves `build/` with bucket-website resolution semantics on an ephemeral port,
 * so the hosting contract can be asserted without a real bucket.
 */
export async function startStaticHost(): Promise<StaticHost> {
  const server: Server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    const body = await readKey(keyFor(pathname));

    if (body) {
      response.writeHead(200, { 'content-type': contentTypeFor(keyFor(pathname)) });
      response.end(body);
      return;
    }

    const errorBody = await readKey(ERROR_DOCUMENT);
    response.writeHead(404, { 'content-type': 'text/html' });
    response.end(errorBody ?? 'Not Found');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('static host did not bind to a TCP port');
  }

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

/** The URL a route is reachable at once routes are emitted as directories. */
export function canonicalPath(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

export { BUILD_DIR, ERROR_DOCUMENT };
