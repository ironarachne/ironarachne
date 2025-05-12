import { clamp, linearMap } from "$lib/math_translation";

export type AstronomicalBody = {
  name: string;
  description: string;
  albedo: number; // 0 to 1
  axis_of_rotation: number; // in degrees
  classification: string;
  gravity: number; // in m/s^2
  has_atmosphere: boolean;
  has_ring_system: boolean;
  luminosity: number; // in 10^26 W
  mass: number; // in 10^24 kg
  orbital_distance: number; // in AU
  orbital_period: number; // in Earth days
  radius: number; // in km
  rotation_period: number; // in Earth hours
  surface_pressure: number; // in atm
  surface_temperature: number; // in Kelvin
}

export const stefanBoltzmannConstant = 5.670374419e-8;

export function convertAUToKM(au: number): number {
  return au * 149597870.7; // 1 AU = 149,597,870.7 km
}

export function convertSolarLuminosityToWatts(solarLuminosity: number): number {
  return solarLuminosity * 3.828e26;
}

export function convertSolarRadiusToKM(solarRadius: number): number {
  return solarRadius * 695700; // 1 Solar Radius = 695,700 km
}

export function convertSolarMassToKG(solarMass: number): number {
  return solarMass * 1.9891e30;
}

export function convertKGToSolarMass(kg: number): number {
  return kg / 1.9891e30;
}

export function convertKMToAU(km: number): number {
  return km / 149597870.7; // 1 AU = 149,597,870.7 km
}

export function convertKMToSolarRadius(km: number): number {
  return km / 695700; // 1 Solar Radius = 695,700 km
}

export function convertStandardGravityToMPS2(standardGravity: number): number {
  return standardGravity * 9.80665; // 1 Standard Gravity = 9.80665 m/s^2
}

export function convertMPS2ToStandardGravity(mps2: number): number {
  return mps2 / 9.80665; // 1 Standard Gravity = 9.80665 m/s^2
}

export function convertWattsToSolarLuminosity(watts: number): number {
  return watts / 3.828e26;
}

export function getAlbedoFromTemperature(temperature: number): number {
  return 0.26 + 0.74 * temperature ** -1.5;
}

export function getGravityFromMassAndRadius(mass: number, radius: number): number {
  // Note: mass is in kg x 10^24, radius is in km
  
  // The formula for gravity is g = G * M / r^2
  // where G is the gravitational constant (6.67408e-11 m^3 kg^-1 s^-2), M is the mass, and r is the radius
  const G = 6.67408e-11; // m^3 kg^-1 s^-2
  const radius_m = radius * 1000; // convert km to m
  const mass_kg = mass * 1e24; // convert kg x 10^24 to kg

  const gravity = (G * mass_kg) / (radius_m ** 2); // in m/s^2
  return gravity; // in m/s^2
}

export function getSolarTemperature(luminosity: number, radius: number): number {
  // This is based on the Stefan-Boltzmann law
  return (luminosity * 4 * Math.PI * radius ** 2) ** 0.25 / stefanBoltzmannConstant;
}

export function getPlanetTemperature(atmosphere_density: number, orbital_distance: number, star_temperature: number): number {
  // We approximate average planet temperature based on atmosphere density in atmospheres, distance from the star(s) in AU, and star temperature in Kelvin
  // The average temperature of the Earth is 288.15 Kelvin, so Earth numbers should get to a number close to that

  // Sun's temperature is 5772 Kelvin

  // The Earth's atmosphere density is 1
  // The Earth's orbital distance is 1
  // The Earth's temperature is 288.15 Kelvin

  // Venus's atmosphere density is 92
  // Venus's orbital distance is 0.723
  // Venus's temperature is 737.85 Kelvin

  // Mars's atmosphere density is 0.01
  // Mars's orbital distance is 1.524
  // Mars's temperature is 210.15 Kelvin

  const temperature_factor = clamp(star_temperature / 50000.0, 0.0, 1.0); // 50000 is the maximum temperature we are considering
  const base_temperature = 100;

  const a = 4.3763;
  const b = 5.6483;
  const c = 3;
  const d = 0;

  let planet_temperature = base_temperature + base_temperature * temperature_factor * 1.95;
  planet_temperature = planet_temperature * Math.log(a * atmosphere_density + b) - c * orbital_distance + d;

  return planet_temperature;
}
