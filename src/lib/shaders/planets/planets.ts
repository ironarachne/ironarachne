import AridPlanetShader from './arid_planet.frag';
import BarrenPlanetShader from './barren_planet.frag';
import GardenPlanetShader from './garden_planet.frag';
import GasGiantPlanetShader from './gas_giant_planet.frag';
import IcePlanetShader from './ice_planet.frag';
import JunglePlanetShader from './jungle_planet.frag';
import OceanPlanetShader from './ocean_planet.frag';
import SwampPlanetShader from './swamp_planet.frag';
import ToxicPlanetShader from './toxic_planet.frag';
import VolcanicPlanetShader from './volcanic_planet.frag';

export function getFragmentShaderByName(name: string): string {
  if (name === 'arid planet') {
    return AridPlanetShader;
  }
  if (name === 'barren planet') {
    return BarrenPlanetShader;
  }
  if (name === 'garden planet') {
    return GardenPlanetShader;
  }
  if (name === 'gas giant planet') {
    return GasGiantPlanetShader;
  }
  if (name === 'ice planet') {
    return IcePlanetShader;
  }
  if (name === 'jungle planet') {
    return JunglePlanetShader;
  }
  if (name === 'ocean planet') {
    return OceanPlanetShader;
  }
  if (name === 'swamp planet') {
    return SwampPlanetShader;
  }
  if (name === 'toxic planet') {
    return ToxicPlanetShader;
  }
  if (name === 'volcanic planet') {
    return VolcanicPlanetShader;
  }
  return '';
}
