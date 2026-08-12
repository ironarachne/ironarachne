import { expect, describe, it } from 'vitest';
import { createShader } from './shader';

describe('createShader', () => {
  it('stores the name and shader source it was given', () => {
    const shader = createShader('star', 'void main() {}');

    expect(shader.name).toBe('star');
    expect(shader.shader).toBe('void main() {}');
  });

  it('keeps results independent of one another', () => {
    const first = createShader('first', 'a');
    const second = createShader('second', 'b');

    expect(first.name).toBe('first');
    expect(second.name).toBe('second');
  });

  it('accepts empty strings without substituting a default', () => {
    const shader = createShader('', '');

    expect(shader.name).toBe('');
    expect(shader.shader).toBe('');
  });
});
