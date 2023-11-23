import BasicVertexShader from "../basic-vertex.vert";
import Shader from "../shader";
import Arid from "./arid.frag";
import Barren from "./barren.frag";
import * as BumpyVertexShader from "./bumpy";
import Clouds from "./clouds.frag";
import Garden from "./garden.frag";
import * as GasCloudShader from "./gas-cloud";
import * as GasFragmentShader from "./gas-fragment";
import Ice from "./ice.frag";
import Jungle from "./jungle.frag";
import Ocean from "./ocean.frag";
import type PlanetShaderSet from "./shader_set";
import Swamp from "./swamp.frag";
import Toxic from "./toxic.frag";
import Volcanic from "./volcanic.frag";

export function cloud(): Shader[] {
  return [
    new Shader("arid", Clouds),
    new Shader("barren", Clouds),
    new Shader("garden", Clouds),
    new Shader("gas giant", GasCloudShader.generate()),
    new Shader("ice", Clouds),
    new Shader("jungle", Clouds),
    new Shader("ocean", Clouds),
    new Shader("swamp", Clouds),
    new Shader("toxic", Clouds),
    new Shader("volcanic", Clouds),
  ];
}

export function fragment(): Shader[] {
  return [
    new Shader("arid", Arid),
    new Shader("barren", Barren),
    new Shader("garden", Garden),
    new Shader("gas giant", GasFragmentShader.generate()),
    new Shader("ice", Ice),
    new Shader("jungle", Jungle),
    new Shader("ocean", Ocean),
    new Shader("swamp", Swamp),
    new Shader("toxic", Toxic),
    new Shader("volcanic", Volcanic),
  ];
}

export function vertex(): Shader[] {
  return [
    new Shader("arid", BasicVertexShader),
    new Shader("barren", BumpyVertexShader.generate()),
    new Shader("garden", BasicVertexShader),
    new Shader("gas giant", BasicVertexShader),
    new Shader("ice", BasicVertexShader),
    new Shader("jungle", BasicVertexShader),
    new Shader("ocean", BasicVertexShader),
    new Shader("swamp", BasicVertexShader),
    new Shader("toxic", BasicVertexShader),
    new Shader("volcanic", BasicVertexShader),
  ];
}

export function getSetByName(name: string): PlanetShaderSet {
  return {
    cloud: cloud().find((shader) => shader.name === name)?.shader || "",
    fragment: fragment().find((shader) => shader.name === name)?.shader || "",
    vertex: vertex().find((shader) => shader.name === name)?.shader || "",
  };
}
