/**
 * One look at the machine: can it run WebGL at all, and is what it calls a GPU actually the CPU?
 *
 * This is the only module here that touches the DOM. It answers a question and returns data; what
 * to do about the answer is `renderer_decision.ts`, which is pure and is where the tests are.
 */

import type { RendererProbe } from './renderer_decision_types';

/**
 * Renderer strings that mean the fragments are being drawn by the CPU. This is the whole of what
 * `WEBGL_debug_renderer_info` is used for — not to tell a good GPU from a middling one, which the
 * string cannot support and which browsers increasingly refuse to answer.
 */
const SOFTWARE_RASTERIZER_NAMES = ['swiftshader', 'llvmpipe', 'software', 'microsoft basic render'];

export function isSoftwareRasterizerName(unmaskedRenderer: string): boolean {
  const name = unmaskedRenderer.toLowerCase();
  return SOFTWARE_RASTERIZER_NAMES.some((candidate) => name.includes(candidate));
}

function readUnmaskedRenderer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): string | undefined {
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (info === null) return undefined;
    const name = gl.getParameter(info.UNMASKED_RENDERER_WEBGL);
    return typeof name === 'string' ? name : undefined;
  } catch {
    // Some browsers refuse the extension outright as a fingerprinting surface. Not knowing what
    // the GPU is called is not a failure; it just means the timing budget is the only signal left.
    return undefined;
  }
}

/**
 * A probe context is a real context and browsers only allow so many at once, so this one is handed
 * back as soon as it has been read.
 */
function releaseProbeContext(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
  try {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    // Losing the probe context is hygiene, not correctness.
  }
}

export function probeRendererCapability(document: Document): RendererProbe {
  let canvas: HTMLCanvasElement;
  try {
    canvas = document.createElement('canvas');
  } catch {
    return { webglAvailable: false, softwareRasterizer: false };
  }

  try {
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl === null) {
      return { webglAvailable: false, softwareRasterizer: false };
    }

    const unmaskedRenderer = readUnmaskedRenderer(gl);
    releaseProbeContext(gl);

    return {
      webglAvailable: true,
      softwareRasterizer:
        unmaskedRenderer !== undefined && isSoftwareRasterizerName(unmaskedRenderer),
      ...(unmaskedRenderer === undefined ? {} : { unmaskedRenderer }),
    };
  } catch {
    // `getContext` itself throwing is rare but not impossible — a blocked context, an extension
    // that intercepts it. It means the same thing as a null context.
    return { webglAvailable: false, softwareRasterizer: false };
  } finally {
    canvas.remove();
  }
}
