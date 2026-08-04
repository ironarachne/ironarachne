import { describe, expect, it } from 'vitest';
import { renderSceneToDataUrl } from '$lib/renderers/webgl_scene_draw';
import type { AstronomicalScene } from '$lib/renderers/astronomical_scene_types';

/**
 * The rest of this module needs a GL context and is covered by `webgl_scene_build.test.ts` on one
 * side and the golden images to come on the other. The empty case is the exception: it is answered
 * before any of that, and both backends have to answer it the same way.
 */
describe('the WebGL backend', () => {
  it('renders a scene with no bodies as an empty string, touching no canvas', () => {
    const scene: AstronomicalScene = {
      width: 640,
      height: 160,
      seed: 'seed',
      quality: 'full',
      background: { fillColor: '#030308', stars: [{ x: 1, y: 2, radiusPx: 0.5, alpha: 0.3 }] },
      bodies: [],
    };
    const document = {
      createElement: () => {
        throw new Error('a scene with nothing to show should not have made a canvas');
      },
    } as unknown as Document;

    expect(renderSceneToDataUrl(document, scene)).toBe('');
  });
});
