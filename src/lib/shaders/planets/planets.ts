import AridPlanetShader from "./arid_planet.frag";
import BarrenPlanetShader from "./barren_planet.frag";
import GardenPlanetShader from "./garden_planet.frag";
import GasGiantPlanetShader from "./gas_giant_planet.frag";
import IcePlanetShader from "./ice_planet.frag";
import JunglePlanetShader from "./jungle_planet.frag";
import OceanPlanetShader from "./ocean_planet.frag";
import SwampPlanetShader from "./swamp_planet.frag";
import ToxicPlanetShader from "./toxic_planet.frag";
import VolcanicPlanetShader from "./volcanic_planet.frag";

export function getFragmentShaderByName(name: string): string {
  if (name === "arid") {
    return AridPlanetShader;
  }
  if (name === "barren") {
    return BarrenPlanetShader;
  }
  if (name === "garden") {
    return GardenPlanetShader;
  }
  if (name === "gas giant") {
    return GasGiantPlanetShader;
  }
  if (name === "ice") {
    return IcePlanetShader;
  }
  if (name === "jungle") {
    return JunglePlanetShader;
  }
  if (name === "ocean") {
    return OceanPlanetShader;
  }
  if (name === "swamp") {
    return SwampPlanetShader;
  }
  if (name === "toxic") {
    return ToxicPlanetShader;
  }
  if (name === "volcanic") {
    return VolcanicPlanetShader;
  }
  return "";
}
