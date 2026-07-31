import { expect, describe, it } from 'vitest';
import Shader from './shader';

describe('Shader', () => {
  it('stores the name and shader source it was constructed with', () => {
    const shader = new Shader('star', 'void main() {}');

    expect(shader.name).toBe('star');
    expect(shader.shader).toBe('void main() {}');
  });

  it('keeps instances independent of one another', () => {
    const first = new Shader('first', 'a');
    const second = new Shader('second', 'b');

    expect(first.name).toBe('first');
    expect(second.name).toBe('second');
  });

  it('accepts empty strings without substituting a default', () => {
    const shader = new Shader('', '');

    expect(shader.name).toBe('');
    expect(shader.shader).toBe('');
  });
});
