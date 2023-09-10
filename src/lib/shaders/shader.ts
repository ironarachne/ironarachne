export default class Shader {
  name: string;
  shader: string;

  constructor(name: string, shader: string) {
    this.name = name;
    this.shader = shader;
  }
}
