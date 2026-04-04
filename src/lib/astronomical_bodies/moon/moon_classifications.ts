import type { MoonClassification } from './moons';

export function getMoonClassificationByName(name: string): MoonClassification {
  const classifications = getMoonClassifications();
  const classification = classifications.find((c) => c.name === name);
  if (!classification) {
    throw new Error(`Moon classification "${name}" not found.`);
  }
  return classification;
}

export function getStandardMoonClassifications(): MoonClassification[] {
  // Returns classifications for the most common types of moons
  let moons = getMoonClassifications();

  moons = moons.filter((moon) => moon.name !== 'gaseous'); // Exclude gaseous moons as they are rare
  moons = moons.filter((moon) => moon.name !== 'volcanic'); // Exclude volcanic moons as they are less common

  return moons;
}

export function getMoonClassifications(): MoonClassification[] {
  return [
    {
      name: 'rocky',
      description: 'A rocky moon with a rugged surface and minimal atmosphere.',
      has_atmosphere: false,
      orbital_distance_min: 0.001, // in AU; the Earth's moon is about 0.00257 AU from Earth
      orbital_distance_max: 0.01,
      orbital_period_min: 5,
      orbital_period_max: 30,
      radius_min: 50, // in km; Earth's moon is about 1737 km
      radius_max: 4000,
      surface_pressure_min: 0,
      surface_pressure_max: 0,
      mass_min: 0.001, // in 10^24 kg; Earth's moon is about 0.073 kg
      mass_max: 0.2,
      getRandomDescription() {
        return 'A rocky moon with craters and mountains.';
      },
    },
    {
      name: 'icy',
      description: 'An icy moon with a thick layer of ice covering its surface.',
      has_atmosphere: false,
      orbital_distance_min: 0.001,
      orbital_distance_max: 0.01,
      orbital_period_min: 5,
      orbital_period_max: 30,
      radius_min: 50,
      radius_max: 4000,
      surface_pressure_min: 0,
      surface_pressure_max: 0,
      mass_min: 0.001,
      mass_max: 0.2,
      getRandomDescription() {
        return 'An icy moon with frozen lakes and geysers.';
      },
    },
    {
      name: 'gaseous',
      description: 'A large moon with a thick atmosphere composed mainly of hydrogen and helium.',
      has_atmosphere: true,
      orbital_distance_min: 0.001,
      orbital_distance_max: 0.01,
      orbital_period_min: 10,
      orbital_period_max: 30,
      radius_min: 20000, // gas moons are basically gas giants, so they can be quite large
      radius_max: 40000,
      surface_pressure_min: 0.0005,
      surface_pressure_max: 5,
      mass_min: 550,
      mass_max: 1900,
      getRandomDescription() {
        return 'A gaseous moon with swirling clouds and storms.';
      },
    },
    {
      name: 'volcanic',
      description: 'A volcanic moon with active volcanoes and a thin atmosphere.',
      has_atmosphere: true,
      orbital_distance_min: 0.001,
      orbital_distance_max: 0.01,
      orbital_period_min: 15,
      orbital_period_max: 40,
      radius_min: 1500,
      radius_max: 4000,
      surface_pressure_min: 1,
      surface_pressure_max: 50,
      mass_min: 0.01,
      mass_max: 0.5,
      getRandomDescription() {
        return 'A volcanic moon with lava flows and ash clouds.';
      },
    },
  ];
}
