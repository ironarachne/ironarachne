import { describe, expect, it } from 'vitest';
import { isSoftwareRasterizerName, probeRendererCapability } from './renderer_probe';

const UNMASKED_RENDERER_WEBGL = 37446;

type FakeContextOptions = {
  /** What `WEBGL_debug_renderer_info` reports, or nothing if the browser refuses the extension. */
  unmaskedRenderer?: string;
  extensionThrows?: boolean;
};

function fakeDocument(
  contexts: Record<string, FakeContextOptions | undefined>,
  { createThrows = false, getContextThrows = false } = {},
) {
  const lost: string[] = [];

  function makeContext(options: FakeContextOptions) {
    return {
      getExtension: (name: string) => {
        if (name === 'WEBGL_lose_context') {
          return { loseContext: () => lost.push('lost') };
        }
        if (options.extensionThrows) throw new Error('blocked');
        if (options.unmaskedRenderer === undefined) return null;
        return { UNMASKED_RENDERER_WEBGL };
      },
      getParameter: (parameter: number) =>
        parameter === UNMASKED_RENDERER_WEBGL ? options.unmaskedRenderer : undefined,
    };
  }

  const canvas = {
    getContext: (kind: string) => {
      if (getContextThrows) throw new Error('context creation blocked');
      const options = contexts[kind];
      return options === undefined ? null : makeContext(options);
    },
    remove: () => {},
  };

  return {
    document: {
      createElement: () => {
        if (createThrows) throw new Error('no DOM');
        return canvas;
      },
    } as unknown as Document,
    lost,
  };
}

describe('isSoftwareRasterizerName', () => {
  it.each([
    'Google SwiftShader',
    'Mesa/X.org llvmpipe (LLVM 15.0.7, 256 bits)',
    'Microsoft Basic Render Driver',
    'Software Rasterizer',
  ])('recognises %s as the CPU pretending to be a GPU', (name) => {
    expect(isSoftwareRasterizerName(name)).toBe(true);
  });

  it.each([
    'ANGLE (NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)',
    'Apple M2',
    'Mesa Intel(R) UHD Graphics 620',
  ])('leaves %s alone', (name) => {
    expect(isSoftwareRasterizerName(name)).toBe(false);
  });
});

describe('probing the machine', () => {
  it('prefers WebGL 2 and reports the renderer it found', () => {
    const fake = fakeDocument({ webgl2: { unmaskedRenderer: 'Apple M2' } });

    expect(probeRendererCapability(fake.document)).toEqual({
      webglAvailable: true,
      softwareRasterizer: false,
      unmaskedRenderer: 'Apple M2',
    });
  });

  it('falls back to WebGL 1', () => {
    const fake = fakeDocument({ webgl: { unmaskedRenderer: 'Mesa Intel(R) UHD Graphics 620' } });

    expect(probeRendererCapability(fake.document).webglAvailable).toBe(true);
  });

  it('flags a software rasterizer', () => {
    const fake = fakeDocument({ webgl2: { unmaskedRenderer: 'Google SwiftShader' } });

    expect(probeRendererCapability(fake.document)).toEqual({
      webglAvailable: true,
      softwareRasterizer: true,
      unmaskedRenderer: 'Google SwiftShader',
    });
  });

  it('reports no WebGL when neither context can be had', () => {
    const fake = fakeDocument({});

    expect(probeRendererCapability(fake.document)).toEqual({
      webglAvailable: false,
      softwareRasterizer: false,
    });
  });

  it('hands the probe context straight back', () => {
    // Browsers cap how many live contexts a page may hold, and this one has done its job.
    const fake = fakeDocument({ webgl2: { unmaskedRenderer: 'Apple M2' } });
    probeRendererCapability(fake.document);

    expect(fake.lost).toEqual(['lost']);
  });

  it('treats a browser that hides the renderer name as capable, not as software', () => {
    // Refusing the extension is a fingerprinting defence, not a statement about the GPU. The
    // timing budget is the only signal left, and it is enough.
    const fake = fakeDocument({ webgl2: {} });

    expect(probeRendererCapability(fake.document)).toEqual({
      webglAvailable: true,
      softwareRasterizer: false,
    });
  });

  it('survives an extension read that throws', () => {
    const fake = fakeDocument({ webgl2: { extensionThrows: true } });

    expect(probeRendererCapability(fake.document)).toEqual({
      webglAvailable: true,
      softwareRasterizer: false,
    });
  });

  it('survives a browser that throws instead of returning null', () => {
    const fake = fakeDocument({}, { getContextThrows: true });

    expect(probeRendererCapability(fake.document).webglAvailable).toBe(false);
  });

  it('survives having no DOM to probe with', () => {
    const fake = fakeDocument({}, { createThrows: true });

    expect(probeRendererCapability(fake.document)).toEqual({
      webglAvailable: false,
      softwareRasterizer: false,
    });
  });
});
