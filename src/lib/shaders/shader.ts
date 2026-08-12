import type { Shader } from './shader_types';

export function createShader(name: string, shader: string): Shader {
  return { name, shader };
}
